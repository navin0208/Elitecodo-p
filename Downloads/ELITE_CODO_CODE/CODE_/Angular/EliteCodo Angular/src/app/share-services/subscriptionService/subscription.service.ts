import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpmethodsService } from '../httpMethodService/httpmethods.service';
import { 
  SubscriptionPlan, 
  UserLicense, 
  PlanCustomization,
  LicenseValidationRequest,
  LicenseValidationResponse,
  LicenseExtensionRequest
} from 'src/app/shared/AllModel';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  // Default plans configuration with duration support
  private readonly DEFAULT_PLANS: SubscriptionPlan[] = [
    {
      id: 'student',
      name: 'Student',
      role: 'student',
      basePrice: 100,
      defaultTeachers: 0,
      defaultStudents: 1,
      extraTeacherPrice: 0,
      extraStudentPrice: 0,
      maxExtraTeachers: 0,
      maxExtraStudents: 0,
      availableDurations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      defaultDuration: 1,
      features: [
        'Self Test Creation (Full)',
        'Full Content Access',
        'Parent Communication',
        'Unlimited Question Access',
        'Personal Dashboard',
        '24/7 Agentic Support'
      ],
      isActive: true,
      color: '#4f46e5',
      icon: 'fa-user-graduate'
    },
    {
      id: 'teacher',
      name: 'Teacher',
      role: 'teacher',
      basePrice: 200,
      defaultTeachers: 0,
      defaultStudents: 10,
      extraTeacherPrice: 0,
      extraStudentPrice: 50,
      maxExtraTeachers: 0,
      maxExtraStudents: 50,
      availableDurations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      defaultDuration: 1,
      features: [
        'Classroom Management',
        'Unlimited Question Access',
        'Parent Communication',
        'Class-wide Analytics',
        'Self Test & Content Access',
        'Direct Email Support'
      ],
      isActive: true,
      color: '#0ea5e9',
      icon: 'fa-chalkboard-teacher'
    },
    {
      id: 'institution',
      name: 'Institution',
      role: 'institute',
      minTeachers: 10,
      minStudents: 10,
      teacherPrice: 200,
      studentPrice: 100,
      basePrice: 0,
      availableDurations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  // ✅ FIXED
      defaultDuration: 1,
      features: [
        'Organization-wide Metrics',
        'Admin Panel & License Controls',
        'License-based Management',
        'Built User Import (CSV)',
        'Custom Institutional Branding',
        'Dedicated Account Manager'
      ],
      isActive: true,
      color: '#8b5cf6',
      icon: 'fa-building-columns'
    }
  ];

  constructor(private http: HttpmethodsService) {}

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.getRequest('api/subscription/plans').pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return this.DEFAULT_PLANS;
      }),
      catchError(() => {
        return of(this.DEFAULT_PLANS);
      })
    );
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.DEFAULT_PLANS.find(p => p.id === planId);
  }

  /**
   * Calculate plan customization with duration
   */
  calculatePlanCustomization(
    planId: string,
    selectedTeachers: number = 0,
    selectedStudents: number = 0,
    durationInMonths: number = 1
  ): PlanCustomization | null {
    const plan = this.getPlanById(planId);
    if (!plan) return null;

    // For Institution plan
    if (plan.role === 'institute') {
      const minTeachers = plan.minTeachers || 10;
      const minStudents = plan.minStudents || 10;
      const finalTeachers = Math.max(selectedTeachers, minTeachers);
      const finalStudents = Math.max(selectedStudents, minStudents);
      const teacherPrice = plan.teacherPrice || 200;
      const studentPrice = plan.studentPrice || 100;
      
      // Monthly price
      const monthlyPrice = (finalTeachers * teacherPrice) + (finalStudents * studentPrice);
      // Total price = monthly × duration
      const totalPrice = monthlyPrice * durationInMonths;

      return {
        planId: plan.id,
        role: plan.role,
        selectedTeachers: finalTeachers,
        selectedStudents: finalStudents,
        teacherPrice: teacherPrice,
        studentPrice: studentPrice,
        durationInMonths: durationInMonths,
        baseTeachers: 0,
        baseStudents: 0,
        extraTeachers: 0,
        extraStudents: 0,
        totalTeachers: finalTeachers,
        totalStudents: finalStudents,
        basePrice: 0,
        totalPrice: totalPrice,
        monthlyPrice: monthlyPrice,
        selectedPlan: plan
      };
    }

    // For Student/Teacher plans
    const baseTeachers = plan.defaultTeachers || 0;
    const baseStudents = plan.defaultStudents || 0;
    const extraTeachers = selectedTeachers > 0 ? selectedTeachers : 0;
    const extraStudents = selectedStudents > 0 ? selectedStudents : 0;
    const totalTeachers = baseTeachers + extraTeachers;
    const totalStudents = baseStudents + extraStudents;
    
    const extraTeacherPrice = extraTeachers * (plan.extraTeacherPrice || 0);
    const extraStudentPrice = extraStudents * (plan.extraStudentPrice || 0);
    const monthlyPrice = (plan.basePrice || 0) + extraTeacherPrice + extraStudentPrice;
    const totalPrice = monthlyPrice * durationInMonths;

    return {
      planId: plan.id,
      role: plan.role,
      selectedTeachers: totalTeachers,
      selectedStudents: totalStudents,
      teacherPrice: plan.extraTeacherPrice || 0,
      studentPrice: plan.extraStudentPrice || 0,
      durationInMonths: durationInMonths,
      baseTeachers: baseTeachers,
      baseStudents: baseStudents,
      extraTeachers: extraTeachers,
      extraStudents: extraStudents,
      totalTeachers: totalTeachers,
      totalStudents: totalStudents,
      basePrice: plan.basePrice || 0,
      totalPrice: totalPrice,
      monthlyPrice: monthlyPrice,
      selectedPlan: plan
    };
  }

  /**
   * Create license for user after signup
   */
  createLicense(userId: string, customization: PlanCustomization): Observable<any> {
    const licenseData = {
      userId: userId,
      planId: customization.planId,
      role: customization.role,
      maxTeachers: customization.totalTeachers,
      maxStudents: customization.totalStudents,
      extraTeachers: customization.extraTeachers || 0,
      extraStudents: customization.extraStudents || 0,
      durationInMonths: customization.durationInMonths,
      totalAmountPaid: customization.totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.http.postRequest('api/license/create', licenseData);
  }

  /**
   * Extend license (Super Admin only)
   */
  extendLicense(request: LicenseExtensionRequest): Observable<any> {
    return this.http.postRequest('api/license/extend', request);
  }

  getUserLicense(userId: string): Observable<UserLicense> {
    return this.http.getRequest(`api/license/user/${userId}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        throw new Error('License not found');
      })
    );
  }

  validateLicense(request: LicenseValidationRequest): Observable<LicenseValidationResponse> {
    return this.http.postRequest('api/license/validate', request).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return {
          isValid: false,
          message: 'Validation failed',
          currentCount: request.currentCount,
          maxLimit: request.maxLimit,
          remainingSlots: 0,
          canProceed: false
        };
      })
    );
  }

  updateLicenseUsage(
    userId: string, 
    entityType: 'teacher' | 'student', 
    action: 'add' | 'remove'
  ): Observable<any> {
    return this.http.postRequest('api/license/update-usage', {
      userId,
      entityType,
      action
    });
  }

  canCreateEntity(userId: string, entityType: 'teacher' | 'student'): Observable<{
    canCreate: boolean;
    currentCount: number;
    maxLimit: number;
    remaining: number;
    message: string;
  }> {
    return this.http.getRequest(`api/license/can-create/${userId}/${entityType}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return {
          canCreate: false,
          currentCount: 0,
          maxLimit: 0,
          remaining: 0,
          message: 'Unable to validate license'
        };
      })
    );
  }

  getLicenseSummary(userId: string): Observable<any> {
    return this.http.getRequest(`api/license/summary/${userId}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return null;
      })
    );
  }

  activateLicense(userId: string, paymentId: string): Observable<any> {
    return this.http.postRequest('api/license/activate', {
      userId,
      paymentId,
      status: 'active',
      paymentStatus: 'completed'
    });
  }

  getMaxExtras(planId: string): { maxTeachers: number; maxStudents: number } {
    const plan = this.getPlanById(planId);
    if (!plan) return { maxTeachers: 0, maxStudents: 0 };
    return {
      maxTeachers: plan.maxExtraTeachers || 0,
      maxStudents: plan.maxExtraStudents || 0
    };
  }

  getMinValues(planId: string): { minTeachers: number; minStudents: number } {
    const plan = this.getPlanById(planId);
    if (!plan) return { minTeachers: 10, minStudents: 10 };
    return {
      minTeachers: plan.minTeachers || 10,
      minStudents: plan.minStudents || 10
    };
  }

  getAvailableDurations(planId: string): number[] {
    const plan = this.getPlanById(planId);
    return plan?.availableDurations || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  getDefaultDuration(planId: string): number {
    const plan = this.getPlanById(planId);
    return plan?.defaultDuration || 1;
  }
}
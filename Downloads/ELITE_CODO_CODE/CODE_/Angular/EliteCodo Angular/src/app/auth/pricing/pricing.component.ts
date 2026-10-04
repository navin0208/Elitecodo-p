import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface PricingPlan {
  id: string;
  name: string;
  role: string;
  price: number;
  description: string;
  features: string[];
  color: string;
  icon: string;
  isPopular?: boolean;
  // Institution specific
  minTeachers?: number;
  minStudents?: number;
  teacherPrice?: number;
  studentPrice?: number;
  // Teacher specific
  basePrice?: number;
  defaultStudents?: number;
  extraStudentPrice?: number;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  role: string = 'institute';
  plans: PricingPlan[] = [];
  selectedPlan: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.role = data['role'] || this.route.snapshot.queryParams['role'] || 'institute';
      this.loadPlans();
    });

    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.role = params['role'];
        this.loadPlans();
      }
    });
  }

  loadPlans(): void {
    if (this.role === 'teacher') {
      this.plans = this.getTeacherPlans();
    } else {
      this.plans = this.getInstitutePlans();
    }
  }

  getTeacherPlans(): PricingPlan[] {
    return [
      {
        id: 'teacher',
        name: 'Teacher',
        role: 'teacher',
        price: 200,
        description: 'For Educators and Tutors',
        color: '#0ea5e9',
        icon: 'fa-chalkboard-teacher',
        basePrice: 200,
        defaultStudents: 10,
        extraStudentPrice: 50,
        features: [
          'Classroom Management',
          'Unlimited Question Access',
          'Parent Communication',
          'Class-wide Analytics',
          'Self Test & Content Access',
          'Direct Email Support'
        ]
      }
    ];
  }

  getInstitutePlans(): PricingPlan[] {
    return [
      {
        id: 'institution',
        name: 'Institution',
        role: 'institute',
        price: 0,
        description: 'For Schools, Colleges, and Bootcamps',
        color: '#8b5cf6',
        icon: 'fa-building-columns',
        minTeachers: 10,
        minStudents: 10,
        teacherPrice: 200,
        studentPrice: 100,
        isPopular: true,
        features: [
          'Organization-wide Metrics',
          'Admin Panel & License Controls',
          'License-based Management',
          'Built User Import (CSV)',
          'Custom Institutional Branding',
          'Dedicated Account Manager',
          '24/7 Priority Support'
        ]
      }
    ];
  }

  selectPlan(planId: string): void {
    this.selectedPlan = planId;
    const plan = this.plans.find(p => p.id === planId);
    if (plan) {
      this.router.navigate(['/auth/signup'], {
        queryParams: { plan: plan.id, role: plan.role }
      });
    }
  }

  getMonthlyPrice(plan: PricingPlan): string {
    if (plan.role === 'institute') {
      const monthlyTotal = (plan.minTeachers! * plan.teacherPrice!) + (plan.minStudents! * plan.studentPrice!);
      return monthlyTotal.toLocaleString();
    }
    return plan.basePrice?.toLocaleString() || '0';
  }

  getAnnualPrice(plan: PricingPlan): string {
    if (plan.role === 'institute') {
      const monthlyTotal = (plan.minTeachers! * plan.teacherPrice!) + (plan.minStudents! * plan.studentPrice!);
      return (monthlyTotal * 12).toLocaleString();
    }
    return ((plan.basePrice || 0) * 12).toLocaleString();
  }

  getRoleTitle(): string {
    return this.role === 'teacher' ? 'Teacher' : 'Institution';
  }

  getRoleSubtitle(): string {
    return this.role === 'teacher' 
      ? 'Select a plan tailored to your teaching needs' 
      : 'Select a plan tailored to your institutional goals';
  }
}
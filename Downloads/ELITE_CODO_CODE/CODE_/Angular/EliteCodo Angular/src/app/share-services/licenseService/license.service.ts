import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpmethodsService } from '../httpMethodService/httpmethods.service';
import { UserLicense, LicenseValidationResponse } from 'src/app/shared/AllModel';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  constructor(private http: HttpmethodsService) {}

  /**
   * Check if institute can add more teachers
   */
  canInstituteAddTeacher(instituteId: string): Observable<{
    canAdd: boolean;
    currentTeachers: number;
    maxTeachers: number;
    remaining: number;
  }> {
    return this.http.getRequest(`api/license/institute/${instituteId}/can-add-teacher`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return {
          canAdd: false,
          currentTeachers: 0,
          maxTeachers: 0,
          remaining: 0
        };
      }),
      catchError(() => {
        return of({
          canAdd: false,
          currentTeachers: 0,
          maxTeachers: 0,
          remaining: 0
        });
      })
    );
  }

  /**
   * Check if institute/teacher can add more students
   */
  canAddStudent(entityId: string, role: 'institute' | 'teacher'): Observable<{
    canAdd: boolean;
    currentStudents: number;
    maxStudents: number;
    remaining: number;
  }> {
    return this.http.getRequest(`api/license/${role}/${entityId}/can-add-student`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return {
          canAdd: false,
          currentStudents: 0,
          maxStudents: 0,
          remaining: 0
        };
      }),
      catchError(() => {
        return of({
          canAdd: false,
          currentStudents: 0,
          maxStudents: 0,
          remaining: 0
        });
      })
    );
  }

  /**
   * Get license for current user
   */
  getCurrentUserLicense(): Observable<UserLicense | null> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return of(null);
    }
    return this.http.getRequest(`api/license/user/${userId}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Get license usage statistics
   */
  getLicenseUsage(userId: string): Observable<any> {
    return this.http.getRequest(`api/license/usage/${userId}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return {
          totalTeachers: 0,
          totalStudents: 0,
          maxTeachers: 0,
          maxStudents: 0,
          usedPercentage: 0
        };
      })
    );
  }

  /**
   * Check license status
   */
  checkLicenseStatus(userId: string): Observable<{
    status: 'active' | 'expired' | 'suspended' | 'pending';
    daysRemaining: number;
    isExpiringSoon: boolean;
  }> {
    return this.http.getRequest(`api/license/status/${userId}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return {
          status: 'pending',
          daysRemaining: 0,
          isExpiringSoon: false
        };
      })
    );
  }
}
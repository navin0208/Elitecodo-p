// exam-security.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ExamSecurityService {
    constructor(private http: HttpClient) { }

    // Validate if student has access to the test
    validateTestAccess(studentId: number, testId: number): Observable<any> {
        return this.http.get(`api/test/validateTestAccess?studentId=${studentId}&testId=${testId}`);
    }

    // Check if test was already attempted
    checkTestAttempted(studentId: number, testId: number): Observable<boolean> {
        return this.http.get<{ attempted: boolean }>(
            `api/test/checkTestAttempted?studentId=${studentId}&testId=${testId}`
        ).pipe(
            map(response => response.attempted)
        );
    }

    // Record test session activity
    recordTestSession(studentId: number, testId: number, action: string): Observable<any> {
        return this.http.post('api/test/recordTestSession', {
            studentId,
            testId,
            action,
            timestamp: new Date().toISOString()
        });
    }

    // Token validation
    validateTestToken(token: string): Observable<{ valid: boolean }> {
        return this.http.post<{ valid: boolean }>('api/test/validateTestToken', { token });
    }

    // Generate secure token
    generateTestSessionToken(studentId: number, testId: number): Observable<{ token: string }> {
        return this.http.post<{ token: string }>('api/test/generateTestToken', {
            studentId,
            testId,
            timestamp: new Date().toISOString()
        });
    }

    // Check test timing validity
    isTestAvailable(testData: any): boolean {
        if (!testData?.testDate || !testData?.startTime || !testData?.endTime) {
            return false;
        }

        const now = new Date();
        const testDate = new Date(testData.testDate);

        const [startHours, startMinutes] = testData.startTime.split(':');
        const [endHours, endMinutes] = testData.endTime.split(':');

        const startTime = new Date(testDate);
        startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

        const endTime = new Date(testDate);
        endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

        return now >= startTime && now <= endTime;
    }

    private getDeviceInfo(): any {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
    }
}
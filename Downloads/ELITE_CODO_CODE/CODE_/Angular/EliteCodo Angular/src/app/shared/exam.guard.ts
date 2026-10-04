import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExamPortalGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {

        // Check if user came from join-test component
        const navigation = this.router.getCurrentNavigation();
        const isFromJoinTest = navigation?.extras?.state?.['fromJoinTest'] === true;

        // Check session storage for required data
        const studentId = sessionStorage.getItem('studentId');
        const testId = sessionStorage.getItem('testId');
        const testName = sessionStorage.getItem('testName');
        const examStartTime = sessionStorage.getItem('examStartTime');

        // Check if all required data is present
        if (!studentId || !testId || !testName) {
            console.warn('Missing required exam data');
            this.redirectToJoinTest(route);
            return false;
        }

        // Check if exam session is valid (not expired)
        if (examStartTime) {
            const startTime = new Date(examStartTime);
            const currentTime = new Date();
            const timeDiff = (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // in hours

            // If more than 4 hours have passed, session is expired
            if (timeDiff > 4) {
                console.warn('Exam session expired');
                this.clearExamSession();
                this.redirectToJoinTest(route);
                return false;
            }
        }

        // Check if exam was already submitted
        const examSubmitted = sessionStorage.getItem('examSubmitted');
        if (examSubmitted === 'true') {
            console.warn('Exam already submitted');
            const boardName = route.paramMap.get('name');
            this.router.navigate([`/student/${boardName}/exam-completion`]);
            return false;
        }

        // Check if direct URL access (without proper navigation)
        if (!isFromJoinTest && !this.isValidExamSession()) {
            console.warn('Direct URL access blocked');
            this.redirectToJoinTest(route);
            return false;
        }

        // Set exam start time if not already set
        if (!examStartTime) {
            sessionStorage.setItem('examStartTime', new Date().toISOString());
        }

        return true;
    }

    private isValidExamSession(): boolean {
        // Additional validation logic
        const examStartTime = sessionStorage.getItem('examStartTime');
        const studentId = sessionStorage.getItem('studentId');
        const testId = sessionStorage.getItem('testId');

        return !!(examStartTime && studentId && testId);
    }

    private redirectToJoinTest(route: ActivatedRouteSnapshot): void {
        const boardName = route.paramMap.get('name');
        this.router.navigate([`/student/${boardName}/join-test`]);
    }

    private clearExamSession(): void {
        sessionStorage.removeItem('examStartTime');
        sessionStorage.removeItem('testId');
        sessionStorage.removeItem('testName');
        sessionStorage.removeItem('examSubmitted');
    }
}
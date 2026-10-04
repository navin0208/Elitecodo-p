import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExamSecurityService {

    private securityViolations: string[] = [];
    private tabSwitchCount = 0;
    private examStartTime: Date | null = null;

    // Observable to track security status
    private securityStatus$ = new BehaviorSubject<{
        violations: string[];
        tabSwitches: number;
        isSecure: boolean;
    }>({
        violations: [],
        tabSwitches: 0,
        isSecure: true
    });

    constructor() { }

    // Initialize security monitoring for an exam
    initializeExamSecurity(): void {
        this.examStartTime = new Date();
        this.securityViolations = [];
        this.tabSwitchCount = 0;
        this.updateSecurityStatus();
    }

    // Record a security violation
    recordViolation(violation: string): void {
        this.securityViolations.push(`${new Date().toISOString()}: ${violation}`);
        this.updateSecurityStatus();
    }

    // Record tab switch
    recordTabSwitch(): void {
        this.tabSwitchCount++;
        this.recordViolation(`Tab switch #${this.tabSwitchCount}`);
        this.updateSecurityStatus();
    }

    // Get current security status
    getSecurityStatus(): Observable<any> {
        return this.securityStatus$.asObservable();
    }

    // Check if exam session is valid
    isValidExamSession(): boolean {
        const requiredKeys = ['studentId', 'testId', 'testName', 'examStartTime'];
        return requiredKeys.every(key => sessionStorage.getItem(key));
    }

    // Check if exam has expired
    isExamExpired(maxHours: number = 4): boolean {
        const startTime = sessionStorage.getItem('examStartTime');
        if (!startTime) return true;

        const start = new Date(startTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - start.getTime()) / (1000 * 60 * 60);

        return hoursDiff > maxHours;
    }

    // Get security summary for submission
    getSecuritySummary(): any {
        return {
            violations: this.securityViolations,
            tabSwitchCount: this.tabSwitchCount,
            examDuration: this.examStartTime ?
                Math.floor((new Date().getTime() - this.examStartTime.getTime()) / 1000) : 0,
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };
    }

    // Clear security data
    clearSecurityData(): void {
        this.securityViolations = [];
        this.tabSwitchCount = 0;
        this.examStartTime = null;
        this.updateSecurityStatus();
    }

    // Update security status observable
    private updateSecurityStatus(): void {
        const isSecure = this.securityViolations.length < 5 && this.tabSwitchCount < 3;

        this.securityStatus$.next({
            violations: [...this.securityViolations],
            tabSwitches: this.tabSwitchCount,
            isSecure
        });
    }

    // Prevent common cheating methods
    preventCheating(): void {
        // Disable text selection
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });

        // Disable drag
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        // Disable print
        window.addEventListener('beforeprint', (e) => {
            e.preventDefault();
            this.recordViolation('Attempted to print');
        });

        // Monitor for multiple instances
        this.checkMultipleInstances();
    }

    // Check for multiple browser instances
    private checkMultipleInstances(): void {
        const instanceId = Date.now().toString();
        sessionStorage.setItem('examInstanceId', instanceId);

        // Check every 5 seconds
        setInterval(() => {
            const currentInstanceId = sessionStorage.getItem('examInstanceId');
            if (currentInstanceId !== instanceId) {
                this.recordViolation('Multiple exam instances detected');
            }
        }, 5000);
    }

    // Enable full-screen mode (optional)
    requestFullScreen(): void {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
    }

    // Monitor full-screen exit
    monitorFullScreen(): void {
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.recordViolation('Exited full-screen mode');
            }
        });
    }
}
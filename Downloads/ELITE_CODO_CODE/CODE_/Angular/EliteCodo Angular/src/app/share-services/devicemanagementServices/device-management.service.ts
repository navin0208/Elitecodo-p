// device-management.service.ts
import { Injectable } from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DeviceInfo {
    deviceId: string;
    userAgent: string;
    timestamp: Date;
    ipAddress?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
    role: string;
    deviceInfo: DeviceInfo;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: any;
    message?: string;
    forceLogoutOtherDevices?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DeviceManagementService {

    constructor(private http: HttpmethodsService) { }

    // Generate a unique device fingerprint
    generateDeviceFingerprint(): string {
        // Combine more persistent identifiers
        const components = [
            navigator.userAgent,
            navigator.platform,
            screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
            new Date().getTimezoneOffset(),
            navigator.language,
            navigator.hardwareConcurrency || 'unknown',
            (navigator as any).deviceMemory || 'unknown',
            // Add more stable identifiers
            window.localStorage ? 'localStorage' : 'no-localStorage',
            window.sessionStorage ? 'sessionStorage' : 'no-sessionStorage'
        ];

        // Create a more unique fingerprint
        return btoa(components.join('|')).substring(0, 32);
    }

    // Get current device information
    getCurrentDeviceInfo(): DeviceInfo {
        return {
            deviceId: this.generateDeviceFingerprint(),
            userAgent: navigator.userAgent,
            timestamp: new Date(),
            ipAddress: '' // Get from backend or WebRTC (note: IP may change)
        };
    }

    // Check if user can login from this device based on role
    canLoginFromDevice(role: string, userId: string, deviceInfo: DeviceInfo): Observable<boolean> {
        const payload = {
            role: role,
            userId,
            deviceInfo
        };
        console.log({ canLoginFromDevice: payload });

        return this.http.postRequest('api/auth/check-device-access', payload).pipe(
            map((response: any) => response.canLogin || false),
            catchError(() => of(true)) // Allow login if service is unavailable
        );
    }

    isDeviceRegistered(userId: string, deviceId: string): Observable<boolean> {
        return this.http.getRequest(`api/auth/check-device/${userId}/${deviceId}`).pipe(
            map((response: any) => response.registered || false),
            catchError(() => of(false))
        );
    }

    // Logout specific device
    logoutDevice(userId: string, deviceId: string): Observable<any> {
        return this.http.postRequest('api/auth/logout-device', { userId, deviceId });
    }

    // Register device for user
    registerDevice(userId: string, role: string, deviceInfo: DeviceInfo): Observable<any> {
        const payload = {
            userId,
            role: role,
            deviceInfo
        };
        console.log({ registerdevice: payload });

        return this.http.postRequest('api/auth/register-device', payload);
    }

    // Force logout from other devices (for single device roles)
    forceLogoutOtherDevices(userId: string, currentDeviceId: string): Observable<any> {
        const payload = {
            userId,
            currentDeviceId
        };

        console.log({ forceLogoutOtherDevices: payload });

        return this.http.postRequest('api/auth/force-logout-other-devices', payload);
    }

    // Get user's active devices
    getUserActiveDevices(userId: string): Observable<DeviceInfo[]> {
        return this.http.getRequest(`api/auth/user-devices/${userId}`).pipe(
            map((response: any) => response.devices || []),
            catchError(() => of([]))
        );
    }

    // Check if role allows multiple devices
    allowsMultipleDevices(role: string): boolean {
        // Normalize the role string for comparison
        const normalizedRole = role.toLowerCase().replace('role_', '');
        const multiDeviceRoles = ['parent', 'superadmin'];
        return multiDeviceRoles.includes(normalizedRole);
    }

    // Store device info in local storage for session management
    storeDeviceSession(userId: string, role: string, deviceId: string): void {
        const sessionData = {
            userId,
            role,
            deviceId,
            loginTime: new Date().toISOString()
        };

        // Store in both sessionStorage and localStorage
        sessionStorage.setItem('currentDeviceSession', JSON.stringify(sessionData));
        localStorage.setItem('deviceSession', JSON.stringify(sessionData));
    }

    // Get stored device session
    getDeviceSession(): any {
        const sessionData = localStorage.getItem('deviceSession');
        return sessionData ? JSON.parse(sessionData) : null;
    }

    // Clear device session
    clearDeviceSession(): void {
        localStorage.removeItem('deviceSession');
        sessionStorage.removeItem('currentDeviceSession');
    }

    // Validate current session
    validateCurrentSession(): Observable<boolean> {
        const session = this.getDeviceSession();
        if (!session) return of(false);

        // Cross-check with sessionStorage to prevent tampering
        const currentSession = sessionStorage.getItem('currentDeviceSession');
        if (!currentSession || currentSession !== JSON.stringify(session)) {
            return of(false);
        }

        const payload = {
            userId: session.userId,
            deviceId: session.deviceId,
            role: session.role
        };

        return this.http.postRequest('api/auth/validate-session', payload).pipe(
            map((response: any) => response.valid || false),
            catchError(() => of(false))
        );
    }

    // Check for active sessions
    hasActiveSession(userId: string): Observable<boolean> {
        return this.http.getRequest(`api/auth/active-session/${userId}`).pipe(
            map((response: any) => response.hasActiveSession || false),
            catchError(() => of(false))
        );
    }

    // Get current active session info
    getActiveSessionInfo(userId: string): Observable<DeviceInfo | null> {
        return this.http.getRequest(`api/auth/active-session-info/${userId}`).pipe(
            map((response: any) => response.sessionInfo || null),
            catchError(() => of(null))
        );
    }

    // Terminate all other sessions
    terminateOtherSessions(userId: string, currentDeviceId: string): Observable<any> {
        return this.http.postRequest('api/auth/terminate-other-sessions', {
            userId,
            currentDeviceId
        });
    }
}
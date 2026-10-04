import { Injectable } from '@angular/core';
import { HttpmethodsService } from './httpMethodService/httpmethods.service';
import { MainURL } from '../ConfigUrl/config';

interface LogoutRoleWiseRequest {
    id: number;
    userRole: string;
}

@Injectable({
    providedIn: 'root'
})
export class LogoutService {
    private isLogoutInProgress = false;
    private eventListenersAdded = false;
    private lastActivityTime = Date.now();
    private visibilityTimer: any;
    baseUrl = MainURL.HostURL;


    constructor(private http: HttpmethodsService) { }

    // Call this method when user successfully logs in
    // initializeTabCloseLogout() {
    //     if (this.eventListenersAdded) {
    //         return; // Prevent duplicate listeners
    //     }

    //     this.setupTabCloseLogout();
    //     this.eventListenersAdded = true;
    // }

    // // Setup event listeners for tab close
    // private setupTabCloseLogout() {
    //     // Primary method: beforeunload with sendBeacon for immediate logout
    //     window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    //     // Backup methods
    //     window.addEventListener('unload', this.handleUnload.bind(this));
    //     window.addEventListener('pagehide', this.handlePageHide.bind(this));

    //     // Visibility change with improved logic
    //     document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    //     // Track user activity to differentiate between tab switch and close
    //     this.trackUserActivity();
    // }

    // private trackUserActivity() {
    //     const updateActivity = () => {
    //         this.lastActivityTime = Date.now();
    //     };

    //     // Track various user interactions
    //     ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
    //         document.addEventListener(eventType, updateActivity, { passive: true });
    //     });
    // }

    // private handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //     console.log('handleBeforeUnload - attempting logout');

    //     // Use sendBeacon for reliable logout on tab close
    //     this.sendBeaconLogout();

    //     // Don't prevent the user from leaving
    //     // return undefined; // or don't return anything
    // }

    // private handleUnload = (event: Event) => {
    //     console.log('handleUnload - attempting logout');
    //     this.sendBeaconLogout();
    // }

    // private handlePageHide = (event: PageTransitionEvent) => {
    //     console.log('handlePageHide - attempting logout');

    //     // Check if it's persisted (back/forward cache) - don't logout in this case
    //     if (event.persisted) {
    //         console.log('Page going to back/forward cache - not logging out');
    //         return;
    //     }

    //     this.sendBeaconLogout();
    // }

    // private handleVisibilityChange = () => {
    //     console.log('handleVisibilityChange - visibility:', document.visibilityState);

    //     if (document.visibilityState === 'hidden') {
    //         // Clear any existing timer
    //         if (this.visibilityTimer) {
    //             clearTimeout(this.visibilityTimer);
    //         }

    //         // Set a timer to logout after a delay
    //         // This helps differentiate between tab switching and tab closing
    //         this.visibilityTimer = setTimeout(() => {
    //             console.log('Tab has been hidden for too long - logging out');
    //             this.logWithSession();
    //         }, 5000); // 5 seconds delay

    //     } else if (document.visibilityState === 'visible') {
    //         // Tab became visible again - cancel logout
    //         if (this.visibilityTimer) {
    //             console.log('Tab became visible again - canceling logout');
    //             clearTimeout(this.visibilityTimer);
    //             this.visibilityTimer = null;
    //         }
    //     }
    // }

    // Synchronous logout using sendBeacon API
    // private sendBeaconLogout() {
    //     if (this.isLogoutInProgress) {
    //         return;
    //     }

    //     const userRole = localStorage.getItem('userRole');
    //     const userId = userRole === 'student'
    //         ? Number(sessionStorage.getItem('studentId'))
    //         : Number(sessionStorage.getItem('teacherId'));

    //     if (!userId || !userRole) {
    //         console.error('User ID or role not found for beacon logout');
    //         return;
    //     }

    //     const request: LogoutRoleWiseRequest = {
    //         id: userId,
    //         userRole: String(userRole)
    //     };

    //     // Construct the logout URL
    //     const logoutUrl = this.getFullApiUrl('api/logout-role-wise'); // Adjust endpoint as needed

    //     try {
    //         // Use sendBeacon for reliable delivery
    //         const success = navigator.sendBeacon(
    //             logoutUrl,
    //             JSON.stringify(request)
    //         );

    //         if (success) {
    //             console.log('Beacon logout request sent successfully');
    //             // Clear storage immediately
    //             // this.clearStorage();
    //         } else {
    //             console.warn('Beacon logout request failed to queue');
    //             // Fallback to regular logout
    //             this.logWithSession();
    //         }
    //     } catch (error) {
    //         console.error('Error sending beacon logout:', error);
    //         // Fallback to regular logout
    //         this.logWithSession();
    //     }
    // }

    // Helper method to get full API URL
    // private getFullApiUrl(endpoint: string): string {
    //     // Adjust this based on your API structure
    //     const baseUrl = window.location.origin;
    //     return `${baseUrl}/${endpoint}`;
    // }

    // Regular logout method (for logout button and fallback)
    logWithSession() {
        if (this.isLogoutInProgress) {
            return;
        }

        const userRole = localStorage.getItem('userRole');
        const userId = userRole === 'student'
            ? Number(sessionStorage.getItem('studentId'))
            : Number(sessionStorage.getItem('teacherId'));

        if (!userId || !userRole) {
            console.error('User ID or role not found');
            return;
        }

        const request: LogoutRoleWiseRequest = {
            id: userId,
            userRole: String(userRole)
        };

        this.isLogoutInProgress = true;

        this.http.logoutRoleWise(request.id, request).subscribe({
            next: (response) => {
                console.log('Logout successful', response);
                // this.cleanup();
                this.http.logout();
            },
            error: (err) => {
                console.error('Logout failed', err);
                this.isLogoutInProgress = false;
            }
        });
    }
    logWithSessionBeacon() {
        const userRole = localStorage.getItem('userRole');
        const userId = userRole === 'student'
            ? Number(sessionStorage.getItem('studentId'))
            : Number(sessionStorage.getItem('teacherId'));

        if (!userId || !userRole) {
            console.error('User ID or role not found');
            return;
        }

        const request: LogoutRoleWiseRequest = {
            id: userId,
            userRole: String(userRole)
        };

        const blob = new Blob([JSON.stringify(request)], {
            type: 'application/json'
        });

        navigator.sendBeacon(`${this.baseUrl}api/auth/logout/logout/${userId}`, blob);
    }


    // Clear storage immediately
    // private clearStorage() {
    //     sessionStorage.clear();
    //     localStorage.removeItem('userRole');
    // }

    // Clean up method
    // private cleanup() {
    //     this.isLogoutInProgress = false;
    //     // this.clearStorage();
    //     this.removeEventListeners();
    // }

    // Remove event listeners
    // private removeEventListeners() {
    //     console.log('removeEventListeners');

    //     if (!this.eventListenersAdded) return;

    //     // Clear any pending timers
    //     if (this.visibilityTimer) {
    //         clearTimeout(this.visibilityTimer);
    //         this.visibilityTimer = null;
    //     }

    //     window.removeEventListener('beforeunload', this.handleBeforeUnload);
    //     window.removeEventListener('unload', this.handleUnload);
    //     window.removeEventListener('pagehide', this.handlePageHide);
    //     document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    //     this.eventListenersAdded = false;
    // }

    // // Call this method when component is destroyed or user logs out
    // destroy() {
    //     this.removeEventListeners();
    //     this.isLogoutInProgress = false;
    // }

    // // Manual logout method for logout button
    // manualLogout() {
    //     // Clear any pending timers
    //     if (this.visibilityTimer) {
    //         clearTimeout(this.visibilityTimer);
    //         this.visibilityTimer = null;
    //     }

    //     this.logWithSession();
    // }
}
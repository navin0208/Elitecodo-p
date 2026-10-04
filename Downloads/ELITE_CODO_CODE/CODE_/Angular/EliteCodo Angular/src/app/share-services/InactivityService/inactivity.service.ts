import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HttpmethodsService } from '../httpMethodService/httpmethods.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private idleTime = 0;
  private idleTimeout = 15; // Default timeout in minutes
  private idleCheckInterval: any;
  private initializedEvents = false;
  private warningShown = false;
  constructor(
    private router: Router,
    private http: HttpmethodsService,
    private ngZone: NgZone
  ) { }

  // Initialize the idle monitor
  // Initialize the idle monitor
  init(timeoutInMinutes: number = 120): void {
    this.idleTimeout = timeoutInMinutes;

    // Clear any existing interval
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }

    // Reset idle time on user activity
    if (!this.initializedEvents) {
      this.setupActivityListeners();
      this.initializedEvents = true;
    }

    // Start the idle check interval (check every minute)
    this.idleCheckInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.checkIdle();
      });
    }, 60000); // Check every minute

    // Reset idle time on initialization
    this.resetIdleTime();
    this.warningShown = false;
  }

  // Set up listeners for user activity
  private setupActivityListeners(): void {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    events.forEach((eventName) => {
      document.addEventListener(
        eventName,
        () => {
          // If the user moves after the warning is shown, reset everything
          if (this.warningShown) {
            this.warningShown = false;
            Swal.close(); // Close any open warning
          }
          this.resetIdleTime();
        },
        true
      );
    });
  }

  // Reset the idle timer
  private resetIdleTime(): void {
    this.idleTime = 0;
  }

  // Check if user has been idle
  private checkIdle(): void {
    this.idleTime++;

    // Show warning 10 seconds before logout
    // If we're 10 seconds away from timeout (assuming timeout is in minutes)
    const timeoutInSeconds = this.idleTimeout * 60;
    const currentIdleTimeInSeconds = this.idleTime * 60;

    if (this.idleTime >= this.idleTimeout - 1 && !this.warningShown) {
      this.showLogoutWarning();
    }

    // If user has been idle for longer than the timeout, log them out
    if (this.idleTime >= this.idleTimeout) {
      this.logout();
    }
  }
  // Show 10-second warning notification
  private showLogoutWarning(): void {
    this.warningShown = true;

    Swal.fire({
      title: 'Auto-Logout Warning',
      text: 'You will be logged out in 10 seconds due to inactivity.',
      icon: 'warning',
      toast: true,
      position: 'top-end',
      timer: 10000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  // Log the user out
  logout(): void {
    // Close any open warnings
    Swal.close();

    // Remove stored data
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('adminId');

    // Call your HTTP logout service
    this.http.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Logout error:', err);
        // Navigate anyway for safety
        this.router.navigate(['/']);
      },
    });

    // Clear the interval
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
  }

  // Call this method when component is destroyed
  stopMonitoring(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
  }
}

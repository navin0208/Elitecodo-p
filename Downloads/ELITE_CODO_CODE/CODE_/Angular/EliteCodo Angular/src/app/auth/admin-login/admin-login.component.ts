import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, fromEvent, interval, map, of, switchMap, throttleTime } from 'rxjs';
import { DeviceManagementService } from 'src/app/share-services/devicemanagementServices/device-management.service';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { adminLogin } from 'src/app/shared/AllModel';
import { authsigninUrl } from 'src/app/shared/allURL';

export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  timestamp: Date;
  ipAddress?: string;
}

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent implements OnInit {
  adminLoginModel = new adminLogin();
  private readonly ROLE_KEY = 'userRole';
  notificationService = inject(NotificationService);
  http = inject(HttpmethodsService);
  rout = inject(Router);
  deviceService = inject(DeviceManagementService);

  buttonText = 'Log In';
  isSubmitting: boolean = false;
  passwordFieldType: string = 'password';
  backButton: HTMLElement | null;

  // Device management properties
  currentDeviceInfo!: DeviceInfo;
  showDeviceWarning: boolean = false;
  deviceWarningMessage: string = '';
  isAutoLoggingIn: boolean = false;
  activeSessionInfo: any = null;
  showForceLogoutOption: boolean = false;
  isForceLogoutInProgress: boolean = false;
  currentUserId: number | null = null;
  authResponse: any = null;

  constructor() {
    this.backButton = null;
    this.currentDeviceInfo = this.deviceService.getCurrentDeviceInfo();
    console.log({ currentDeviceInfo: this.currentDeviceInfo });
  }

  ngOnInit(): void {
    // Check for auto-login before setting up other components
    this.checkAutoLogin();

    this.backButton = document.querySelector('.back-button') as HTMLElement;
    if (this.backButton) {
      this.backButton.addEventListener('click', this.backAnim.bind(this));
    }

    // Start session heartbeat
    this.startSessionHeartbeat();
  }

  /**
   * Check if user is already logged in and auto-redirect
   */
  checkAutoLogin(): void {
    const userRole = localStorage.getItem('userRole');
    const adminId = sessionStorage.getItem('adminId');
    const deviceSession = this.deviceService.getDeviceSession();

    // Check if user was previously logged in as admin and session is valid
    if ((userRole === 'ROLE_ADMIN') && adminId && deviceSession) {
      // Validate the current session
      this.deviceService.validateCurrentSession().subscribe(
        (isValid: boolean) => {
          if (isValid) {
            this.isAutoLoggingIn = true;
            this.buttonText = 'Auto Logging In...';

            setTimeout(() => {
              this.redirectToDashboard();
            }, 5000);
          } else {
            // Session invalid, clear stored data
            this.clearStoredLoginData();
            this.deviceService.clearDeviceSession();
          }
        },
        () => {
          // Error validating session, clear data to be safe
          this.clearStoredLoginData();
          this.deviceService.clearDeviceSession();
        }
      );
    }
  }

  /**
   * Clear stored login data
   */
  clearStoredLoginData(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('backgroundColor');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('adminId');
    sessionStorage.removeItem('adminprofilePicture');
    sessionStorage.removeItem('adminlogoImage');
    sessionStorage.removeItem('adminwatermarkImage');
    sessionStorage.removeItem('userFullName');
    sessionStorage.removeItem('className');
    sessionStorage.removeItem('currentDeviceSession');
    sessionStorage.removeItem('teacherId');
    sessionStorage.removeItem('studentId');
  }

  startSessionHeartbeat(): void {
    interval(300000) // 5 minutes
      .pipe(
        switchMap(() => this.deviceService.validateCurrentSession())
      )
      .subscribe(isValid => {
        if (!isValid && this.currentUserId) {
          this.logout();
        }
      });
  }

  logout(): void {
    if (this.currentUserId) {
      this.deviceService.logoutDevice(this.currentUserId.toString(), this.currentDeviceInfo.deviceId)
        .subscribe(() => {
          this.deviceService.clearDeviceSession();
          this.clearStoredLoginData();
          this.rout.navigate(['/']);
        });
    }
  }

  backAnim() {
    if (this.backButton) {
      if (this.backButton.classList.contains('back')) {
        this.backButton.classList.remove('back');
      } else {
        this.backButton.classList.add('back');
        setTimeout(() => this.backAnim(), 1000);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  /**
   * Get device type
   */
  getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'MOBILE';
    if (/tablet/i.test(ua)) return 'TABLET';
    return 'DESKTOP';
  }

  /**
   * Get device name
   */
  getDeviceName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android Device';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'Mac';
    return 'Unknown Device';
  }

  /**
   * Check if error message indicates a database unique result error
   */
  private isDatabaseUniqueError(errorMessage: string): boolean {
    if (!errorMessage) return false;
    
    const lowerMessage = errorMessage.toLowerCase();
    return (
      lowerMessage.includes('query did not return a unique result') ||
      lowerMessage.includes('nonuniqueresultexception') ||
      lowerMessage.includes('non unique result') ||
      lowerMessage.includes('multiple results') ||
      lowerMessage.includes('duplicate entry') ||
      lowerMessage.includes('duplicate email')
    );
  }

  /**
   * Check if error message indicates an expired account
   */
  private isExpiredAccountError(errorMessage: string): boolean {
    if (!errorMessage) return false;
    
    const lowerMessage = errorMessage.toLowerCase();
    return (
      lowerMessage.includes('expired') ||
      lowerMessage.includes('account expired') ||
      lowerMessage.includes('subscription expired') ||
      lowerMessage.includes('plan expired') ||
      lowerMessage.includes('license expired') ||
      lowerMessage.includes('validity expired')
    );
  }

  /**
   * Perform login with device management
   */
  performLogin(): void {
    this.buttonText = 'Processing...';
    this.isSubmitting = true;
    console.log('adminLoginModel =>', this.adminLoginModel);

    if (this.adminLoginModel.password && this.adminLoginModel.username) {
      // Get current device information
      const deviceInfo = this.deviceService.getCurrentDeviceInfo();

      // Prepare login payload with device information
      const loginPayload = {
        username: this.adminLoginModel.username,
        password: this.adminLoginModel.password,
        role: 'ADMIN',
        deviceId: deviceInfo.deviceId,
        deviceType: this.getDeviceType(),
        deviceName: this.getDeviceName(),
        fcmToken: localStorage.getItem('fcmToken') || '',
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress || ''
      };

      console.log('Login Payload:', loginPayload);

      this.http.postRequest(authsigninUrl, loginPayload).subscribe(
        (res: any) => {
          console.log('Login Response:', res);

          if (res && res.roles && res.roles[0] === 'ROLE_ADMIN') {
            // Clear any existing session before setting new one
            this.clearStoredLoginData();

            // Store device session information
            this.deviceService.storeDeviceSession(
              res.id,
              'ROLE_ADMIN',
              deviceInfo.deviceId
            );

            // Store login data with CORRECT role format for AuthGuard
            sessionStorage.setItem('adminId', res.id);
            localStorage.setItem('userRole', 'ROLE_ADMIN'); // IMPORTANT: Use ROLE_ADMIN
            localStorage.setItem('accessToken', res.accessToken);

            let userFullName = res.firstName + ' ' + res.lastName;
            console.log({ userFullName });

            // Set background color
            if (res.colorTheme) {
              localStorage.setItem('backgroundColor', `${res.colorTheme}`);
            }

            // Store profile data
            if (res.profilePicture) {
              sessionStorage.setItem('adminprofilePicture', res.profilePicture);
            }
            if (res.logoImage) {
              sessionStorage.setItem('adminlogoImage', res.logoImage);
            }
            if (res.watermarkImage) {
              sessionStorage.setItem('adminwatermarkImage', res.watermarkImage);
            }
            sessionStorage.setItem('userFullName', userFullName);
            if (res.className) {
              sessionStorage.setItem('className', res.className);
            }

            // Register the device in background (don't wait for response)
            this.deviceService.registerDevice(
              res.id,
              'ROLE_ADMIN',
              deviceInfo
            ).subscribe(
              () => {
                console.log('Device registered successfully');
              },
              (error) => {
                console.error('Error registering device:', error);
              }
            );

            this.notificationService.successToast(`Login Successfully!`);
            this.buttonText = 'Log In';
            this.isSubmitting = false;

            // Navigate to admin dashboard
            this.redirectToDashboard();
          } else {
            this.buttonText = 'Log In';
            this.isSubmitting = false;
            this.notificationService.errorToast(`Not Admin..!!!`);
          }
        },
        (err) => {
          console.error('Login error:', err);
          this.buttonText = 'Log In';
          this.isSubmitting = false;

          // Extract error message from various possible locations
          let errorMessage = '';
          let fullError = '';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
              fullError = err.error;
            } else if (err.error.message) {
              errorMessage = err.error.message;
              fullError = JSON.stringify(err.error);
            } else if (err.error.error) {
              errorMessage = err.error.error;
              fullError = err.error.error;
            }
          }

          if (!errorMessage && err.message) {
            errorMessage = err.message;
            fullError = err.message;
          }

          // Check for database unique result error (DUPLICATE EMAIL)
          if (this.isDatabaseUniqueError(errorMessage)) {
            this.notificationService.showDetailedError(
              'Multiple accounts found with this email address. Please contact your Super Admin to resolve this issue.',
              'Account Conflict',
              'warning'
            );
            return;
          }

          // Check for expired account
          if (this.isExpiredAccountError(errorMessage)) {
            this.notificationService.showDetailedError(
              'Your account has expired. Please contact your Super Admin to renew your account.',
              'Account Expired',
              'error'
            );
            return;
          }

          // Handle 401 Unauthorized with specific message
          if (err.status === 401 || err.error?.responseCode === 401) {
            const errorData = err.error;
            const errorMessage401 = errorData?.message || '';

            // Check for the specific "Already logged in on another device" message
            if (errorMessage401.includes('Already logged in on another device') ||
              errorMessage401.includes('Use force logout')) {

              // Store the user ID from error response
              if (errorData?.id) {
                this.currentUserId = errorData.id;
              }

              // Create session info from available data
              this.activeSessionInfo = {
                deviceName: 'Other Device',
                lastActive: new Date(),
                ipAddress: 'Unknown',
                userId: errorData?.id
              };

              this.showForceLogoutOption = true;
              this.showDeviceWarning = true;
              this.deviceWarningMessage = `You are already logged in on another device. Please use "Force Logout" to continue on this device.`;
            } else if (errorMessage401.includes('not active')) {
              this.notificationService.errorToast(`Admin account is not active!`);
            } else if (this.isExpiredAccountError(errorMessage401)) {
              this.notificationService.showDetailedError(
                'Your account has expired. Please contact your Super Admin to renew your account.',
                'Account Expired',
                'error'
              );
            } else {
              this.notificationService.errorToast(errorMessage401 || `Unauthorized access!`);
            }
          } else if (err.error && err.error.message) {
            const errorMessage = err.error.message;

            if (errorMessage.includes('already logged in from another session')) {
              this.showDeviceWarning = true;
              this.showForceLogoutOption = true;
              this.deviceWarningMessage = `User is already logged in from another device/session.`;
            } else if (errorMessage.includes('not active')) {
              this.notificationService.errorToast(`Admin is not active!`);
            } else if (errorMessage.includes('Device ID is required')) {
              this.notificationService.errorToast(`Device information is required. Please refresh and try again.`);
            } else if (this.isDatabaseUniqueError(errorMessage)) {
              this.notificationService.showDetailedError(
                'Multiple accounts found with this email address. Please contact your Super Admin to resolve this issue.',
                'Account Conflict',
                'warning'
              );
            } else if (this.isExpiredAccountError(errorMessage)) {
              this.notificationService.showDetailedError(
                'Your account has expired. Please contact your Super Admin to renew your account.',
                'Account Expired',
                'error'
              );
            } else {
              this.notificationService.errorToast(errorMessage || `Failed to login!`);
            }
          } else {
            // Check if the full error string contains database error
            if (this.isDatabaseUniqueError(fullError)) {
              this.notificationService.showDetailedError(
                'Multiple accounts found with this email address. Please contact your Super Admin to resolve this issue.',
                'Account Conflict',
                'warning'
              );
            } else {
              this.notificationService.errorToast(`Failed to login! Please try again.`);
            }
          }
        }
      );
    } else {
      this.buttonText = 'Log In';
      this.isSubmitting = false;
      this.notificationService.errorToast(`Please fill all the fields`);
    }
  }

  submit() {
    // Prevent submission if auto-logging in or already submitting
    if (this.isAutoLoggingIn || this.isSubmitting) {
      return;
    }

    this.performLogin();
  }

  /**
   * Cancel device warning and stay on login page
   */
  cancelDeviceLogout() {
    this.showDeviceWarning = false;
    this.showForceLogoutOption = false;
    this.buttonText = 'Log In';
    this.activeSessionInfo = null;
    this.currentUserId = null;
    this.isSubmitting = false;
    this.isForceLogoutInProgress = false;
  }

  /**
   * Force logout from other device and continue with current login
   */
  forceLogoutAndContinue(): void {
    if (this.isForceLogoutInProgress) {
      return;
    }

    this.isForceLogoutInProgress = true;
    this.buttonText = 'Processing Force Logout...';
    this.isSubmitting = true;

    const username = this.adminLoginModel.username;
    const deviceInfo = this.deviceService.getCurrentDeviceInfo();

    if (!username) {
      this.notificationService.errorToast('Username is required');
      this.resetForceLogoutState();
      return;
    }

    // Prepare force logout payload
    const forceLogoutPayload = {
      username: username,
      currentDeviceId: deviceInfo.deviceId,
      deviceId: deviceInfo.deviceId,
      deviceType: this.getDeviceType(),
      deviceName: this.getDeviceName(),
      role: 'ADMIN',
      userAgent: deviceInfo.userAgent
    };

    console.log('Force logout payload:', forceLogoutPayload);

    // Call force logout API endpoint
    this.http.postRequest('api/auth/force-logout', forceLogoutPayload).subscribe(
      (response: any) => {
        console.log('Force logout response:', response);
        this.notificationService.successToast('Successfully logged out from other device. Logging you in...');

        // Clear any existing session data
        this.clearStoredLoginData();
        this.deviceService.clearDeviceSession();

        // After successful force logout, proceed with login
        setTimeout(() => {
          this.resetForceLogoutState();
          // Clear warning modal
          this.showDeviceWarning = false;
          this.showForceLogoutOption = false;
          this.activeSessionInfo = null;
          this.currentUserId = null;
          // Retry login
          this.performLogin();
        }, 1500);
      },
      (error) => {
        console.error('Force logout error:', error);

        // If force logout fails, try alternative method using user ID if available
        if (this.currentUserId) {
          this.deviceService.forceLogoutOtherDevices(
            this.currentUserId.toString(),
            deviceInfo.deviceId
          ).subscribe(
            () => {
              this.notificationService.successToast('Logged out from other device. Proceeding with login...');
              setTimeout(() => {
                this.resetForceLogoutState();
                this.showDeviceWarning = false;
                this.showForceLogoutOption = false;
                this.performLogin();
              }, 1500);
            },
            (err) => {
              console.error('Alternative force logout error:', err);
              this.notificationService.errorToast('Unable to force logout. Please try again later or contact support.');
              this.resetForceLogoutState();
              // Keep warning modal open
              this.showDeviceWarning = true;
            }
          );
        } else {
          this.notificationService.errorToast('Unable to force logout. Please try again later.');
          this.resetForceLogoutState();
          // Keep warning modal open
          this.showDeviceWarning = true;
        }
      }
    );
  }

  /**
   * Reset force logout related states
   */
  resetForceLogoutState(): void {
    this.isForceLogoutInProgress = false;
    this.buttonText = 'Log In';
    this.isSubmitting = false;
  }

  private redirectToDashboard(): void {
    // According to AdminPanelRoutingModule, the admin layout is at '/admin/layout'
    // AuthGuard expects role 'ROLE_ADMIN'
    console.log('Redirecting to admin dashboard at /admin/layout');

    // Navigate to admin layout
    this.rout.navigate(['/admin/layout']).then(
      (success) => {
        console.log('Navigation to /admin/layout successful:', success);
        if (!success) {
          // Fallback - try navigating to /admin first
          this.rout.navigate(['/admin']).then(
            (success2) => {
              console.log('Fallback navigation to /admin:', success2);
              if (!success2) {
                window.location.href = '/admin/layout';
              }
            }
          );
        }
      },
      (error) => {
        console.error('Navigation error:', error);
        window.location.href = '/admin/layout';
      }
    );
  }

  /**
   * Manual logout - clears stored data and allows fresh login
   */
  forceLogout() {
    const deviceSession = this.deviceService.getDeviceSession();
    if (deviceSession && deviceSession.userId) {
      // Logout from server
      this.deviceService.logoutDevice(
        deviceSession.userId,
        deviceSession.deviceId
      ).subscribe(
        () => {
          console.log('Device logged out successfully');
        },
        (error) => {
          console.error('Error logging out device:', error);
        }
      );
    }

    this.clearStoredLoginData();
    this.deviceService.clearDeviceSession();
    this.isAutoLoggingIn = false;
    this.isSubmitting = false;
    this.isForceLogoutInProgress = false;
    this.showDeviceWarning = false;
    this.showForceLogoutOption = false;
    this.activeSessionInfo = null;
    this.currentUserId = null;
    this.buttonText = 'Log In';
    this.notificationService.successToast('Logged out successfully. Please login again.');
  }

  proceedWithDeviceLogout(): void {
    this.forceLogoutAndContinue();
  }
}
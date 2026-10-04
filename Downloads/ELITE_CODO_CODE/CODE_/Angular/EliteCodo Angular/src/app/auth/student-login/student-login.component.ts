import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceManagementService } from 'src/app/share-services/devicemanagementServices/device-management.service';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { LogoutService } from 'src/app/share-services/logout.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { adminLogin } from 'src/app/shared/AllModel';
import { authsigninUrl } from 'src/app/shared/allURL';

@Component({
  selector: 'app-student-login',
  templateUrl: './student-login.component.html',
  styleUrls: ['./student-login.component.css'],
})
export class StudentLoginComponent {
  http = inject(HttpmethodsService);
  notificationService = inject(NotificationService);
  deviceManagementService = inject(DeviceManagementService);
  adminLoginModel = new adminLogin();
  rout = inject(Router);
  private readonly ROLE_KEY = 'userRole';
  buttonText = 'Log In';
  isSubmitting: boolean = false;
  showDeviceWarning: boolean = false;
  deviceWarningMessage: string = '';
  isAutoLoggingIn: boolean = false;
  activeSessionInfo: any = null;
  showForceLogoutOption: boolean = false;
  isForceLogoutInProgress: boolean = false;
  currentUserId: number | null = null; // Store user ID from error response

  passwordFieldType: string = 'password';
  backButton: HTMLElement | null;

  constructor(private logoutService: LogoutService) {
    this.backButton = null;
  }

  ngOnInit(): void {
    // Check for auto-login before setting up other components
    this.checkAutoLogin();

    this.backButton = document.querySelector('.back-button') as HTMLElement;
    if (this.backButton) {
      this.backButton.addEventListener('click', this.backAnim.bind(this));
    }
  }

  /**
   * Check if user is already logged in and auto-redirect
   */
  checkAutoLogin(): void {
    const userRole = localStorage.getItem('userRole');
    const studentId = sessionStorage.getItem('studentId');
    const deviceSession = this.deviceManagementService.getDeviceSession();

    // Check if user was previously logged in as student and session is valid
    if (userRole === 'student' && studentId && deviceSession) {
      // Validate the current session
      this.deviceManagementService.validateCurrentSession().subscribe(
        (isValid: boolean) => {
          if (isValid) {
            this.isAutoLoggingIn = true;
            this.buttonText = 'Auto Logging In...';

            setTimeout(() => {
              this.rout.navigate(['/student/student_home']);
            }, 5000);
          } else {
            // Session invalid, clear stored data
            this.clearStoredLoginData();
            this.deviceManagementService.clearDeviceSession();
          }
        },
        () => {
          // Error validating session, clear data to be safe
          this.clearStoredLoginData();
          this.deviceManagementService.clearDeviceSession();
        }
      );
    }
  }

  /**
   * Clear stored login data (useful for manual logout or session cleanup)
   */
  clearStoredLoginData(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('backgroundColor');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('adminprofilePicture');
    sessionStorage.removeItem('adminlogoImage');
    sessionStorage.removeItem('adminwatermarkImage');
    sessionStorage.removeItem('userFullName');
    sessionStorage.removeItem('className');
    sessionStorage.removeItem('currentDeviceSession');
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
   * Perform login with device management
   */
  performLogin(): void {
    this.buttonText = 'Processing...';
    this.isSubmitting = true;
    console.log('adminLoginModel =>', this.adminLoginModel);

    if (this.adminLoginModel.password && this.adminLoginModel.username) {
      // Get current device information
      const deviceInfo = this.deviceManagementService.getCurrentDeviceInfo();

      // Prepare login payload with device information
      const loginPayload = {
        username: this.adminLoginModel.username,
        password: this.adminLoginModel.password,
        role: 'STUDENT',
        deviceId: deviceInfo.deviceId,
        deviceType: this.getDeviceType(),
        deviceName: this.getDeviceName(),
        fcmToken: localStorage.getItem('fcmToken') || '',
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress || ''
      };

      this.http.postRequest(authsigninUrl, loginPayload).subscribe(
        (res: any) => {
          console.log('Login Response:', res);
          this.buttonText = 'Log In';
          this.isSubmitting = false;

          if (res) {
            if (res.roles && res.roles[0] === 'ROLE_STUDENT') {
              // Register the device for this user
              this.deviceManagementService.registerDevice(
                res.id,
                'STUDENT',
                deviceInfo
              ).subscribe(
                () => {
                  console.log('Device registered successfully');
                },
                (error) => {
                  console.error('Error registering device:', error);
                }
              );

              // Store device session information
              this.deviceManagementService.storeDeviceSession(
                res.id,
                'STUDENT',
                deviceInfo.deviceId
              );

              this.notificationService.successToast(`Login Successfully!`);

              // Store login data
              sessionStorage.setItem('studentId', res.id);
              localStorage.setItem('userRole', 'student');

              let userFullName = res.firstName + ' ' + res.lastName;
              console.log({ userFullName });

              // Set background color
              localStorage.setItem('backgroundColor', `${res.colorTheme}`);

              // Store profile data
              sessionStorage.setItem('adminprofilePicture', res.profilePicture);
              sessionStorage.setItem('adminlogoImage', res.logoImage);
              sessionStorage.setItem('adminwatermarkImage', res.watermarkImage);
              sessionStorage.setItem('userFullName', userFullName);
              sessionStorage.setItem('className', res.className);

              // Store access token
              if (res.accessToken) {
                localStorage.setItem('accessToken', res.accessToken);
              }

              // Delay navigation by 3 seconds
              setTimeout(() => {
                this.rout.navigate(['/student/student_home']);
              }, 3000);
            } else {
              this.notificationService.errorToast(`Not student..!!!`);
            }
          } else {
            this.notificationService.errorToast(`Failed to login!`);
          }
        },
        (err) => {
          console.error('Login error:', err);
          this.buttonText = 'Log In';
          this.isSubmitting = false;

          // Handle 401 Unauthorized with specific message
          if (err.status === 401 || err.error?.responseCode === 401) {
            const errorData = err.error;
            const errorMessage = errorData?.message || '';

            // Check for the specific "Already logged in on another device" message
            if (errorMessage.includes('Already logged in on another device') ||
              errorMessage.includes('Use force logout')) {

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
            } else {
              this.notificationService.errorToast(errorMessage || `Unauthorized access!`);
            }
          } else if (err.error && err.error.message) {
            const errorMessage = err.error.message;

            if (errorMessage.includes('not active')) {
              this.notificationService.errorToast(`Student account is not active!`);
            } else {
              this.notificationService.errorToast(errorMessage || `Failed to login!`);
            }
          } else if (err.error && err.error.responseCode == 400) {
            this.notificationService.errorToast(`Student is not active!`);
          } else {
            this.notificationService.errorToast(`Failed to login! Please try again.`);
          }
        }
      );
    } else {
      this.buttonText = 'Log In';
      this.isSubmitting = false;
      this.notificationService.errorToast(`Please fill all the fields`);
    }
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
    const deviceInfo = this.deviceManagementService.getCurrentDeviceInfo();

    if (!username) {
      this.notificationService.errorToast('Username is required');
      this.resetForceLogoutState();
      return;
    }

    // Prepare force logout payload - using the same endpoint structure as your backend expects
    const forceLogoutPayload = {
      username: username,
      currentDeviceId: deviceInfo.deviceId,
      deviceId: deviceInfo.deviceId,
      deviceType: this.getDeviceType(),
      deviceName: this.getDeviceName(),
      role: 'STUDENT',
      userAgent: deviceInfo.userAgent
    };

    console.log('Force logout payload:', forceLogoutPayload);

    // Call force logout API endpoint - adjust endpoint based on your backend
    this.http.postRequest('api/auth/force-logout', forceLogoutPayload).subscribe(
      (response: any) => {
        console.log('Force logout response:', response);
        this.notificationService.successToast('Successfully logged out from other device. Logging you in...');

        // Clear any existing session data
        this.clearStoredLoginData();
        this.deviceManagementService.clearDeviceSession();

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
          // Convert number to string if the method expects string
          this.deviceManagementService.forceLogoutOtherDevices(
            this.currentUserId.toString(), // Convert number to string
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

  /**
   * Manual logout - clears stored data and allows fresh login
   */
  forceLogout() {
    const deviceSession = this.deviceManagementService.getDeviceSession();
    if (deviceSession && deviceSession.userId) {
      // Logout from server
      this.deviceManagementService.logoutDevice(
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
    this.deviceManagementService.clearDeviceSession();
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
}
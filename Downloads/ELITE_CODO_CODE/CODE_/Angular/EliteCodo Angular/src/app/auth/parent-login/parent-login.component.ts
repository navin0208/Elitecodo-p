import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceManagementService } from 'src/app/share-services/devicemanagementServices/device-management.service';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { adminLogin } from 'src/app/shared/AllModel';
import { authsigninUrl } from 'src/app/shared/allURL';

@Component({
  selector: 'app-parent-login',
  templateUrl: './parent-login.component.html',
  styleUrls: ['./parent-login.component.css'],
})
export class ParentLoginComponent {
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
  currentUserId: number | null = null;

  passwordFieldType: string = 'password';
  backButton: HTMLElement | null;
  
  constructor() {
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
    const parentId = sessionStorage.getItem('parentId');
    const deviceSession = this.deviceManagementService.getDeviceSession();

    // Check if user was previously logged in as parent and session is valid
    if (userRole === 'parent' && parentId && deviceSession) {
      // Validate the current session
      this.deviceManagementService.validateCurrentSession().subscribe(
        (isValid: boolean) => {
          if (isValid) {
            this.isAutoLoggingIn = true;
            this.buttonText = 'Auto Logging In...';
            
            setTimeout(() => {
              window.location.href = '/parent/parent_home';
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
   * Clear stored login data
   */
  clearStoredLoginData(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('backgroundColor');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('parentId');
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
        role: 'PARENT',
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
          this.buttonText = 'Log In';
          this.isSubmitting = false;

          if (res) {
            if (res.roles && res.roles[0] === 'ROLE_PARENT') {
              // Clear any existing session before setting new one
              this.clearStoredLoginData();

              // Register the device for this user
              this.deviceManagementService.registerDevice(
                res.id, 
                'PARENT', 
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
                'PARENT', 
                deviceInfo.deviceId
              );

              this.notificationService.successToast(`Login Successfully!`);

              sessionStorage.setItem('parentId', res.id);
              localStorage.setItem('userRole', 'parent');

              let userFullName = res.firstName + ' ' + res.lastName;
              console.log({ userFullName });

              // Set background color
              localStorage.setItem('backgroundColor', `${res.colorTheme}`);

              // adminprofilePicture
              sessionStorage.setItem('adminprofilePicture', res.profilePicture);

              // adminlogoImage
              sessionStorage.setItem('adminlogoImage', res.logoImage);

              // adminwatermarkImage
              sessionStorage.setItem('adminwatermarkImage', res.watermarkImage);

              // userFullName
              sessionStorage.setItem('userFullName', userFullName);

              // className
              sessionStorage.setItem('className', res.className);

              // Store access token
              if (res.accessToken) {
                localStorage.setItem('accessToken', res.accessToken);
              }

              // Delay navigation by 3 seconds
              setTimeout(() => {
                window.location.href = '/parent/parent_home';
              }, 3000);
            } else {
              this.notificationService.errorToast(`Not Parent..!!!`);
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
            } else if (errorMessage.includes('not active')) {
              this.notificationService.errorToast(`Parent account is not active!`);
            } else {
              this.notificationService.errorToast(errorMessage || `Unauthorized access!`);
            }
          } else if (err.error && err.error.message) {
            const errorMessage = err.error.message;
            
            if (errorMessage.includes('already logged in from another session')) {
              this.showDeviceWarning = true;
              this.showForceLogoutOption = true;
              this.deviceWarningMessage = `User is already logged in from another device/session.`;
            } else if (errorMessage.includes('not active')) {
              this.notificationService.errorToast(`Parent is not active!`);
            } else if (errorMessage.includes('Device ID is required')) {
              this.notificationService.errorToast(`Device information is required. Please refresh and try again.`);
            } else {
              this.notificationService.errorToast(errorMessage || `Failed to login!`);
            }
          } else if (err.error && err.error.responseCode == 400) {
            this.notificationService.errorToast(`Parent is not active!`);
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
    
    // Prepare force logout payload
    const forceLogoutPayload = {
      username: username,
      currentDeviceId: deviceInfo.deviceId,
      deviceId: deviceInfo.deviceId,
      deviceType: this.getDeviceType(),
      deviceName: this.getDeviceName(),
      role: 'PARENT',
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
          this.deviceManagementService.forceLogoutOtherDevices(
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
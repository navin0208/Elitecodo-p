import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  typeIconSuccess = TYPE.SUCCESS;
  typeIconError = TYPE.ERROR;

  constructor(private toastr: ToastrService) { }

  // ============================================
  // TOAST NOTIFICATIONS (Small popups)
  // ============================================

  showSuccess(message: any, title: any): void {
    this.toastr.success(message, title);
  }

  showError(message: any, title: any): void {
    this.toastr.error(message, title);
  }

  showInfo(message: any, title: any): void {
    this.toastr.info(message, title);
  }

  showWarning(message: any, title: any): void {
    this.toastr.warning(message, title);
  }

  // ============================================
  // SWEETALERT TOASTS (Bottom notifications)
  // ============================================

  successToast(Message: string): void {
    swal.fire({
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      icon: this.typeIconSuccess,
      timer: 5000,
      title: Message
    });
  }

  errorToast(Message: string): void {
    swal.fire({
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      icon: this.typeIconError,
      timer: 5000,
      title: Message
    });
  }

  // ============================================
  // DETAILED ERROR POPUPS (For Bulk Upload)
  // ============================================

  /**
   * Show detailed error popup for bulk upload failures
   * @param messages - Array of error messages from the API
   * @param title - Optional custom title
   * @param customAction - Optional custom button text
   */
  showBulkUploadErrors(
    messages: string[],
    title: string = '⚠️ Bulk Upload Issues',
    customAction: string = 'Got it'
  ): void {
    // Format error messages for display
    const errorList = messages.map(msg => {
      let cleanMsg = msg
        .replace(/^Error:\s*/, '')
        .replace(/^Warning:\s*/, '')
        .trim();
      return `<li style="margin: 8px 0; padding: 8px 12px; background: #fef5f5; border-radius: 5px; border-left: 3px solid #dc3545; list-style: none;">
        ${cleanMsg}
      </li>`;
    }).join('');

    swal.fire({
      title: title,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p style="color: #555; margin-bottom: 15px; font-size: 15px;">
            Please review the following issues and try again:
          </p>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${errorList}
          </ul>
          <p style="color: #666; margin-top: 15px; font-size: 13px; border-top: 1px solid #eee; padding-top: 10px;">
            <i class="fas fa-info-circle"></i> 
            Fix these issues in your file and upload again.
          </p>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: customAction,
      confirmButtonColor: '#17a2b8',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show a single error popup with detailed message
   * @param message - Error message
   * @param title - Popup title
   * @param icon - 'error' | 'warning' | 'info' | 'question'
   */
  showDetailedError(
    message: string,
    title: string = '❌ Error',
    icon: 'error' | 'warning' | 'info' | 'question' = 'error'
  ): void {
    swal.fire({
      title: title,
      html: `
        <div style="text-align: left;">
          <p style="color: #555; margin-bottom: 15px;">Please fix the following issue and try again:</p>
          <div style="background: #fef5f5; padding: 12px; border-radius: 5px; border-left: 4px solid #dc3545;">
            <p style="color: #721c24; margin: 0;">${message}</p>
          </div>
        </div>
      `,
      icon: icon,
      confirmButtonText: 'Got it',
      confirmButtonColor: icon === 'error' ? '#dc3545' : '#17a2b8'
    });
  }

  /**
   * Show success popup with detailed message
   * @param message - Success message
   * @param title - Popup title
   */
  showDetailedSuccess(
    message: string,
    title: string = '✅ Success'
  ): void {
    swal.fire({
      title: title,
      html: `
        <div style="text-align: left;">
          <p style="color: #555; font-size: 15px;">${message}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Great!',
      confirmButtonColor: '#28a745'
    });
  }

  /**
   * Show confirmation dialog with custom options
   * @param title - Dialog title
   * @param message - Dialog message
   * @param confirmText - Confirm button text
   * @param cancelText - Cancel button text
   * @param confirmColor - Confirm button color
   */
  showConfirmation(
    title: string,
    message: string,
    confirmText: string = 'Yes, Proceed',
    cancelText: string = 'Cancel',
    confirmColor: string = '#dc3545'
  ): Promise<any> {
    return swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
  }

  /**
   * Show info popup with custom content
   * @param title - Popup title
   * @param content - HTML content
   * @param icon - Icon type
   */
  showInfoPopup(
    title: string,
    content: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info'
  ): void {
    swal.fire({
      title: title,
      html: content,
      icon: icon,
      confirmButtonText: 'Got it',
      confirmButtonColor: '#17a2b8'
    });
  }

  /**
   * Show a popup with custom HTML content
   * @param options - SweetAlert2 options
   */
  showCustomPopup(options: any): void {
    swal.fire(options);
  }

  /**
   * Show a loading popup
   * @param title - Loading message
   */
  showLoading(title: string = 'Processing...'): void {
    swal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        swal.showLoading();
      }
    });
  }

  /**
   * Close any open popup
   */
  closePopup(): void {
    swal.close();
  }
}
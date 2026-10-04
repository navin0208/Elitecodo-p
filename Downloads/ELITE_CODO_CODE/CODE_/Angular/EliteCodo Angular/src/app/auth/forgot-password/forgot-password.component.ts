import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { ForgotPassClass, updatePassClass, ValidateOtpClass } from 'src/app/shared/AllModel';
import { getForgotPassURL, updatePassURL, validateOtpUrlURL } from 'src/app/shared/allURL';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss', '../../../assets/css/animation.css'],

})
export class ForgotPasswordComponent {

  router = inject(Router);
  httpService = inject(HttpmethodsService);
  notificationService = inject(NotificationService);
  forgotPassModel = new ForgotPassClass();
  validateOtpModel = new ValidateOtpClass();
  updatePAssModel = new updatePassClass();
  // In your component class
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  showFirst: Boolean = true;
  showSecond: Boolean = false;
  showThird: Boolean = false;
  newpass!: String;
  conpass!: String;
  userId!: number;

  isLoadingOne = false;
  button = 'Reset Your Password';
  isLoadingTwo = false;
  buttonTwo = 'Verify';
  isLoadingThree = false;
  buttonThree = 'Reset Password';

  getResetPassword() {
    this.button = 'Processing...';
    this.isLoadingOne = true;
    this.httpService.postRequest(getForgotPassURL, this.forgotPassModel).subscribe(
      (data: any) => {
        if (data.flag == true) {
          console.log({ data });
          this.userId = data.id
          this.button = 'Reset Your Password';
          this.isLoadingOne = false;
          this.showFirst = false
          this.showSecond = true
          this.showThird = false
          this.notificationService.showSuccess("OTP send successfully, Check Mail", "Success")
        } else {
          this.notificationService.showError("Something Went Wrong...", "Error")
          this.button = 'Reset Your Password';
          this.isLoadingOne = false;
        }
      }, err => {
        if (err.error.responseCode == 400) {
          this.notificationService.showError("Invalid email. Please provide the valid email", "Error")
          this.button = 'Reset Your Password';
          this.isLoadingOne = false;
        } else {
          this.notificationService.showError("Something Went Wrong...", "Error")
          this.button = 'Reset Your Password';
          this.isLoadingOne = false;
        }
      })
  }

  getOtp() {
    this.buttonTwo = 'Verifying...';
    this.isLoadingTwo = true;
    this.validateOtpModel.id = this.userId
    this.httpService.postRequest(validateOtpUrlURL, this.validateOtpModel).subscribe((data: any) => {
      console.log({ data });
      if (data.flag == true) {
        this.userId = data.id
        this.buttonTwo = 'Verify';
        this.isLoadingTwo = false;
        this.showFirst = false
        this.showSecond = false
        this.showThird = true
        this.notificationService.showSuccess("OTP Verified successfully", "Success")
      } else {
        this.buttonTwo = 'Verify';
        this.isLoadingTwo = false;
        this.notificationService.showError("Something Went Wrong...Try Again", "Error")
      }
    }, err => {
      this.notificationService.showError("Something Went Wrong...", "Error")
      this.buttonTwo = 'Verify';
      this.isLoadingTwo = false;
    })
  }

  reset() {
    this.showFirst = true;
    this.showSecond = false;
    this.showThird = false;
  }

  newPass(e: any) {
    this.newpass = e.target.value;
  }

  confirmPass(e: any) {
    this.conpass = e.target.value;
  }

  setNewPassword() {
    this.isLoadingThree = true;
    this.buttonThree = 'Processing...';

    if (this.newpass && this.conpass) {
      if (this.newpass == this.conpass) {
        this.updatePAssModel.newPassword = this.newpass;
        this.updatePAssModel.confirmPassword = this.conpass;
        this.updatePAssModel.id = this.userId;
        this.httpService.postRequest(updatePassURL, this.updatePAssModel).subscribe(
          (data: any) => {
            console.log(data);
            this.isLoadingThree = false;
            this.buttonThree = 'Reset Password';
            if (data.flag == true) {
              this.notificationService.showSuccess("Sucessfully Changed PassWord..", "Sucess..!")

              // Delay navigation by 3 seconds
              setTimeout(() => {
                this.router.navigate(["/"])
              }, 1500);
            } else {
              this.notificationService.showSuccess("Something Went Wrong...", "Error")
            }
          }, err => {
            this.notificationService.showError("Something Went Wrong...", "Error")
            this.isLoadingThree = false;
            this.buttonThree = 'Reset Password';
          })
      } else {
        this.notificationService.showError("Password Does Not Match...", "Error")
        this.isLoadingThree = false;
        this.buttonThree = 'Reset Password';
      }
    } else {
      this.notificationService.errorToast(`Please fill all the fields`);
      this.isLoadingThree = false;
      this.buttonThree = 'Reset Password';
    }
  }
}
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MainURL } from 'src/app/ConfigUrl/config';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { RoleService } from 'src/app/share-services/Roleservices/role.service';
import { teacherMaster, TYPE } from 'src/app/shared/AllModel';
import { ChangePasswordByInstitution, create_Institution, delete_Institution, fileUpload, getallactiveteachers_Institution, getById_Institution, update_Institution } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-institution-management',
  templateUrl: './institution-management.component.html',
  styleUrls: ['./institution-management.component.css', '../../../../assets/css/form.css']
})
export class InstitutionManagementComponent implements OnInit, AfterViewInit {
  https = inject(HttpClient)
  selectedFile: File | null = null;
  uploading = false;
  uploadStatus: { message: string; type: 'error' | 'success' } | null = null;
  http = inject(HttpmethodsService)
  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  router = inject(Router)
  roleService = inject(RoleService)
  serverImagelogo: any

  disabled: any;
  AddressData: any
  filetoUpload: any;

  passwordStatus: boolean = true;
  isSubmit: boolean = true;
  isUpdate: boolean = false;
  isLoading = false;

  dialogRef: any;
  dialogRef1: any;
  dialogRefForExel: any;

  button = 'Submit';
  buttonPass = 'Change Password';

  regiStrationForm!: FormGroup;
  newPassswordForm!: FormGroup;
  date: any;
  InstitutionMasterModel = new teacherMaster();
  AttendanceShift: any;
  typeIcon = TYPE.SUCCESS;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  userIDForEdit: any;
  colorTheme = '#8f94fb';
  UserIDForPasswordChange: any;
  minDate: string = '';

  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['id', 'instituteName', 'photo', 'slogan', 'email', 'status', 'edit'];

  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms();
    this.getgetAllInstitutionData();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `Page 1 of 1`;
        }
        const totalPages = Math.ceil(length / pageSize);
        const currentPage = page + 1;
        return `Page ${currentPage} of ${totalPages}`;
      };
      this.paginator._intl.changes.next();
    }
  }

  registrationForms() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.regiStrationForm = this.fb.group({
      instituteName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+( [a-zA-Z]+)*$')]],
      photo: [''],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      logoImage: [''],
      watermarkImage: [''],
      slogan: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+( [a-zA-Z]+)*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      id: [''],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      teacherKeys: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      studentKeys: ['', [Validators.pattern('^[0-9]*$')]],
      status: [''],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  openDialogWithTemplateRefForExcel(templateRef: TemplateRef<any>) {
    // Reset everything when opening dialog
    this.selectedFile = null;
    this.uploadStatus = null;
    this.uploading = false;
    
    this.dialogRefForExel = this.dialog.open(templateRef, {
      width: '600px',
      height: '700px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  downloadTemplate() {
    const headers = [
      'instituteName',
      'photo',
      'address',
      'email',
      'logoImage',
      'watermarkImage',
      'slogan',
      'mobile',
      'password',
      'confirmPassword',
      'expiryDate',
      'teacherKeys',
      'studentKeys',
      'status'
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([headers.reduce((acc: Record<string, string>, header) => {
      acc[header] = '';
      return acc;
    }, {})]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'User_Import_Template.xlsx');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        swal.fire({
          title: 'Invalid File Type',
          text: 'Please select a valid Excel file (.xlsx or .xls)',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
        event.target.value = '';
        this.uploadStatus = null;
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        swal.fire({
          title: 'File Too Large',
          text: 'File size should not exceed 5MB',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
        event.target.value = '';
        this.uploadStatus = null;
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length === 0) {
          swal.fire({
            title: 'Empty File',
            text: 'The file is empty',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
          this.uploadStatus = null;
          return;
        }

        const headers = jsonData[0] as string[];
        const requiredFields = ['instituteName', 'email', 'mobile', 'password', 'confirmPassword'];

        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
          swal.fire({
            title: 'Missing Required Fields',
            text: `Missing required fields: ${missingFields.join(', ')}`,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
          this.uploadStatus = null;
          return;
        }

        this.selectedFile = file;
        this.uploadStatus = null;
      };
      fileReader.readAsArrayBuffer(file);
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('creatorId', String(sessionStorage.getItem('superadminId')));
    formData.append('uploadRole', 'institute');
    const headers = new HttpHeaders();
    this.https.post(`${MainURL.HostURL}api/auth/bulk-signup`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log("Bulk Upload Response :", response);
          
          this.uploading = false;
          this.uploadStatus = null; // Clear status so toast doesn't show
          
          // Format the response message
          let messageText = '';
          let hasError = false;
          let errorMessages: string[] = [];
          let successMessages: string[] = [];
          
          // Handle array response
          if (Array.isArray(response)) {
            response.forEach((msg: string) => {
              if (msg && msg.toLowerCase().includes('duplicate') || 
                  msg && msg.toLowerCase().includes('error') || 
                  msg && msg.toLowerCase().includes('warning') ||
                  msg && msg.toLowerCase().includes('failed')) {
                hasError = true;
                errorMessages.push(msg);
              } else if (msg) {
                successMessages.push(msg);
              }
            });
            messageText = response.join('\n');
          } 
          // Handle string response
          else if (typeof response === 'string') {
            messageText = response;
            hasError = response.includes('Duplicate') || 
                       response.includes('Error') || 
                       response.includes('Warning') ||
                       response.includes('duplicate') ||
                       response.includes('error') ||
                       response.includes('warning') ||
                       response.includes('failed');
            if (hasError) {
              errorMessages = [response];
            } else {
              successMessages = [response];
            }
          }
          // Handle object response
          else if (response && typeof response === 'object') {
            if (response.message) {
              if (Array.isArray(response.message)) {
                response.message.forEach((msg: string) => {
                  if (msg && msg.toLowerCase().includes('duplicate') || 
                      msg && msg.toLowerCase().includes('error') || 
                      msg && msg.toLowerCase().includes('warning') ||
                      msg && msg.toLowerCase().includes('failed')) {
                    hasError = true;
                    errorMessages.push(msg);
                  } else if (msg) {
                    successMessages.push(msg);
                  }
                });
                messageText = response.message.join('\n');
              } else {
                messageText = response.message;
                hasError = response.message.includes('Duplicate') || 
                           response.message.includes('Error') || 
                           response.message.includes('Warning') ||
                           response.message.includes('duplicate') ||
                           response.message.includes('error') ||
                           response.message.includes('warning') ||
                           response.message.includes('failed');
                if (hasError) {
                  errorMessages = [response.message];
                } else {
                  successMessages = [response.message];
                }
              }
            } else {
              messageText = 'Operation completed';
              hasError = response.status === 'error' || response.success === false;
              if (hasError) {
                errorMessages = ['Operation failed'];
              } else {
                successMessages = ['Operation completed successfully'];
              }
            }
          }
          
          // If no message text, set default
          if (!messageText && successMessages.length === 0 && errorMessages.length === 0) {
            successMessages = ['Institutions uploaded successfully!'];
          }
          
          if (hasError || errorMessages.length > 0) {
            // Show SweetAlert2 error popup - ONLY ONE POPUP
            const errorList = errorMessages.length > 0 ? errorMessages : ['Bulk upload failed'];
            swal.fire({
              title: '⚠️ Bulk Upload Failed',
              html: `
                <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                  <p style="font-size: 14px; color: #666; margin-bottom: 12px;">
                    Please fix the following issues:
                  </p>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${errorList.map((msg: string) => `
                      <li style="margin: 6px 0; padding: 10px 14px; background: #fef5f5; border-radius: 6px; border-left: 4px solid #dc3545; color: #333;">
                        ❌ ${msg}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `,
              icon: 'error',
              confirmButtonColor: '#dc3545',
              confirmButtonText: 'OK',
              width: '600px'
            });
          } else {
            // Show SweetAlert2 success popup - ONLY ONE POPUP
            const successList = successMessages.length > 0 ? successMessages : ['Bulk upload successful!'];
            swal.fire({
              title: '✅ Success!',
              html: `
                <div style="text-align: left; max-height: 300px; overflow-y: auto;">
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${successList.map((msg: string) => `
                      <li style="margin: 6px 0; padding: 10px 14px; background: #f0fff4; border-radius: 6px; border-left: 4px solid #28a745; color: #155724;">
                        ✅ ${msg}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `,
              icon: 'success',
              confirmButtonColor: '#28a745',
              confirmButtonText: 'OK',
              width: '600px'
            }).then(() => {
              this.getgetAllInstitutionData();
              setTimeout(() => {
                this.selectedFile = null;
                this.uploadStatus = null;
              }, 1000);
            });
          }
        },
        error: (error) => {
          console.error("Upload Error :", error);
          
          this.uploading = false;
          this.uploadStatus = null; // Clear status so toast doesn't show
          
          let errorMessage = "Bulk Upload Failed";
          
          // Extract error message from various response formats
          if (error?.error?.message) {
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join('\n');
            } else {
              errorMessage = error.error.message;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          // Show SweetAlert2 error popup - ONLY ONE POPUP
          swal.fire({
            title: '⚠️ Error!',
            html: `
              <div style="text-align: left; padding: 10px 0;">
                <p style="font-size: 15px; color: #555; margin-bottom: 10px;">
                  ${errorMessage}
                </p>
                <p style="font-size: 13px; color: #888; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                  <i class="fas fa-info-circle" style="color: #dc3545;"></i>
                  Please check your file and try again.
                </p>
              </div>
            `,
            icon: 'error',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'OK',
            width: '500px'
          });
        }
      });
  }

  updateStatus(id: number, activate: boolean) {
    const statusPayload = {
      id: id,
      status: activate ? 'Active' : 'inactive'
    };

    this.http.putRequest('api/auth/updatestatus', statusPayload).subscribe({
      next: (response) => {
        console.log({ response });
        const index = this.dataSource.data.findIndex(item => item.id === id);
        if (index !== -1) {
          this.dataSource.data[index].status = activate ? 'Active' : 'inactive';
          this.dataSource._updateChangeSubscription();
        }
        this.notificationService.showSuccess(
          `Institution ${activate ? 'Activated' : 'Deactivated'} Successfully`, 
          "Success"
        );
      },
      error: (error) => {
        this.notificationService.showError("Failed to update status", "Failed");
        console.error('Status update error', error);
      }
    });
  }

  newPassswordForms() {
    this.newPassswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  mustMatch(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passControl = formGroup.controls[password];
      const confirmPassControl = formGroup.controls[confirmPassword];

      if (confirmPassControl.errors && !confirmPassControl.errors['mustMatch']) {
        return;
      }

      if (passControl.value !== confirmPassControl.value) {
        confirmPassControl.setErrors({ mustMatch: true });
      } else {
        confirmPassControl.setErrors(null);
      }
    };
  }

  deleteInstitution(InstitutionId: any) {
    console.log({ InstitutionId });
    swal.fire({
      title: "Are you sure you want to delete this Institution?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        console.log({ InstitutionId });
        this.http.deleteRequest(delete_Institution, InstitutionId).subscribe(
          (res) => {
            console.log({ res });
            swal.fire({
              title: "Deleted!",
              text: `Institution has been deleted.`,
              icon: "success"
            });
            this.getgetAllInstitutionData();
          }, (err: any) => {
            swal.fire({
              text: "Something went wrong !!!",
              icon: "warning"
            });
          }
        );
      }
    });
  }

  ChangePassword(id: any, templateRef: TemplateRef<any>) {
    this.newPassswordForm.reset();
    this.dialogRef1 = this.dialog.open(templateRef, {
      width: '500px',
      height: '450px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
    this.UserIDForPasswordChange = id;
  }

  submitChangePassword() {
    if (this.newPassswordForm.invalid) {
      this.notificationService.showError("Please fill all required fields correctly", "Validation Error");
      return;
    }

    this.isLoading = true;
    this.buttonPass = 'Processing';
    const formData = {
      confirmPassword: this.newPassswordForm.value.confirmPassword,
      newPassword: this.newPassswordForm.value.password,
      id: this.UserIDForPasswordChange
    };
    console.log({ newPassswordForm: formData });

    this.http.postRequest(ChangePasswordByInstitution, formData).subscribe(
      (res) => {
        console.log({ res });
        this.buttonPass = 'Change Password';
        this.isLoading = false;
        this.closeChangePasswordModal();
        this.notificationService.showSuccess("Password Change Success", "Success");
      }, err => {
        this.buttonPass = 'Change Password';
        this.isLoading = false;
        this.notificationService.showError("Password Change Failed", "Failed");
      }
    );
  }

  closeChangePasswordModal() {
    this.newPassswordForm.reset();
    this.uploadStatus = null;
    this.selectedFile = null;
    this.uploading = false;
    if (this.dialogRefForExel) {
      this.dialogRefForExel.close();
    }
    if (this.dialogRef1) {
      this.dialogRef1.close();
    }
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  resetTheForm() {
    this.regiStrationForm.reset();
    this.regiStrationForm.markAsPristine();
    this.regiStrationForm.markAsUntouched();
  }

  submit() {
    if (this.regiStrationForm.invalid) {
      Object.keys(this.regiStrationForm.controls).forEach(key => {
        this.regiStrationForm.get(key)?.markAsTouched();
      });
      this.notificationService.showError("Please fill all required fields correctly", "Validation Error");
      return;
    }

    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      instituteName: this.regiStrationForm.value.instituteName,
      photo: this.regiStrationForm.value.photo || null,
      address: this.regiStrationForm.value.address,
      email: this.regiStrationForm.value.email,
      logoImage: this.serverImagelogo || this.regiStrationForm.value.logoImage,
      watermarkImage: this.regiStrationForm.value.watermarkImage || null,
      slogan: this.regiStrationForm.value.slogan,
      mobile: this.regiStrationForm.value.mobile,
      id: this.regiStrationForm.value.id || null,
      password: this.regiStrationForm.value.password,
      confirmPassword: this.regiStrationForm.value.confirmPassword,
      expiryDate: this.regiStrationForm.value.expiryDate,
      teacherKeys: this.regiStrationForm.value.teacherKeys,
      studentKeys: this.regiStrationForm.value.studentKeys || '',
      status: 'Pending',
      role: 'institute',
      creatorId: sessionStorage.getItem('superadminId')
    };

    console.log('Submit Form Data:', formData);

    this.http.postRequest(create_Institution, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.showNotification('Institution');
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getgetAllInstitutionData();
        this.notificationService.showSuccess("Institution Registration Success", "Success");
      }, (err) => {
        console.log({ err });
        if (err.status == 400) {
          this.notificationService.showError(`${err.error.message || "Validation failed"}`, "Failed");
        } else {
          this.notificationService.showError("Institution Registration Failed", "Failed");
        }
        this.button = 'Submit';
        this.isLoading = false;
      }
    );
  }

  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
  }

  getgetAllInstitutionData() {
    this.http.getRequest(getallactiveteachers_Institution).subscribe(
      (res: any) => {
        console.log({ getallteachers: res });

        const currentDate = new Date();
        res.forEach((institution: any) => {
          const expiryDate = new Date(institution.expiryDate);
          institution.combinedStatus = {
            isActive: institution.status === 'Active',
            isExpired: expiryDate < currentDate
          };
        });

        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
      }
    );
  }

  /**
 * Check license expiry before extending
 */
checkLicenseExpiry(expiryDate: string): { daysRemaining: number; isExpiringSoon: boolean } {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    daysRemaining: daysRemaining,
    isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0
  };
}

/**
 * Show extension confirmation popup
 */
confirmExtension(element: any, newExpiryDate: string): void {
  const expiryCheck = this.checkLicenseExpiry(element.expiryDate);
  
  let warningMessage = '';
  if (expiryCheck.daysRemaining <= 0) {
    warningMessage = `⚠️ This license EXPIRED ${Math.abs(expiryCheck.daysRemaining)} days ago.`;
  } else if (expiryCheck.isExpiringSoon) {
    warningMessage = `⚠️ This license expires in ${expiryCheck.daysRemaining} days.`;
  } else {
    warningMessage = `✅ This license expires in ${expiryCheck.daysRemaining} days.`;
  }

  swal.fire({
    title: 'Extend License',
    html: `
      <div style="text-align: left;">
        <p><strong>Institution:</strong> ${element.instituteName}</p>
        <p><strong>Current Expiry:</strong> ${new Date(element.expiryDate).toLocaleDateString()}</p>
        <p><strong>New Expiry:</strong> ${new Date(newExpiryDate).toLocaleDateString()}</p>
        <p style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
          ${warningMessage}
        </p>
        <p style="color: #dc3545; font-weight: 600; margin-top: 10px;">
          ⚠️ This institution has NOT made a payment for this extension.
          Are you sure you want to extend without payment?
        </p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, Extend for Free',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // Proceed with extension
      this.updateExpiry(element.id, newExpiryDate);
    }
  });
}

/**
 * Update expiry date
 */
updateExpiry(id: number, newExpiryDate: string): void {
  const statusPayload = {
    id: id,
    expiryDate: newExpiryDate
  };

  this.http.putRequest('api/auth/update-expiry', statusPayload).subscribe({
    next: (response) => {
      this.notificationService.showSuccess('License extended successfully!', 'Success');
      this.getgetAllInstitutionData();
    },
    error: (error) => {
      this.notificationService.showError('Failed to extend license', 'Failed');
      console.error('Extension error:', error);
    }
  });
}

  update() {
    if (this.regiStrationForm.invalid) {
      const requiredFields = ['instituteName', 'email', 'mobile', 'address', 'slogan', 'expiryDate', 'teacherKeys'];
      let hasError = false;

      requiredFields.forEach(field => {
        const control = this.regiStrationForm.get(field);
        if (control && control.invalid) {
          control.markAsTouched();
          hasError = true;
        }
      });

      if (hasError) {
        this.notificationService.showError("Please fill all required fields correctly", "Validation Error");
        return;
      }
    }

    this.isLoading = true;
    this.button = 'Processing';

    const formValues = this.regiStrationForm.value;

    const formData = {
      instituteName: formValues.instituteName,
      photo: formValues.photo || null,
      address: formValues.address,
      email: formValues.email,
      logoImage: this.serverImagelogo || formValues.logoImage,
      watermarkImage: formValues.watermarkImage || null,
      slogan: formValues.slogan,
      mobile: formValues.mobile,
      id: this.userIDForEdit,
      expiryDate: formValues.expiryDate,
      teacherKeys: formValues.teacherKeys,
      studentKeys: formValues.studentKeys || '',
      status: formValues.status || 'Active',
      role: 'institution',
      creatorId: sessionStorage.getItem('superadminId')
    };

    console.log('Update Payload:', formData);

    this.http.putRequest(update_Institution, formData).subscribe(
      (res) => {
        console.log({ updateResponse: res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getgetAllInstitutionData();
        this.notificationService.showSuccess("Institution Updated Success", "Success");
      }, (err) => {
        console.log({ updateError: err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Institution Updated Failed", "Failed");
      }
    );
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.serverImagelogo = null;
  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.regiStrationForm.controls['password'].enable();
    this.regiStrationForm.controls['confirmPassword'].enable();
    this.colorTheme = '#8f94fb';
    this.button = 'Submit';
    this.InstitutionMasterModel = new teacherMaster();
    this.resetTheForm();
    this.isSubmit = true;
    this.passwordStatus = true;
    this.isUpdate = false;
    this.serverImagelogo = null;

    this.dialogRef = this.dialog.open(templateRef, {
      width: '800px',
      height: '800px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log('Edit ID:', id);

    this.http.getRequest(getById_Institution + id).subscribe(
      (data: any) => {
        console.log('Edit Data from API:', data);

        this.userIDForEdit = data.id || data.instituteId;

        this.dialogRef = this.dialog.open(templateRef, {
          width: '800px',
          height: '650px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });

        this.passwordStatus = false;
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        this.regiStrationForm.controls['password']?.disable();
        this.regiStrationForm.controls['confirmPassword']?.disable();

        this.regiStrationForm.controls['password']?.clearValidators();
        this.regiStrationForm.controls['confirmPassword']?.clearValidators();
        this.regiStrationForm.controls['password']?.updateValueAndValidity();
        this.regiStrationForm.controls['confirmPassword']?.updateValueAndValidity();

        this.colorTheme = data.colorTheme || '#8f94fb';
        this.serverImagelogo = data.logoImage || data.logo;

        this.regiStrationForm.patchValue({
          instituteName: data.instituteName || data.name,
          email: data.email,
          mobile: data.mobile,
          address: data.address,
          slogan: data.slogan,
          expiryDate: data.expiryDate,
          teacherKeys: data.teacherKeys,
          studentKeys: data.studentKeys || '',
          status: data.status,
          logoImage: data.logoImage || data.logo,
          id: data.id || data.instituteId,
          photo: data.photo || null,
          watermarkImage: data.watermarkImage || null
        });

        console.log('Form after patch:', this.regiStrationForm.value);
        console.log('Email value in form:', this.regiStrationForm.get('email')?.value);
      },
      (error) => {
        console.error('Error fetching institution data:', error);
        this.notificationService.showError('Failed to load institution data', 'Error');
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  handleFileInput(event: any, controlName: string) {
    this.isLoading = true;
    const file = event.target.files[0];

    if (file) {
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Only PNG, JPG and JPEG images are allowed', 'Invalid File Type');
        event.target.value = '';
        this.isLoading = false;
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notificationService.showError('File size should not exceed 5MB', 'File Too Large');
        event.target.value = '';
        this.isLoading = false;
        return;
      }

      const formData = new FormData();
      formData.append('uploadfile', file);

      this.http.postRequest(fileUpload, formData).subscribe(
        (data: any) => {
          if (data.status === true) {
            this.notificationService.showSuccess('Successfully uploaded image', 'Success');
            this.isLoading = false;
            this.serverImagelogo = data.path;
            this.regiStrationForm.get(controlName)?.setValue(data.path);
          } else {
            this.notificationService.showError('Failed to upload image', 'Error');
            this.isLoading = false;
          }
        },
        error => {
          console.error('Upload error:', error);
          this.notificationService.showError('Something went wrong during the upload', 'Error');
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}
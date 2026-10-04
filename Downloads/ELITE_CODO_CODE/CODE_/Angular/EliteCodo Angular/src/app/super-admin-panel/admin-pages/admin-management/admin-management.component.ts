import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MainURL } from 'src/app/ConfigUrl/config';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { RoleService } from 'src/app/share-services/Roleservices/role.service';
import { companyMaster, TYPE } from 'src/app/shared/AllModel';
import { ChangePasswordBySuperAdminOfadmin, create_admin, delete_admin, fileUpload, getActive_exam, getActive_subject, getAll_admin, getAll_teacher, getAllActive_standard, getById_admin, update_admin } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.css', '../../../../assets/css/form.css', '../../../../assets/css/tooltip.css']
})
export class AdminManagementComponent implements OnInit {
  typeIcon = TYPE.SUCCESS;
  https = inject(HttpClient)

  roleService = inject(RoleService)
  http = inject(HttpmethodsService)
  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  router = inject(Router)
  disabled: any;
  AddressData: any
  filetoUpload: any;
  isSubmit: boolean = true;
  isUpdate: boolean = false;
  isLoading = false;
  dialogRef: any;
  button = 'Submit';
  row: any
  regiStrationForm!: FormGroup
  date: any
  AttendanceShift: any
  passwordStatus: boolean = true;
  buttonPass = 'Change Password';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  modal = inject(NzModalService)
  message = inject(NzMessageService)

  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'firstName', 'lastName', 'email', 'phone', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  getAllTeacher: any;
  newPassswordForm!: FormGroup
  UserIDForPasswordChange: any;
  dialogRef1: any;
  minDate: string = '';

  selectedFile: File | null = null;
  uploading = false;
  uploadStatus: { message: string; type: 'error' | 'success' } | null = null;
  dialogRefForExel: any;
  serverImage: any;

  // ============ HELPER FUNCTIONS FOR STATUS ============
  
  /**
   * Check if status is Active (case-insensitive)
   */
  isStatusActive(status: string): boolean {
    if (!status) return false;
    return status.toLowerCase() === 'active';
  }

  /**
   * Check if status is In-Active (case-insensitive)
   * Only returns true for inactive, InActive, In-Active
   */
  isStatusInActive(status: string): boolean {
    if (!status) return false;
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'inactive' || lowerStatus === 'in-active';
  }

  /**
   * Check if status should be displayed (only Active or InActive)
   * Filters out pending, Rejected, Deleted, 0, etc.
   */
  shouldDisplayStatus(status: string): boolean {
    if (!status) return false;
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'active' || lowerStatus === 'inactive' || lowerStatus === 'in-active';
  }

  /**
   * Get display status for UI - always shows "Active" or "In-Active"
   */
  getDisplayStatus(status: string): string {
    if (this.isStatusActive(status)) {
      return 'Active';
    }
    return 'In-Active';
  }

  // ============ END HELPER FUNCTIONS ============
  
  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms();
    this.getadminData();
  }

  registrationForms() {

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    this.regiStrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      address: ['', [Validators.required]],
      profilePicture: [''],
      creatorId: [''],
      id: [],
      role: [''],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      status: [''],
      expiryDate: [''],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  downloadTemplate() {
    const headers = [
      'firstName',
      'lastName',
      'mobile',
      'email',
      'address',
      'profilePicture',
      'role',
      'password',
      'confirmPassword',
      'status',
      'expiryDate'
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
        this.uploadStatus = {
          message: 'Please select a valid Excel file (.xlsx or .xls)',
          type: 'error'
        };
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadStatus = {
          message: 'File size should not exceed 5MB',
          type: 'error'
        };
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length === 0) {
          this.uploadStatus = {
            message: 'The file is empty',
            type: 'error'
          };
          return;
        }

        const headers = jsonData[0] as string[];
        const requiredFields = ['firstName', 'lastName', 'mobile', 'email', 'password', 'confirmPassword'];

        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
          this.uploadStatus = {
            message: `Missing required fields: ${missingFields.join(', ')}`,
            type: 'error'
          };
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
    formData.append('uploadRole', 'admin');
    const headers = new HttpHeaders();
    this.https.post(`${MainURL.HostURL}api/auth/bulk-signup`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log("Bulk Upload Response :", response);
          const messages: string[] = Array.isArray(response)
            ? response
            : [response];
          const hasError = messages.some(msg =>
            msg.startsWith("Duplicate") ||
            msg.startsWith("Error") ||
            msg.startsWith("Warning")
          );
          if (hasError) {
            this.uploadStatus = {
              message: messages.join('\n'),
              type: 'error'
            };
            this.notificationService.showError(
              messages.join('\n'),
              'Bulk Upload Failed'
            );
          } else {
            this.uploadStatus = {
              message: messages.join('\n'),
              type: 'success'
            };
            this.notificationService.showSuccess(
              messages.join('\n'),
              'Success'
            );
            this.getadminData();
            setTimeout(() => {
              this.selectedFile = null;
              this.uploadStatus = null;
              this.closeChangePasswordModal();
            }, 3000);
          }
        },
        error: (error) => {
          console.error("Upload Error :", error);
          let errorMessage = "Bulk Upload Failed";
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          this.uploadStatus = {
            message: errorMessage,
            type: 'error'
          };
          this.notificationService.showError(
            errorMessage,
            "Error"
          );
        },
        complete: () => {
          this.uploading = false;
        }
      });
  }

  openDialogWithTemplateRefForExcel(templateRef: TemplateRef<any>) {

    this.dialogRefForExel = this.dialog.open(templateRef, {
      width: '600px',
      height: '700px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  /**
   * Update admin status - Always set to 'Active' or 'InActive'
   */
  updateStatus(id: number, activate: boolean) {
    const statusPayload = {
      id: id,
      status: activate ? 'Active' : 'InActive'
    };

    this.http.putRequest('api/auth/updatestatus', statusPayload).subscribe({
      next: (response) => {
        console.log({ response });
        this.notificationService.showSuccess(`Admin ${activate ? 'Activated' : 'Deactivated'} Successfully`, "Success");
        this.getadminData(); // Refresh the table
      },
      error: (error) => {
        this.notificationService.showError("Failed to update status", "Failed");
        console.error('Status update error', error);
      }
    });
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

  submitChangePassword() {
    this.isLoading = true;
    this.buttonPass = 'Processing';
    const formData = {
      confirmPassword: this.newPassswordForm.value.confirmPassword,
      newPassword: this.newPassswordForm.value.password,
      id: this.UserIDForPasswordChange
    }
    console.log({ newPassswordForm: formData });
    this.http.postRequest(ChangePasswordBySuperAdminOfadmin, formData).subscribe(
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
      })
  }

  closeChangePasswordModal() {
    this.newPassswordForm.reset();
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

  deleteAdmin(adminId: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Admin?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_admin, adminId).subscribe((res) => {
          this.getadminData();
          this.message.success('Admin deleted successfully');
        }, err => {
          this.message.error('Admin deleted failed');
        })
      },
      nzCancelText: 'No'
    });
  }

  seeStandard(id: any) {
    this.router.navigate(
      ['/super_admin/Slayout/Assign-Standard-Wise-data-to-admin'],
      { queryParams: { adminId: id } }
    )
  }

  newPassswordForms() {
    this.newPassswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],

    }, { validator: this.mustMatch('password', 'confirmPassword') });
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

  submit() {
    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      ...this.regiStrationForm.value,
      role: 'admin',
      status: 'Pending',
      profilePicture: this.serverImage,
      creatorId: sessionStorage.getItem('superadminId'),
    };
    console.log({ formData });

    this.http.postRequest(create_admin, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getadminData();
        this.showNotification('Admin')
        this.notificationService.showSuccess("User Registration Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        if (err.status == 400) {
          this.notificationService.showError(`${err.error.message}`, "Failed");
        } else {
          this.notificationService.showError("User Registration Failed", "Failed");
        }
      })
  }

  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
  }

  /**
   * Get admins and filter to show ONLY Active and InActive
   * Filters out pending, Rejected, Deleted, 0, etc.
   */
  getadminData() {
    this.http.getRequest(getAll_admin).subscribe(
      (res: any) => {
        console.log('All admins data:', res);
        
        // FILTER: Only show Active and InActive statuses
        const filteredData = res.filter((admin: any) => {
          return this.shouldDisplayStatus(admin.status);
        });
        
        console.log('Filtered admins (Active/InActive only):', filteredData);
        
        this.dataSource = new MatTableDataSource(filteredData);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error fetching admins:', error);
      }
    );
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing';
    
    const formData = {
      ...this.regiStrationForm.value,
      profilePicture: this.serverImage,
      role: 'admin',
      creatorId: sessionStorage.getItem('adminId'),
    };

    this.http.putRequest(update_admin, formData).subscribe(
      (res) => {
        console.log(res);
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getadminData();
        this.notificationService.showSuccess("User Updated Successfully", "Success");
      },
      (err) => {
        console.log(err);
        this.button = 'Update';
        this.isLoading = false;
        if (err.status === 400 && err.error?.message) {
          this.notificationService.showError(err.error.message, "Failed");
        } else {
          this.notificationService.showError("User Updated Failed", "Failed");
        }
      }
    );
  }

  close() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.passwordStatus = true;
    this.regiStrationForm.controls['password'].enable();
    this.button = 'Submit';
    this.resetTheForm()
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '800px',
      height: '700px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  resetTheForm() {
    this.regiStrationForm.reset();
    this.regiStrationForm.markAsPristine();
    this.regiStrationForm.markAsUntouched();
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_admin + id).subscribe(
      (data: any) => {
        console.log({ edit: data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '800px',
          height: '600px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.passwordStatus = false;
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;
        this.regiStrationForm.controls['password'].disable();
        this.serverImage = data.profilePicture;
        this.regiStrationForm.patchValue({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          creatorId: data.creatorId,
          expiryDate: data.expiryDate,
          profilePicture: data.profilePicture,
          status: data.status,
          address: data.address,
        });
      })
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
      if (!file) {
        return;
      }

      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Only PNG,JPG and JPEG images are allowed', 'Invalid File Type');
        event.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notificationService.showError('File size should not exceed 5MB', 'File Too Large');
        event.target.value = '';
        return;
      }
      const formData = new FormData();
      formData.append('uploadfile', file);

      this.http.postRequest(fileUpload, formData).subscribe((data: any) => {
        if (data.status === true) {

          this.isLoading = false;
          this.serverImage = data.path;

          this.notificationService.showSuccess('Successfully uploaded image', 'Success');
          this.regiStrationForm.get('profilePicture')?.setValue(data.path);

          console.log('regiStrationForm', this.regiStrationForm)
        } else {
          this.notificationService.showError('Failed to upload image', 'Error');
        }
      }, error => {
        this.notificationService.showError('Something went wrong during the upload', 'Error');
      });
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}
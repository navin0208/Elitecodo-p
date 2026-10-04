import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MainURL } from 'src/app/ConfigUrl/config';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { RoleService } from 'src/app/share-services/Roleservices/role.service';
import { companyMaster, studentMaster, TYPE } from 'src/app/shared/AllModel';
import { ChangePasswordBySuperAdminOfStudent, create_student, delete_student, fileUpload, getActive_exam, getActive_subject, getAll_student, getAll_teacher, getAllActive_standard, getById_student, update_student } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-student-management',
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.css', '../../../../assets/css/form.css', '../../../../assets/css/tooltip.css']
})
export class StudentManagementComponent implements OnInit {
  typeIcon = TYPE.SUCCESS;

  https = inject(HttpClient)
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
  dialogRefForExel: any;
  button = 'Submit';
  row: any
  regiStrationForm!: FormGroup
  date: any
  studentMasterModel = new studentMaster();
  AttendanceShift: any
  passwordStatus: boolean = true;
  buttonPass = 'Change Password';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  modal = inject(NzModalService)
  message = inject(NzMessageService)
  roleService = inject(RoleService)
  serverImage: any
  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'firstName', 'lastName', 'parentStatus', 'email', 'phone', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  getAllTeacher: any;
  newPassswordForm!: FormGroup
  UserIDForPasswordChange: any;
  dialogRef1: MatDialogRef<any> | null = null;;
  colorTheme = '#8f94fb'; // Default color
  selectedFile: File | null = null;
  uploading = false;
  uploadStatus: { message: string; type: 'error' | 'success' } | null = null;
  minDate: string = '';
  
  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms();
    this.getstudentData();
    this.getteacherData();
  }

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

  /**
   * Check if a user is expired based on expiryDate
   */
  isExpired(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today;
  }

  // ============ END HELPER FUNCTIONS ============

  registrationForms() {

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.regiStrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      address: ['', [Validators.required]],
      profilePicture: [''],
      creatorId: [''],
      role: [''],
      colorTheme: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      status: [''],
      id: [],
      expiryDate: [''],
      teacherId: ['', [Validators.required]],
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
      'colorTheme',
      'password',
      'confirmPassword',
      'status',
      'expiryDate',
      'teacherId'
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

      this.selectedFile = file;
      this.uploadStatus = null;
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
    formData.append('uploadRole', 'student');
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
            this.getstudentData();
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

  /**
   * Update student status - Always set to 'Active' or 'InActive'
   */
  updateStatus(id: number, activate: boolean) {
    const statusPayload = {
      id: id,
      status: activate ? 'Active' : 'InActive'
    };

    this.http.putRequest('api/auth/updatestatus', statusPayload).subscribe({
      next: (response) => {
        console.log({ response });
        this.notificationService.showSuccess(`Student ${activate ? 'Activated' : 'Deactivated'} Successfully`, "Success");
        this.getstudentData(); // Refresh the table
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
    this.http.postRequest(ChangePasswordBySuperAdminOfStudent, formData).subscribe(
      (res) => {
        console.log({ res });
        this.buttonPass = 'Change Password';
        this.isLoading = false;
        this.notificationService.showSuccess("Password Change Success", "Success");
        this.closeChangePasswordModal();
      }, err => {
        this.buttonPass = 'Change Password';
        this.isLoading = false;
        this.notificationService.showError("Password Change Failed", "Failed");
      })
  }

  onColorChange(event: any) {
    this.colorTheme = event.target.value;
    console.log("Selected color:", this.colorTheme);
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

  clodeExcelModal() {
    this.dialogRef1?.close();
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  deleteStudent(studentId: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this student?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_student, studentId).subscribe((res) => {
          this.getstudentData();
          this.message.success('Student deleted successfully');
        }, err => {
          this.message.error('Student deleted failed');
        })
      },
      nzCancelText: 'No'
    });
  }

  seeParent(studentId: number, firstName: any, lastName: any, parentStatus: any) {
    if (parentStatus === "Pending") {
      localStorage.setItem('parentStatus', 'true');
    } else {
      localStorage.removeItem('parentStatus');
    }

    let fullName = `${firstName} ${lastName}`
    localStorage.setItem('studentfullName', fullName)
    this.router.navigate(
      ['/super_admin/Slayout/parent-management'],
      { queryParams: { studentID: studentId } }
    )
  }

  seeStandard(id: any) {
    this.router.navigate(
      ['/super_admin/Slayout/Assign-Standard-Wise-data-to-Student'],
      { queryParams: { studentID: id } }
    )
  }

  getteacherData() {
    this.http.getRequest(getAll_teacher).subscribe(
      (res: any) => {
        this.getAllTeacher = res;
        console.log({ getAllTeacher: res });
      })
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
    console.log('studentMasterModel', this.studentMasterModel);

    const formData = {
      ...this.regiStrationForm.value,
      role: 'student',
      status: 'Pending',
      profilePicture: this.serverImage,
      colorTheme: this.colorTheme,
      creatorId: sessionStorage.getItem('superadminId'),
    };
    console.log({ formData });

    this.http.postRequest(create_student, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';

        this.regiStrationForm.reset();
        this.close();
        this.showNotification('Student')
        this.isLoading = false;
        this.getstudentData();
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
   * Get students and filter to show ONLY Active and InActive
   * Filters out pending, Rejected, Deleted, 0, etc.
   */
  getstudentData() {
    this.http.getRequest(getAll_student).subscribe(
      (res: any) => {
        console.log('All students data:', res);
        
        // FILTER: Only show Active and InActive statuses
        const filteredData = res.filter((student: any) => {
          return this.shouldDisplayStatus(student.status);
        });
        
        console.log('Filtered students (Active/InActive only):', filteredData);
        
        this.dataSource = new MatTableDataSource(filteredData);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error fetching students:', error);
      }
    );
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing';
    console.log('studentMasterModel', this.studentMasterModel);
    const formData = {
      ...this.regiStrationForm.value,
      role: 'student',
      profilePicture: this.serverImage,
      creatorId: sessionStorage.getItem('superadminId'),
    };
    this.http.putRequest(update_student, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getstudentData();
        this.notificationService.showSuccess("User Updated Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("User Updated Failed", "Failed");
      })
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
    this.colorTheme = '#8f94fb';
    this.button = 'Submit';
    this.studentMasterModel = new studentMaster();
    this.resetTheForm()
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '800px',
      height: '800px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
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

  resetTheForm() {
    this.regiStrationForm.reset();
    this.regiStrationForm.markAsPristine();
    this.regiStrationForm.markAsUntouched();
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_student + id).subscribe(
      (data: any) => {
        console.log({ edit: data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '800px',
          height: '710px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.passwordStatus = false;
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;
        this.regiStrationForm.controls['password'].disable();
        this.colorTheme = data.colorTheme
        console.log('colorTheme =>' + this.colorTheme);

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
          profilePicture: data.profilePicture,
          status: data.status,
          expiryDate: data.expiryDate,
          teacherId: data.teacher?.id,
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
          this.notificationService.showSuccess('Successfully uploaded image', 'Success');
          this.isLoading = false;
          this.serverImage = data.path;
          this.regiStrationForm.patchValue({
            [controlName]: data.path
          });
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
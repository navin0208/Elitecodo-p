import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { companyMaster, teacherMaster, TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';
import { ChangePasswordBySuperAdminOfTeacher, create_teacher, delete_teacher, fileUpload, getActive_exam, getActive_subject, getAll_teacher, getAllActive_pattern, getAllActive_standard, getallteachers, getById_teacher, update_teacher } from 'src/app/shared/allURL';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MainURL } from 'src/app/ConfigUrl/config';
import { RoleService } from 'src/app/share-services/Roleservices/role.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-teacher-management',
  templateUrl: './teacher-management.component.html',
  styleUrls: ['./teacher-management.component.css', '../../../../assets/css/form.css', '../../../../assets/css/loading.css']
})
export class TeacherManagementComponent implements OnInit {
  http = inject(HttpmethodsService)
  https = inject(HttpClient)
  roleService = inject(RoleService)

  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  router = inject(Router)
  disabled: any;
  AddressData: any
  filetoUpload: any;
  passwordStatus: boolean = true;
  isSubmit: boolean = true;
  isUpdate: boolean = false;
  isLoading = false;
  dialogRef: any;
  dialogRef1: any;
  button = 'Submit';
  buttonPass = 'Change Password';
  row: any
  regiStrationForm!: FormGroup
  newPassswordForm!: FormGroup
  date: any
  teacherMasterModel = new teacherMaster();
  AttendanceShift: any
  modal = inject(NzModalService)
  message = inject(NzMessageService)
  loading: boolean = false; // Loading state


  typeIcon = TYPE.SUCCESS;
  errorMsg: boolean = false;

  minDate: string = '';
  standardsList: any[] = [];
  subjectsList: any[] = [];
  entranceExamList: any[] = [];
  selectedStandards: number[] = [];
  selectedSubjects: number[] = [];
  selectedExams: number[] = [];
  listOfOption: any[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'profilePicture', 'firstName', 'lastName', 'email', 'phone', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  userIDForEdit: any;
  colorTheme = '#8f94fb'; // Default color
  UserIDForPasswordChange: any;
  selectedFile: File | null = null;
  uploading = false;
  uploadStatus: { message: string; type: 'error' | 'success' } | null = null;
  dialogRefForExel: any;


  constructor() {
    this.getDataOfPattern();
  }


  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms()
    this.getteacherData();

    // Fetch the standards, subjects, and exams
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
   * Get CSS class for status badge
   */
  getStatusClass(status: string): string {
    if (this.isStatusActive(status)) {
      return 'activeStatus';
    }
    return 'inactiveStatus';
  }

  // ============ END HELPER FUNCTIONS ============

  registrationForms() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    this.regiStrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      colorTheme: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      address: ['', [Validators.required]],
      className: ['', [Validators.required]],
      studentKeys: ['', [Validators.required]],
      role: [''],
      creatorId: [''],
      profilePicture: [''],
      logoImage: [''],
      watermarkImage: [''],
      status: [''],
      patternIds: ['', [Validators.required]],
      // Access Controls
      expiryDate: [''],
      printAccess: [false],
      ormSheetAccess: [false],
      editAccess: [false],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
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

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.uploadStatus = {
          message: 'File size should not exceed 5MB',
          type: 'error'
        };
        return;
      }

      // Read the file to validate headers
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

  downloadTemplate() {
    const headers = [
      'firstName',
      'lastName',
      'mobile',
      'password',
      'confirmPassword',
      'colorTheme',
      'email',
      'address',
      'className',
      'studentKeys',
      'role',
      'profilePicture',
      'logoImage',
      'watermarkImage',
      'status',
      'patternIds',
      'expiryDate',
      'printAccess',
      'ormSheetAccess',
      'editAccess'
    ];

    // Create a workbook with a single worksheet containing just the headers
    const workbook = XLSX.utils.book_new();

    // Type the accumulator as a Record<string, string>
    const worksheet = XLSX.utils.json_to_sheet([headers.reduce((acc: Record<string, string>, header) => {
      acc[header] = ''; // Empty values for the template
      return acc;
    }, {})]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'User_Import_Template.xlsx');
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('creatorId', String(sessionStorage.getItem('superadminId')));
    formData.append('uploadRole', 'teacher');
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
            this.getteacherData();
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

  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
  }

  newPassswordForms() {
    this.newPassswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  getDataOfPattern() {
    this.http.getRequest(getAllActive_pattern).subscribe(((res: any) => {
      console.log({ getDataOfPattern: res });
      this.listOfOption = res;
    }))
  }

  onColorChange(event: any) {
    this.colorTheme = event.target.value; // Update colorTheme with selected color
    console.log("Selected color:", this.colorTheme); // Log to see the color change
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

  deleteTeacher(teacherId: any) {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Teacher?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_teacher, teacherId).subscribe((res) => {
          this.getteacherData();
          this.message.success('Teacher deleted successfully');
        }, err => {
          this.message.error('Teacher deleted failed');
        })
      },
      nzCancelText: 'No'
    });
  }

  changeStatus(id: any, status: string) {
    this.http.getRequest(getById_teacher + id).subscribe((res) => {
      console.log({ res });
    })
  }

  ChangePassword(id: any, templateRef: TemplateRef<any>) {
    this.showPassword = false;
    this.showConfirmPassword = false;
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
    this.isLoading = true;
    this.buttonPass = 'Processing';
    const formData = {
      confirmPassword: this.newPassswordForm.value.confirmPassword,
      newPassword: this.newPassswordForm.value.password,
      id: this.UserIDForPasswordChange
    }
    console.log({ newPassswordForm: formData });
    this.http.postRequest(ChangePasswordBySuperAdminOfTeacher, formData).subscribe(
      (res) => {
        console.log({ res });
        this.buttonPass = 'Change Password';
        this.isLoading = false;
        this.notificationService.showSuccess("Password Change Successfully", "Success");
        this.dialogRef1.close();
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

  seeStandard(id: any) {
    this.router.navigate(
      ['/super_admin/Slayout/Assign-Standard-Wise-data'],
      { queryParams: { teacherID: id } }
    )
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  updateStatus(id: number, activate: boolean) {

    const statusPayload = {
      id: id,
      status: activate ? 'Active' : 'InActive'
    };

    this.http.putRequest('api/auth/updatestatus', statusPayload).subscribe({
      next: (response) => {
        console.log({ response });
        this.notificationService.showSuccess(`Teacher ${activate ? 'Activated' : 'Deactivated'} Successfully`, "Success");
        this.getteacherData(); // Refresh the table
      },
      error: (error) => {
        // Handle error
        this.notificationService.showError("Failed to update status", "Failed");
        console.error('Status update error', error);
      }
    });
  }

  // Handlers for checkbox selection
  onStandardChange(standard: any, event: any) {
    if (event.checked) {
      this.selectedStandards.push(standard.standardId);
    } else {
      const index = this.selectedStandards.indexOf(standard.standardId);
      if (index > -1) {
        this.selectedStandards.splice(index, 1);
      }
    }
  }

  onSubjectChange(subject: any, event: any) {
    if (event.checked) {
      this.selectedSubjects.push(subject.subjectId);
    } else {
      const index = this.selectedSubjects.indexOf(subject.subjectId);
      if (index > -1) {
        this.selectedSubjects.splice(index, 1);
      }
    }
  }

  onExamChange(exam: any, event: any) {
    if (event.checked) {
      this.selectedExams.push(exam.entranceExamId);
    } else {
      const index = this.selectedExams.indexOf(exam.entranceExamId);
      if (index > -1) {
        this.selectedExams.splice(index, 1);
      }
    }
  }

  // Check if an option is already selected (for editing existing data)
  isStandardChecked(standard: any) {
    return this.selectedStandards.includes(standard.standardId);
  }

  isSubjectChecked(subject: any) {
    return this.selectedSubjects.includes(subject.subjectId);
  }

  isExamChecked(exam: any) {
    return this.selectedExams.includes(exam.entranceExamId);
  }

  resetTheForm() {
    // Clear the selected arrays
    this.selectedStandards = [];
    this.selectedSubjects = [];
    this.selectedExams = [];

    // Reset the form
    this.regiStrationForm.reset();

    // Optionally, you can mark the form fields as pristine/untouched
    this.regiStrationForm.markAsPristine();
    this.regiStrationForm.markAsUntouched();
    // You may also need to update the view if needed
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      ...this.regiStrationForm.value,
      colorTheme: this.colorTheme,
      status: 'Pending',
      role: 'teacher',
      creatorId: sessionStorage.getItem('superadminId'),
    };
    this.http.postRequest(create_teacher, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';

        this.regiStrationForm.reset();
        this.close();
        this.showNotification('Teacher');
        this.isLoading = false;
        this.getteacherData();
        this.notificationService.showSuccess("User Registration Success", "Success");
      }, (err) => {
        console.log({ err });
        if (err.status == 400) {
          this.notificationService.showError(`${err.error.message}`, "Failed");
        } else {
          this.notificationService.showError("User Registration Failed", "Failed");
        }
        this.button = 'Submit';
        this.isLoading = false;
      })
  }

  /**
   * Get teachers and filter to show ONLY Active and InActive
   * Filters out pending, Rejected, Deleted, 0, etc.
   */
  getteacherData() {
    this.loading = true;
    this.http.getRequest(getallteachers).subscribe(
      (res: any) => {
        console.log('All teachers data:', res);
        
        // FILTER: Only show Active and InActive statuses
        const filteredData = res.filter((teacher: any) => {
          return this.shouldDisplayStatus(teacher.status);
        });
        
        console.log('Filtered teachers (Active/InActive only):', filteredData);
        
        this.dataSource = new MatTableDataSource(filteredData);
        this.dataSource.paginator = this.paginator;
        this.errorMsg = false;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching teachers:', error);
        this.errorMsg = true;
        this.loading = false;
      }
    );
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing';
    let studentKeysData = +this.regiStrationForm.get('studentKeys')?.value;
    console.log({ studentKeysData });

    const formData = {
      ...this.regiStrationForm.value,
      role: 'teacher',
      id: this.userIDForEdit,
      studentKeys: studentKeysData,
      creatorId: sessionStorage.getItem('superadminId')
    };

    console.log({ formData });

    this.http.putRequest(update_teacher, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getteacherData();
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
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.regiStrationForm.controls['password'].enable();
    this.colorTheme = '#8f94fb'; // Default color
    this.button = 'Submit';
    this.teacherMasterModel = new teacherMaster();
    this.resetTheForm();
    this.isSubmit = true;
    this.passwordStatus = true;
    this.isUpdate = false;
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
    console.log({ id });
    this.http.getRequest(getById_teacher + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.userIDForEdit = data.id;
        this.dialogRef = this.dialog.open(templateRef, {
          width: '800px',
          height: '800px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.passwordStatus = true;
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;
        this.regiStrationForm.controls['password'].disable();
        this.colorTheme = data.colorTheme;
        console.log('colorTheme =>' + this.colorTheme);

        // Patch values to the form from the fetched data
        this.regiStrationForm.patchValue({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          studentKeys: data.studentKeys,
          mobile: data.mobile,
          email: data.email,
          className: data.className,
          password: data.password,
          expiryDate: data.expiryDate,
          confirmPassword: data.confirmPassword,
          role: data.roles[0]?.name, // Assuming role is the first one
          creatorId: data.creatorId,
          profilePicture: data.profilePicture,
          logoImage: data.logoImage,
          watermarkImage: data.watermarkImage,
          status: data.status,
          standardMasters: data.standardMasters,
          subjects: data.subjectMasters,
          entranceExamMasters: data.entranceExamMasters,
          ormSheetAccess: data.ormSheetAccess,
          printAccess: data.printAccess,
          editAccess: data.editAccess,
          address: data.address,
          patternIds: data.assignedPatterns.map((ptd: any) => ptd.patternId), // Extract standardIds from standardMasters

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
    const file = event.target.files[0];
    if (file) {
      // Check if file exists
      if (!file) {
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Only PNG,JPG and JPEG images are allowed', 'Invalid File Type');
        event.target.value = ''; // Clear the file input
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.notificationService.showError('File size should not exceed 5MB', 'File Too Large');
        event.target.value = ''; // Clear the file input
        return;
      }
      const formData = new FormData();
      formData.append('uploadfile', file);

      this.http.postRequest(fileUpload, formData).subscribe((data: any) => {
        if (data.status === true) {
          this.notificationService.showSuccess('Successfully uploaded image', 'Success');
          // Update the form control with the uploaded image path
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
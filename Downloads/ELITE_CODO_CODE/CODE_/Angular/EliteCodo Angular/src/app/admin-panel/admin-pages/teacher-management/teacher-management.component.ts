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
import { ChangePasswordBySuperAdminOfTeacher, create_teacher, delete_teacher, fileUpload, getActive_exam, getActive_subject, getAll_teacher, getAllActive_standard, getallteachers, getById_teacher, update_teacher } from 'src/app/shared/allURL';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RolesserviceForOthersService } from 'src/app/share-services/RolesserviceForOthers/rolesservice-for-others.service';
@Component({
  selector: 'app-teacher-management',
  templateUrl: './teacher-management.component.html',
  styleUrls: ['./teacher-management.component.css', '../../../../assets/css/form.css', '../../../../assets/css/loading.css']
})
export class TeacherManagementComponent implements OnInit {
  http = inject(HttpmethodsService);
  fb = inject(FormBuilder);
  notificationService = inject(NotificationService);
  dialog = inject(MatDialog);
  ActivateRoute = inject(ActivatedRoute);
  router = inject(Router);
  modal = inject(NzModalService);
  message = inject(NzMessageService);
  roleService = inject(RolesserviceForOthersService)
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

  loading: boolean = false; // Loading state


  typeIcon = TYPE.SUCCESS;
  errorMsg: boolean = false;


  standardsList: any[] = [];
  subjectsList: any[] = [];
  entranceExamList: any[] = [];
  selectedStandards: number[] = [];
  selectedSubjects: number[] = [];
  selectedExams: number[] = [];

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'firstName', 'profilePicture', 'lastName', 'email', 'phone', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  userIDForEdit: any;
  colorTheme = '#8f94fb'; // Default color
  UserIDForPasswordChange: any;

  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms()
    this.getteacherData();

    // Fetch the standards, subjects, and exams
  }

  registrationForms() {
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
      // Access Controls
      printAccess: [false],
      ormSheetAccess: [false],
      editAccess: [false],

    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  newPassswordForms() {
    this.newPassswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
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
    console.log({ teacherId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Teacher.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ teacherId });
    //     this.http.deleteRequest(delete_teacher, teacherId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Teacher has been deleted."`,
    //           icon: "success"
    //         });
    //         this.getteacherData();
    //       }, (err: any) => {
    //         swal.fire({
    //           text: "Something went wrong !!!",
    //           icon: "warning"
    //         })
    //       })
    //   }
    // });


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

  ChangePassword(id: any, templateRef: TemplateRef<any>) {
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.isSubmit = true;
    this.newPassswordForm.reset();
    this.dialogRef1 = this.dialog.open(templateRef, {
      width: '500px',
      height: '500px',
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
    this.dialogRef1.close();
  }

  seeStandard(id: any) {
    this.router.navigate(
      ['/admin/layout/Assign-Standard-Wise-data'],
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

  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      ...this.regiStrationForm.value,
      colorTheme: this.colorTheme,
      status: 'Pending',
      role: 'teacher',
      creatorId: sessionStorage.getItem('adminId'),
    };
    this.http.postRequest(create_teacher, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getteacherData();
        this.notificationService.showSuccess("User Registration Success", "Success");
        this.showNotification('Teacher');
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

  getteacherData() {
    this.loading = true; // Start loading
    this.http.getRequest(`${getallteachers}/${sessionStorage.getItem('adminId')}`).subscribe(
      (res: any) => {
        console.log({ getallteachers: res });
        let filterData = res.filter((teacher: any) => teacher.status == 'Active' || teacher.status == 'inactive');
        this.dataSource = new MatTableDataSource(filterData);
        // this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator
        this.errorMsg = false;
        this.loading = false; // Data loaded
      })
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
      creatorId: sessionStorage.getItem('adminId')
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
  updateStatus(id: number, activate: boolean) {


    const statusPayload = {
      id: id,
      status: activate ? 'Active' : 'inactive'
    };

    this.http.putRequest('api/auth/updatestatus', statusPayload).subscribe({
      next: (response) => {
        // Update the local data source
        const index = this.dataSource.data.findIndex(teacher => teacher.id === id);
        if (index !== -1) {
          this.dataSource.data[index].status = activate ? 'Active' : 'inactive';
          this.dataSource._updateChangeSubscription(); // Refresh the table view
        }
        this.notificationService.showSuccess(`Teacher ${activate ? 'Activated' : 'Deactivated'} Successfully`, "Success");
      },
      error: (error) => {
        // Handle error
        this.notificationService.showError("Failed to update status", "Failed");
        console.error('Status update error', error);
      }
    });
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
        this.passwordStatus = false;
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
          confirmPassword: data.confirmPassword,
          role: data.roles[0]?.name, // Assuming role is the first one
          creatorId: data.creatorId,
          profilePicture: data.profilePicture,
          logoImage: data.logoImage,
          watermarkImage: data.watermarkImage,
          status: data.status,
          address: data.address,
          ormSheetAccess: data.ormSheetAccess,
          printAccess: data.printAccess,
          editAccess: data.editAccess,

        });
        // Populate selected checkboxes for editing
        this.selectedStandards = data.standardMasters.map((s: any) => s.standardId);
        console.log('selectedStandards', this.selectedStandards);
        this.selectedSubjects = data.subjectMasters.map((s: any) => s.subjectId);
        this.selectedExams = data.entranceExamMasters.map((e: any) => e.entranceExamId);
      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  // To upload images
  // handleFileInput(e: FileList | any) {
  //   console.log(this.regiStrationForm.get('profilePicture')?.errors);
  //   this.filetoUpload = e.target.files.item(0);
  //   this.http
  //     .fileUpload(fileUpload, this.filetoUpload)
  //     .subscribe((data: any) => {
  //       console.log(data);
  //       if (data.status == true) {
  //         this.notificationService.showSuccess("Successfully Load Image", "Success");
  //         this.teacherMasterModel.profilePicture = data.path;
  //       } else {
  //         this.notificationService.showError("Something went wrong !!!", "Error");
  //       }
  //     }, err => {
  //       this.notificationService.showError("Something went wrong !!!", "Error");
  //     });
  // }
  handleFileInput(event: any, controlName: string) {
    this.isLoading = true;
    // this.button = 'image uploading';
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Only PNG, JPG and JPEG images are allowed', 'Invalid File Type');
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

      this.http.postRequest(fileUpload, formData).subscribe(
        (data: any) => {
          if (data && data.path) {
            this.notificationService.showSuccess('Successfully uploaded image', 'Success');
            this.isLoading = false;
            // this.button = 'Update';
            // Update the form control with the uploaded image path
            this.regiStrationForm.patchValue({
              [controlName]: data.path  // This should have the server path from your API
            });
          } else {
            this.notificationService.showError('Failed to upload image or missing path data', 'Error');
          }
        },
        error => {
          this.notificationService.showError('Something went wrong during the upload', 'Error');
        }
      );
    }
  }
  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}

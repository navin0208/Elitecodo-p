import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { RolesserviceForOthersService } from 'src/app/share-services/RolesserviceForOthers/rolesservice-for-others.service';
import { companyMaster, studentMaster, TYPE } from 'src/app/shared/AllModel';
import { ChangePasswordBySuperAdminOfStudent, create_student, delete_student, fileUpload, getActive_exam, getActive_subject, getAll_student, getAll_teacher, getAllActive_standard, getallteachers, getById_student, update_student } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
@Component({
  selector: 'app-student-management',
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.css', '../../../../assets/css/form.css']
})
export class StudentManagementComponent implements OnInit {
  typeIcon = TYPE.SUCCESS;

  http = inject(HttpmethodsService)
  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  roleService = inject(RolesserviceForOthersService)
  serverImage: any
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
  studentMasterModel = new studentMaster();
  AttendanceShift: any
  passwordStatus: boolean = true;
  buttonPass = 'Change Password';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'firstName', 'lastName', 'parentStatus', 'email', 'phone', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  getAllTeacher: any;
  newPassswordForm!: FormGroup
  UserIDForPasswordChange: any;
  dialogRef1: any;
  colorTheme = '#8f94fb'; // Default color

  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms();
    this.getstudentData();
    this.getteacherData();
  }

  registrationForms() {
    this.regiStrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      address: ['', [Validators.required]],
      profilePicture: [''],
      creatorId: [''],
      role: [''],
      id: [],
      colorTheme: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      status: [''],
      teacherId: [''],
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
      }, err => {
        this.buttonPass = 'Change Password';
        this.isLoading = false;
        this.notificationService.showError("Password Change Failed", "Failed");
      })
  }
  onColorChange(event: any) {
    this.colorTheme = event.target.value; // Update colorTheme with selected color
    console.log("Selected color:", this.colorTheme); // Log to see the color change
  }
  closeChangePasswordModal() {
    this.newPassswordForm.reset();
    this.dialogRef1.close();
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
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
            this.serverImage = data.path;
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


  deleteStudent(studentId: any) {
    console.log({ studentId });

    swal.fire({
      title: "Are you sure you want to delete this Student.?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        console.log({ studentId });
        this.http.deleteRequest(delete_student, studentId).subscribe(
          (res) => {
            console.log({ res });
            swal.fire({
              title: "Deleted!",
              text: `"Student has been deleted."`,
              icon: "success"
            });
            this.getstudentData();
          }, (err: any) => {
            swal.fire({
              text: "Something went wrong !!!",
              icon: "warning"
            })
          })
      }
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
      ['/admin/layout/parent-management'],
      { queryParams: { studentID: studentId } }
    )
  }

  seeStandard(id: any) {
    this.router.navigate(
      ['/admin/layout/Assign-Standard-Wise-data-to-Student'],
      { queryParams: { studentID: id } }
    )
  }
  getteacherData() {
    this.http.getRequest(`${getallteachers}/${sessionStorage.getItem('adminId')}`).subscribe(
      (res: any) => {
        this.getAllTeacher = res.filter((teacher: any) => teacher.status == 'Active');
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
      height: '400px',
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
      colorTheme: this.colorTheme,
      profilePicture: this.serverImage,
      creatorId: sessionStorage.getItem('adminId'),
    };
    console.log({ formData });


    this.http.postRequest(create_student, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getstudentData();
        this.notificationService.showSuccess("User Registration Success", "Success");
        this.showNotification('Student');

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
  getstudentData() {
    this.http.getRequest(`${getAll_student}/${sessionStorage.getItem('adminId')}`).subscribe(
      (res: any) => {
        console.log({ res });
        let filterData = res.filter((student: any) => student.status == 'Active' || student.status == 'inactive');
        this.dataSource = new MatTableDataSource(filterData);
        // this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator
      })
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
      creatorId: sessionStorage.getItem('adminId'),
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
    this.colorTheme = '#8f94fb'; // Default color
    this.button = 'Submit';
    this.studentMasterModel = new studentMaster();
    this.resetTheForm()
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '800px',
      height: '850px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  resetTheForm() {

    // Reset the form
    this.regiStrationForm.reset();

    // Optionally, you can mark the form fields as pristine/untouched
    this.regiStrationForm.markAsPristine();
    this.regiStrationForm.markAsUntouched();

    // You may also need to update the view if needed
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
  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_student + id).subscribe(
      (data: any) => {
        console.log({ edit: data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '800px',
          height: '700px',
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

        // this.studentMasterModel.role = data[0].roles.name;
        this.serverImage = data.profilePicture;

        // Patch values to the form from the fetched data
        this.regiStrationForm.patchValue({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile,
          email: data.email,
          // className: data.className,
          password: data.password,
          confirmPassword: data.confirmPassword,
          creatorId: data.creatorId,
          profilePicture: data.profilePicture,
          status: data.status,
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


  // To upload images


  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}

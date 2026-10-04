import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { RolesserviceForOthersService } from 'src/app/share-services/RolesserviceForOthers/rolesservice-for-others.service';
import { companyMaster, teacherMaster, TYPE } from 'src/app/shared/AllModel';
import { ChangePasswordByInstitution, create_Institution, delete_Institution, fileUpload, getAll_Institution, getallactiveteachers_Institution, getById_Institution, update_Institution } from 'src/app/shared/allURL';
import swal from 'sweetalert2';

@Component({
  selector: 'app-institution-management',
  templateUrl: './institution-management.component.html',
  styleUrls: ['./institution-management.component.css', '../../../../assets/css/form.css']
})
export class InstitutionManagementComponent {
  http = inject(HttpmethodsService)
  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  roleService = inject(RolesserviceForOthersService)

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

  regiStrationForm!: FormGroup
  newPassswordForm!: FormGroup
  date: any
  InstitutionMasterModel = new teacherMaster();
  AttendanceShift: any
  typeIcon = TYPE.SUCCESS;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  serverImagephoto: any
  serverImagelogo: any
  serverImagewatermarkImage: any
  userIDForEdit: any;
  colorTheme = '#8f94fb'; // Default color
  UserIDForPasswordChange: any;

  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ["id", 'instituteName', 'photo', 'slogan', 'email', 'status', 'edit'];

  ngOnInit(): void {
    this.registrationForms();
    this.newPassswordForms()
    this.getgetAllInstitutionData();
  }

  registrationForms() {
    this.regiStrationForm = this.fb.group({
      instituteName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+( [a-zA-Z]+)*$')]],
      photo: [''],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      logoImage: [''],
      watermarkImage: [''],
      slogan: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+( [a-zA-Z]+)*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      id: [],

      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],

      expiryDate: ['', [Validators.required]],
      teacherKeys: ['', [Validators.required]],
      status: [''],
      // Access Controls
      printAccess: [false],
      ormSheetAccess: [false],
    }, { validator: this.mustMatch('password', 'confirmPassword') });
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

  deleteInstitution(InstitutionId: any) {
    console.log({ InstitutionId });
    swal.fire({
      title: "Are you sure you want to delete this Institution.?",
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
              text: `"Institution has been deleted."`,
              icon: "success"
            });
            this.getgetAllInstitutionData();
          }, (err: any) => {
            swal.fire({
              text: "Something went wrong !!!",
              icon: "warning"
            })
          })
      }
    });
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

  submitChangePassword() {
    this.isLoading = true;
    this.buttonPass = 'Processing';
    const formData = {
      confirmPassword: this.newPassswordForm.value.confirmPassword,
      newPassword: this.newPassswordForm.value.password,
      id: this.UserIDForPasswordChange
    }
    console.log({ newPassswordForm: formData });
    this.http.postRequest(ChangePasswordByInstitution, formData).subscribe(
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

  resetTheForm() {
    this.regiStrationForm.reset();
    this.regiStrationForm.markAsPristine();
    this.regiStrationForm.markAsUntouched();
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      ...this.regiStrationForm.value,

      role: 'institute',
      status: 'Pending',
      logoImage: this.serverImagelogo,


      creatorId: sessionStorage.getItem('adminId'),
    };
    this.http.postRequest(create_Institution, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getgetAllInstitutionData();
        this.notificationService.showSuccess("User Registration Success", "Success");
        this.showNotification('Institution');

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

  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
  }

  getgetAllInstitutionData() {
    this.http.getRequest(`${getallactiveteachers_Institution}/${sessionStorage.getItem('adminId')}`).subscribe(
      (res: any) => {
        console.log({ getallteachers: res });
        let filterData = res.filter((institute: any) => institute.status == 'Active' || institute.status == 'inactive');
        this.dataSource = new MatTableDataSource(filterData);
        // this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
      })
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing';
    const formData = {
      ...this.regiStrationForm.value,
      role: 'institution',
      photo: this.serverImagephoto,
      logo: this.serverImagelogo,
      creatorId: sessionStorage.getItem('adminId')
    };

    console.log({ formData });

    this.http.putRequest(update_Institution, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getgetAllInstitutionData();
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
    this.regiStrationForm.controls['password'].enable();
    this.colorTheme = '#8f94fb'; // Default color
    this.button = 'Submit';
    this.InstitutionMasterModel = new teacherMaster();
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
    this.http.getRequest(getById_Institution + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.userIDForEdit = data.id;
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
        // Patch values to the form from the fetched data
        // this.serverImagelogo = data.logoImage;
        // Patch values to the form from the fetched data
        this.regiStrationForm.patchValue({
          ...data,
          name: data.instituteName,
          logo: data.logoImage
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
    // this.button = 'image uploading';
    const file = event.target.files[0];
    if (file) {

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
        if (data) {
          this.notificationService.showSuccess('Successfully uploaded image', 'Success');
          this.isLoading = false;
          // this.button = 'Update';
          // Update the form control with the uploaded image path
          this.regiStrationForm.patchValue({
            [controlName]: data.path
          });

          this.serverImagelogo = data.path;
          console.log('logoImagesss')

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
import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { companyMaster, TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { ChangePasswordByparent, create_parent, delete_parent, fileUpload, getAll_parent, getAll_student, getById_parent, update_parent } from 'src/app/shared/allURL';
import { RolesserviceForOthersService } from 'src/app/share-services/RolesserviceForOthers/rolesservice-for-others.service';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  status: string;
}

@Component({
  selector: 'app-parent-management',
  templateUrl: './parent-management.component.html',
  styleUrls: ['./parent-management.component.scss', '../../../../assets/css/form.css']
})
export class ParentManagementComponent {
  http = inject(HttpmethodsService)
  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  router = inject(Router)
  roleService = inject(RolesserviceForOthersService)

  disabled: any;
  AddressData: any
  filetoUpload: any;

  passwordStatus: boolean = true;
  isSubmit: boolean = true;
  isUpdate: boolean = false;
  isLoading = false;
  isEdit = false;

  studentName: any;

  allStudents: any;

  dialogRef: any;
  dialogRef1: any;

  button = 'Submit';
  buttonPass = 'Change Password';

  regiStrationForm!: FormGroup
  newPassswordForm!: FormGroup
  date: any
  AttendanceShift: any
  typeIcon = TYPE.SUCCESS;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  selectedStudentId: any; // To store the selected student's ID

  searchValue: any;

  selectedUser: any;
  userIDForEdit: any;
  colorTheme = '#8f94fb'; // Default color
  UserIDForPasswordChange: any;


  inputValue?: string;
  options: string[] = [];
  // Ensure the URL is correct and accessible
  activeStudentsUrl = 'api/auth/getallactivestudents';

  // Use a BehaviorSubject for search
  searchChange$ = new BehaviorSubject<string>('');

  // Student-related properties
  studentOptionList: Student[] = [];
  selectedStudents: number[] = [];

  // Subscription to manage observable
  private studentListSubscription: Subscription | null = null;
  // Disable default filter behavior
  nzFilterOption = () => true;
  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ["id", 'firstName', 'profilePicture', 'lastName', 'email', 'phone', 'status', 'edit'];
  filteredStudents: any;
  studentId: any;

  ngOnInit(): void {
    this.getDataFromQueryParams()
    this.registrationForms();
    this.newPassswordForms();

    this.studentName = localStorage.getItem('studentfullName')
  }

  getDataFromQueryParams() {
    this.ActivateRoute.queryParams.subscribe(params => {
      let studentId = +params['studentID'];
      this.selectedStudentId = +params['studentID'];

      console.log({ studentId });

      this.getParentIdByStudentData(studentId)
    });
  }


  getParentIdByStudentData(id: any) {
    this.http.getRequest(`api/auth/studentwiseparent/${id}`).subscribe(
      (res: any) => {
        console.log({ getParentIdByStudentData: res });

        if (res && res.id) {
          // Parent data exists, switch to update mode
          this.isSubmit = false;
          this.isUpdate = true;
          this.button = 'Update';
          this.userIDForEdit = res.id;

          this.regiStrationForm.patchValue({
            firstName: res.firstName,
            lastName: res.lastName,
            mobile: res.mobile,
            email: res.email,
            address: res.address,
            password: res.password,
            confirmPassword: res.confirmPassword,
            colorTheme: res.colorTheme || '#8f94fb',
            studentId: id // Set the student ID
          });

          // Disable password fields for existing parent
          this.passwordStatus = false;
          this.regiStrationForm.get('password')?.disable();
          this.regiStrationForm.get('confirmPassword')?.disable();
        } else {
          // No parent data exists, prepare for new parent creation
          this.isSubmit = true;
          this.isUpdate = false;
          this.button = 'Submit';

          // Pre-fill student ID for new parent creation
          this.regiStrationForm.patchValue({
            studentId: id
          });
        }
        let parentStatus = !!localStorage.getItem('parentStatus');
        let status = parentStatus && this.isUpdate
        if (status) {
          this.notificationService.showInfo('Parent Activation is remain from Administrative',
            "Pending"
          );
        }
      },
      (error) => {
        // Handle error - likely no parent exists for this student
        console.error('Error fetching parent data', error);
        this.isSubmit = true;
        this.isUpdate = false;
        this.button = 'Submit';

        // Pre-fill student ID for new parent creation
        this.regiStrationForm.patchValue({
          studentId: id
        });
      }
    );
  }
  registrationForms() {
    this.regiStrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      studentId: ['', [Validators.required]],
      colorTheme: [this.colorTheme, Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required,  Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)]],
      role: [''],
      creatorId: [''],
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
    if (this.regiStrationForm.invalid) {
      this.regiStrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      ...this.regiStrationForm.value,
      studentId: this.regiStrationForm.get('studentId')?.value,
      colorTheme: this.colorTheme,
      status: 'Pending',
      role: 'parent',
      creatorId: sessionStorage.getItem('teacherId'),
    };

    this.http.postRequest(create_parent, formData).subscribe(
      (res) => {
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.isLoading = false;
        this.showNotification('parent');

        this.notificationService.showSuccess("Parent Registration Success", "Success");
        this.getParentIdByStudentData(this.selectedStudentId)

        // Optionally navigate back or refresh the page
        this.router.navigate(['/student-management']); // Adjust route as needed
      },
      (err) => {
        console.error(err);
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError(
          err.error?.message || "Parent Registration Failed",
          "Failed"
        );
      }
    );
  }

  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
  }


  update() {
    if (this.regiStrationForm.invalid) {
      this.regiStrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.button = 'Processing';

    const formData = {
      ...this.regiStrationForm.value,
      id: this.userIDForEdit,
      role: 'parent',
      creatorId: sessionStorage.getItem('teacherId')
    };

    this.http.putRequest(`api/auth/updateparent`, formData).subscribe(
      (res) => {
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.isLoading = false;
        this.notificationService.showSuccess("Parent Updated Successfully", "Success");
        this.getParentIdByStudentData(this.selectedStudentId)
        // Optionally navigate back or refresh the page
        this.router.navigate(['/student-management']); // Adjust route as needed
      },
      (err) => {
        console.error(err);
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError(
          err.error?.message || "Parent Update Failed",
          "Failed"
        );
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
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.regiStrationForm.controls['password'].enable();
    this.colorTheme = '#8f94fb'; // Default color
    this.button = 'Submit';
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

  edit(id: any) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_parent + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.userIDForEdit = data.id;
        this.passwordStatus = false;
        this.isEdit = true;
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;
        this.regiStrationForm.controls['password'].disable();
        this.colorTheme = data.colorTheme
        console.log('colorTheme =>' + this.colorTheme);

        // Patch values to the form from the fetched data
        this.regiStrationForm.patchValue({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.roles[0]?.name, // Assuming role is the first one
          creatorId: data.creatorId,
          profilePicture: data.profilePicture,
          logoImage: data.logoImage,
          watermarkImage: data.watermarkImage,
          status: data.status,
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
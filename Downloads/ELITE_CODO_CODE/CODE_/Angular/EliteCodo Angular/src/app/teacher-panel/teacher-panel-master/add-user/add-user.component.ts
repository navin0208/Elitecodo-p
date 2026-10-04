import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { RolesserviceForOthersService } from 'src/app/share-services/RolesserviceForOthers/rolesservice-for-others.service';
import { studentMaster } from 'src/app/shared/AllModel';
import { create_parent, create_student, delete_student, fileUpload, getAll_student, getAll_teacher, getById_student, update_student } from 'src/app/shared/allURL';
interface DashboardCount {
  studentCount: number;
  parentCount: number;
  questionCount: number;
  testCount: number;
  // You can add other possible properties if needed
}

// Example usage
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss', '../../../../assets/css/form.css'],
})
export class AddUserComponent implements OnInit {
  // Form and Modal
  form!: FormGroup;
  regiStrationForm!: FormGroup;
  isModalVisible = false;
  modalTitle = '';
  activeType: 'teacher' | 'student' = 'teacher';
  isEditing = false;
  currentEditId: string | null = null;
  ActivateRoute = inject(ActivatedRoute);
  router = inject(Router);
  searchQuery: string = '';
  filteredStudentData: any[] = [];
  http = inject(HttpmethodsService);
  // Table data
  studentData: any;
  teacherData: any[] = [];

  passwordStatus: boolean = true;
  isSubmit: boolean = true;
  isUpdate: boolean = false;
  studentMasterModel = new studentMaster();
  getAllTeacher: any;
  options: string[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  route = inject(Router);
  notificationService = inject(NotificationService);
  dialog = inject(MatDialog);
  dialogRef: any;
  button = 'Submit';
  colorTheme = '#8f94fb'; // Default color
  disabled: any;
  roleService = inject(RolesserviceForOthersService);

  // Loading states
  isLoading = false;

  // Statistics
  statistics = {
    totalTeachers: 0,
    totalStudents: 0,
    totalDepartments: 0,
    totalClasses: 0,
  };

  dashboardCount: DashboardCount = {
    studentCount: 0,
    parentCount: 0,
    questionCount: 0,
    testCount: 0
  };
  serverImage: any;
  // { "studentCount": 11, "parentCount": 0, "questionCount": 28, "testCount": 0 }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService
  ) {
    this.initForm();
    this.registrationForms();
  }

  ngOnInit(): void {

    this.getteacherData();
    this.loadInitialData();
    this.updateStatistics();
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
      colorTheme: [''],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      status: [''],
      teacherId: ['']
    }, { validator: this.mustMatch('password', 'confirmPassword') });
  }

  mustMatch(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passControl = formGroup.controls[password];
      const confirmPassControl = formGroup.controls[confirmPassword];

      if (
        confirmPassControl.errors &&
        !confirmPassControl.errors['mustMatch']
      ) {
        return;
      }

      if (passControl.value !== confirmPassControl.value) {
        confirmPassControl.setErrors({ mustMatch: true });
      } else {
        confirmPassControl.setErrors(null);
      }
    };
  }
  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredStudentData = this.studentData;
    } else {
      this.filteredStudentData = this.studentData.filter(
        (student: any) =>
          student.firstName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          student.lastName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          student.email
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          student.mobile.includes(this.searchQuery)
      );
    }
  }
  seeParent(
    studentId: number,
    firstName: any,
    lastName: any,
    parentStatus: any
  ) {
    const boardName = this.ActivateRoute.snapshot.paramMap.get('name');

    if (parentStatus === 'Pending') {
      localStorage.setItem('parentStatus', 'true');
    } else {
      localStorage.removeItem('parentStatus');
    }

    let fullName = `${firstName} ${lastName}`;
    localStorage.setItem('studentfullName', fullName);
    this.router.navigate([`/teacher/${boardName}/parent-management`], {
      queryParams: { studentID: studentId },
    });
  }

  // routToBoardDash(board: any) {
  //   // this.route.navigateByUrl(`teacher/${boardName}/test/${board}`)

  //   this.route.navigate(
  //     [`/teacher/${boardName}parent-management`], { queryParams: { type: `${board}` } }
  //   );
  // }

  seeStandard(id: any) {
    const boardName = this.ActivateRoute.snapshot.paramMap.get('name');

    this.router.navigate(
      [`/teacher/${boardName}/Assign-Standard-Wise-data-to-Student`],
      { queryParams: { studentID: id } }
    );
  }
  // Initialize form
  private initForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      department: [null],
      class: [null],
      guardianName: [null],
      rollNo: [null],
      status: ['Active'],
    });
  }
  updateStatus(id: number, activate: boolean) {
    const statusPayload = {
      id: id,
      status: activate ? 'Active' : 'inactive',
    };

    // Call your service method to update the status
    this.http.putRequest('api/auth/updatestatus', statusPayload).subscribe({
      next: (response) => {
        // Update the local data source
        const index = this.filteredStudentData.findIndex((teacher: any) => teacher.id === id);
        if (index !== -1) {
          this.filteredStudentData[index].status = activate ? 'Active' : 'inactive';
          // If you're using some table update method, call it here
          // For example, if you're using Angular's change detection, you might need to:
          this.filteredStudentData = [...this.filteredStudentData]; // Trigger change detection
        }
        this.notificationService.showSuccess(
          `Teacher ${activate ? 'Activated' : 'Deactivated'} Successfully`,
          'Success'
        );
      },
      error: (error) => {
        // Handle error
        this.notificationService.showError('Failed to update status', 'Failed');
        console.error('Status update error', error);
      },
    });
  }
  // Load mock data
  private loadInitialData(): void {
    // Mock teacher data ddfdf

    this.getstudentData();
    // Mock student data
    // this.studentData = [
    //   {
    //     key: '1',
    //     name: 'Alice Johnson',
    //     email: 'alice@school.com',
    //     class: '10th',
    //     rollNo: 'A001',
    //     guardianName: 'Robert Johnson',
    //     phone: '5555555555'
    //   },
    //   {
    //     key: '2',
    //     name: 'Bob Wilson',
    //     email: 'bob@school.com',
    //     class: '11th',
    //     rollNo: 'B002',
    //     guardianName: 'Mary Wilson',
    //     phone: '6666666666'
    //   },
    //   {
    //     key: '1',
    //     name: 'Alice Johnson',
    //     email: 'alice@school.com',
    //     class: '10th',
    //     rollNo: 'A001',
    //     guardianName: 'Robert Johnson',
    //     phone: '5555555555'
    //   },
    //   {
    //     key: '2',
    //     name: 'Bob Wilson',
    //     email: 'bob@school.com',
    //     class: '11th',
    //     rollNo: 'B002',
    //     guardianName: 'Mary Wilson',
    //     phone: '6666666666'
    //   },
    //   {
    //     key: '1',
    //     name: 'Alice Johnson',
    //     email: 'alice@school.com',
    //     class: '10th',
    //     rollNo: 'A001',
    //     guardianName: 'Robert Johnson',
    //     phone: '5555555555'
    //   },
    //   {
    //     key: '2',
    //     name: 'Bob Wilson',
    //     email: 'bob@school.com',
    //     class: '11th',
    //     rollNo: 'B002',
    //     guardianName: 'Mary Wilson',
    //     phone: '6666666666'
    //   },
    // ];
  }

  getDashCount() {
    this.http.getRequest(`api/auth/dashboardCount/${Number(sessionStorage.getItem('teacherId'))}`).subscribe(
      (res: any) => {
        this.dashboardCount = res;
      },
      (error) => {
        console.error('Error fetching dashboard count:', error);
        // Optionally reset to default values or show error message
      }
    );
  }


  getteacherData() {
    this.http.getRequest(getAll_teacher).subscribe(
      (res: any) => {
        this.getAllTeacher = res;
        this.getDashCount()
        console.log({ getAllTeacher: res });
      })
  }
  onColorChange(event: any) {
    this.colorTheme = event.target.value; // Update colorTheme with selected color
    console.log('Selected color:', this.colorTheme); // Log to see the color change
  }
  // closeChangePasswordModal() {
  //   this.newPassswordForm.reset();
  //   this.dialogRef1.close();
  // }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  // Update statistics
  private updateStatistics(): void {
    this.statistics = {
      totalTeachers: this.teacherData.length,
      totalStudents: this.studentData.length,
      totalDepartments: new Set(this.teacherData.map((t: any) => t.department))
        .size,
      totalClasses: new Set(this.studentData.map((s: any) => s.class)).size,
    };
  }
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.options = value ? [value, value + value, value + value + value] : [];
  }

  // Handle modal cancel

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.regiStrationForm.reset();
    this.passwordStatus = true;
    this.regiStrationForm.controls['password'].enable();
    this.colorTheme = '#8f94fb'; // Default color
    this.button = 'Submit';
    this.studentMasterModel = new studentMaster();
    // this.resetTheForm()
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '650px',
      height: '800px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: [
        'animate__animated',
        'animate__slideInLeft',
        'custom-animation',
      ],
    });
  }

  submit(role: any) {
    this.isLoading = true;
    this.button = 'Processing';
    console.log('studentMasterModel', this.studentMasterModel);

    if (role == 'student') {
      const formData = {
        ...this.regiStrationForm.value,
        role: 'student',
        status: 'Pending',
        profilePicture: this.serverImage,
        colorTheme: this.colorTheme,
        teacherId: Number(sessionStorage.getItem('teacherId')),
        creatorId: sessionStorage.getItem('teacherId'),
      };
      console.log({ student: formData });
      this.http.postRequest(create_student, formData).subscribe(
        (res) => {
          console.log({ res });
          this.button = 'Submit';
          this.regiStrationForm.reset();
          this.close();
          this.isLoading = false;
          this.showNotification('Student');

          this.getstudentData();
          this.notificationService.showSuccess(
            'User Registration Success',
            'Success'
          );
        },
        (err) => {
          console.log({ err });
          this.button = 'Submit';
          this.isLoading = false;
          if (err.error.responseCode == 403) {
            this.notificationService.showError(err.error.message, 'Failed');
          } else if (err.status == 400) {
            this.notificationService.showError(
              `${err.error.message}`,
              'Failed'
            );
          } else {
            this.notificationService.showError(
              'User Registration Failed',
              'Failed'
            );
          }
        }
      );
    } else {
      const formData = {
        ...this.regiStrationForm.value,
        colorTheme: this.colorTheme,
        profilePicture: this.serverImage,
        role: 'parent',
        creatorId: sessionStorage.getItem('teacherId'),
      };

      console.log({ parent: formData });

      this.http.postRequest(create_parent, formData).subscribe(
        (res) => {
          console.log({ res });
          this.button = 'Submit';
          this.regiStrationForm.reset();
          this.close();
          this.isLoading = false;
          this.getgetAllparentData();
          this.notificationService.showSuccess(
            'User Registration Success',
            'Success'
          );
        },
        (err) => {
          console.log({ err });
          if (err.status == 400) {
            this.notificationService.showError(
              `${err.error.message}`,
              'Failed'
            );
          } else {
            this.notificationService.showError(
              'User Registration Failed',
              'Failed'
            );
          }
          this.button = 'Submit';
          this.isLoading = false;
        }
      );
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
        if (data && data.path) {
          // Update the form control with the uploaded image path
          this.notificationService.showSuccess('Successfully uploaded image', 'Success');
          this.serverImage = data.path;

          this.isLoading = false;
          // this.button = 'Update';
          // Fix: Update the form control with the actual server path, not the local file path
          setTimeout(() => {
            console.log(`Updated ${controlName} with server path:`, data.path);
          });
          this.regiStrationForm.get('profilePicture')?.setValue(data.path);

        } else {
          this.notificationService.showError('Failed to upload image', 'Error');
        }
      }, error => {
        this.notificationService.showError('Something went wrong during the upload', 'Error');
      });
    }
  }
  showNotification(roleName: string): void {
    this.roleService.showRoleCreationSuccess(roleName);
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
      teacherId: sessionStorage.getItem('teacherId'),
      creatorId: sessionStorage.getItem('teacherId'),
    };
    this.http.putRequest(update_student, formData).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getstudentData();
        this.notificationService.showSuccess('User Updated Success', 'Success');
      },
      (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError('User Updated Failed', 'Failed');
      }
    );
  }

  getgetAllparentData() {}

  getstudentData() {
    this.http
      .getRequest(
        `api/auth/getAllStudentByTeachId/${sessionStorage.getItem('teacherId')}`
      )
      .subscribe((res: any) => {
        console.log({ res });
        this.studentData = res;
        this.teacherData = res;
        this.filteredStudentData = res; // Initialize filtered data with all students
      });
  }

  close() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
  }
  // Submit form

  // Edit functions
  edit(role: any, id: any, templateRef: TemplateRef<any>): void {
    this.button = 'Update';
    if (role == 'student') {
      this.http.getRequest(getById_student + id).subscribe(
        (data: any) => {
          console.log({ edit: data });
          this.dialogRef = this.dialog.open(templateRef, {
            width: '650px',
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
            address: data.address,
            password: data.password,
            confirmPassword: data.confirmPassword,
            creatorId: data.creatorId,
            profilePicture: data.profilePicture,
            status: data.status,
            teacherId: data.teacher?.id,
          });
          // Populate selected checkboxes for editing
        })
    } else {
    }
  }

  delete(role: any, data: any): void {}

  // Delete functions
  deleteTeacher(key: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this teacher?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.teacherData = this.teacherData.filter((t: any) => t.key !== key);
        this.updateStatistics();
        this.message.success('Teacher deleted successfully');
      },
      nzCancelText: 'No',
    });
  }

  deleteStudent(studentId: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this student?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_student, studentId).subscribe(
          (res) => {
            this.getstudentData();
            this.message.success('Student deleted successfully');
          },
          (err) => {
            this.message.error('Student deleted failed');
          }
        );
      },
      nzCancelText: 'No',
    });
  }

  // Export functions
  exportTeacherData(): void {
    // Implement export functionality (e.g., to CSV/Excel)
    console.log('Exporting teacher data...');
  }

  exportStudentData(): void {
    // Implement export functionality (e.g., to CSV/Excel)
    console.log('Exporting student data...');
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return `${fieldName} is required`;
    if (control.hasError('email')) return 'Invalid email address';
    if (control.hasError('pattern')) return 'Invalid format';
    return '';
  }
}

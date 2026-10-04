import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { entranceExamMaster } from 'src/app/shared/adminModel';
import { TYPE } from 'src/app/shared/AllModel';
import { create_exam, fileUpload, getAll_exam, update_exam, getById_exam, getAllActive_standard, delete_Exam } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
@Component({
  selector: 'app-exam-management',
  templateUrl: './exam-management.component.html',
  styleUrls: ['./exam-management.component.css', '../../../../assets/css/form.css']
})
export class ExamManagementComponent implements OnInit {
  typeIcon = TYPE.SUCCESS;

  http = inject(HttpmethodsService)
  fb = inject(FormBuilder)
  notificationService = inject(NotificationService)
  dialog = inject(MatDialog)
  ActivateRoute = inject(ActivatedRoute)
  router = inject(Router)
  modal = inject(NzModalService);
  message = inject(NzMessageService);
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
  examMasterModel = new entranceExamMaster();
  AttendanceShift: any


  listOfOption: any

  listOfSelectedValue = [];


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'image', 'entranceExamName', 'standardName', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  activestandard: any;
  selectedCountry: any;

  ngOnInit(): void {
    this.examForm();
    this.getexamData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      entranceExamName: ['', [Validators.required]],
      image: ['', [Validators.required]],
      entranceExamId: ['',],
      date: [''],
      standardIds: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing';
    const formValue = this.regiStrationForm.value;
    console.log({ formValue });
    console.log('Final Form Data', formValue);
    this.http.postRequest(create_exam, this.regiStrationForm.value).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Exam created successfully", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Exam created Failed", "Failed");
      })
  }

  deleteExam(examId: any) {
    console.log({ examId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Exam.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ examId });
    //     this.http.deleteRequest(delete_Exam, examId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Exam has been deleted."`,
    //           icon: "success"
    //         });
    //         this.getexamData()
    //       }, (err: any) => {
    //         swal.fire({
    //           text: "Something went wrong !!!",
    //           icon: "warning"
    //         })
    //       })
    //   }
    // });


    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Exam?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_Exam, examId).subscribe((res) => {
          this.getexamData();
          this.message.success('Exam deleted successfully');
        }, err => {
          this.message.error('Exam deleted failed');
        })
      },
      nzCancelText: 'No'
    });
  }

  getStandardActiveData() {
    this.http.getRequest(getAllActive_standard).subscribe(
      (res: any) => {
        console.log({ getStandardActiveData: res });
        this.listOfOption = res
      })
  }

  getexamData() {
    this.http.getRequest(getAll_exam).subscribe(
      (res: any) => {
        console.log({ res });
        this.getStandardActiveData();
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator
      })
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing',
      console.log('regiStrationForm.value', this.regiStrationForm.value);
    this.http.putRequest(update_exam, this.regiStrationForm.value).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Exam Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Exam Updation Failed", "Failed");
      })
  }

  close() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
  }
  handleFileInput(event: any, controlName: string) {

    this.isLoading = true;
    // this.button = 'image uploading';


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
          this.isLoading = false;
          // this.button = 'Update';
          // Update the form control with the uploaded image path
          // this.regiStrationForm.setValue({
          //   image: data.path
          // });
          this.regiStrationForm.get('image')?.setValue(data.path);

        } else {
          this.notificationService.showError('Failed to upload image', 'Error');
        }
      }, error => {
        this.notificationService.showError('Something went wrong during the upload', 'Error');
      });
    }
  }
  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.button = 'Submit';
    this.examMasterModel = new entranceExamMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '600px',
      height: '600px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_exam + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '600px',
          height: '600px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        this.examMasterModel = data;

        // Populate the form with the fetched exam details
        this.regiStrationForm.patchValue({
          entranceExamId: data.entranceExamId,
          image: data.image,
          entranceExamName: data.entranceExamName,   // Set the exam name
          standardIds: data.standardMasters.map((std: any) => std.standardId), // Extract standardIds from standardMasters
          status: data.status // Set the status (Active/In-Active)
        });

      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // Set custom filter predicate
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // Check top-level properties
      const mainPropsMatch =
        (data.entranceExamName?.toLowerCase().includes(filter)) ||
        (data.status?.toLowerCase().includes(filter)) ||
        (data.date?.toLowerCase().includes(filter)) ||
        (data.entranceExamId?.toString().includes(filter));

      // Check nested standardMasters properties
      const standardsMatch = data.standardMasters?.some((standard: any) =>
        standard.standardName?.toLowerCase().includes(filter) ||
        standard.standardId?.toString().includes(filter) ||
        standard.date?.toLowerCase().includes(filter) ||
        standard.status?.toLowerCase().includes(filter)
      );

      return mainPropsMatch || standardsMatch;
    };

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}

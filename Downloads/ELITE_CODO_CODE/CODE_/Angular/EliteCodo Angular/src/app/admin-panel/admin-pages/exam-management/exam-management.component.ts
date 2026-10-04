import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { entranceExamMaster } from 'src/app/shared/adminModel';
import { create_exam, fileUpload, getAll_exam, update_exam, getById_exam, getAllActive_standard } from 'src/app/shared/allURL';
@Component({
  selector: 'app-exam-management',
  templateUrl: './exam-management.component.html',
  styleUrls: ['./exam-management.component.css', '../../../../assets/css/form.css']
})
export class ExamManagementComponent implements OnInit {
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
  examMasterModel = new entranceExamMaster();
  AttendanceShift: any


  listOfOption: any

  listOfSelectedValue = [];


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'entranceExamName', 'standardName', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  activestandard: any;

  ngOnInit(): void {
    this.examForm();
    this.getexamData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      entranceExamName: ['', [Validators.required]],
      entranceExamId: ['',],
      date: ['', [Validators.required]],
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

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.button = 'Submit';
    this.examMasterModel = new entranceExamMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '600px',
      height: '500px',
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
          height: '500px',
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
          entranceExamName: data.entranceExamName,   // Set the exam name
          standardIds: data.standardMasters.map((std: any) => std.standardId), // Extract standardIds from standardMasters
          status: data.status // Set the status (Active/In-Active)
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

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}

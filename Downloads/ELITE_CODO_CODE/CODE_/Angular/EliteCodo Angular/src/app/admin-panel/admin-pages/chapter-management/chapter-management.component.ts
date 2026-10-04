import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { chapterMaster } from 'src/app/shared/adminModel';
import { companyMaster, teacherMaster } from 'src/app/shared/AllModel';
import { create_chapter, fileUpload, getAll_chapter, update_chapter, getById_chapter, getActive_exam, getAllActive_standard, getActive_subject } from 'src/app/shared/allURL';
@Component({
  selector: 'app-chapter-management',
  templateUrl: './chapter-management.component.html',
  styleUrls: ['./chapter-management.component.css', '../../../../assets/css/form.css']
})
export class ChapterManagementComponent implements OnInit {
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
  examMasterModel = new chapterMaster();
  AttendanceShift: any


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'chapterName', 'subjectName', 'entranceExamName', 'standardName', 'status', 'edit'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  activeExam: any;
  activestandard: any;
  activesubject: any;

  ngOnInit(): void {
    this.examForm();
    this.getchapterData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      chapterName: ['', [Validators.required]],
      status: ['', [Validators.required]],
      subjectId: ['', [Validators.required]], 
      standardId: ['', [Validators.required]],
      entranceExamId: ['', [Validators.required]],
    });
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing',
      console.log('examMasterModel', this.examMasterModel);
    this.http.postRequest(create_chapter, this.examMasterModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getchapterData();
        this.notificationService.showSuccess("chapter Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("chapter Creation Failed", "Failed");
      })
  }

  getchapterData() {
    this.http.getRequest(getAll_chapter).subscribe(
      (res: any) => {
        console.log({ res });
        this.getexamActiveData()
        this.getStandardActiveData()
        this.getSubjectActiveData()
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator
      })
  }
  getexamActiveData() {
    this.http.getRequest(getActive_exam).subscribe(
      (res: any) => {
        console.log({ getexamActiveData: res });
        this.activeExam = res
      })
  }

  getStandardActiveData() {
    this.http.getRequest(getAllActive_standard).subscribe(
      (res: any) => {
        console.log({ getStandardActiveData: res });
        this.activestandard = res
      })
  }
  getSubjectActiveData() {
    this.http.getRequest(getActive_subject).subscribe(
      (res: any) => {
        console.log({ getStandardActiveData: res });
        this.activesubject = res
      })
  }
  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing',
      console.log('examMasterModel', this.examMasterModel);
    this.http.putRequest(update_chapter, this.examMasterModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getchapterData();
        this.notificationService.showSuccess("chapter Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("chapter Updation Failed", "Failed");
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
    this.examMasterModel = new chapterMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '600px',
      height: '650px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_chapter + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '600px',
          height: '650px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        this.examMasterModel = data;
        this.examMasterModel.subjectId = data.subjectMaster.subjectId;
        this.examMasterModel.standardId = data.standardMaster.standardId;
        this.examMasterModel.entranceExamId = data.entranceExamMaster.entranceExamId;
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

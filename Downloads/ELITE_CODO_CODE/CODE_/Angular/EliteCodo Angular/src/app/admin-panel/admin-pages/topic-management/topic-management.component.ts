import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { topicMaster } from 'src/app/shared/adminModel';
import { create_topic, fileUpload, getAll_topic, update_topic, getById_topic, getActive_exam, getAllActive_standard, getActive_subject, getAllActive_chapter } from 'src/app/shared/allURL';
@Component({
  selector: 'app-topic-management',
  templateUrl: './topic-management.component.html',
  styleUrls: ['./topic-management.component.css', '../../../../assets/css/form.css']
})
export class TopicManagementComponent implements OnInit {
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
  topicMasterModel = new topicMaster();
  AttendanceShift: any


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  // displayedColumns: string[] = ["id", 'firstName', 'lastName', 'email', 'phone', 'status', 'edit'];
  displayedColumns: string[] = ["id", 'date', 'topicName', 'chapterName', 'subjectName', 'entranceExamName', 'standardName', 'status', 'edit'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  activeExam: any;
  activestandard: any;
  activesubject: any;
  activeChapter: any;

  ngOnInit(): void {
    this.examForm();
    this.gettopicData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      topicName: ['', [Validators.required]],
      status: ['', [Validators.required]],
      entranceExamId: ['', [Validators.required]],
      standardId: ['', [Validators.required]],
      subjectId: ['', [Validators.required]],
      chapterId: ['', [Validators.required]],
    });
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing',
      console.log('topicMasterModel', this.topicMasterModel);
    this.http.postRequest(create_topic, this.topicMasterModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.gettopicData();
        this.notificationService.showSuccess("Exam Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Exam Creation Failed", "Failed");
      })
  }

  gettopicData() {
    this.http.getRequest(getAll_topic).subscribe(
      (res: any) => {
        console.log({ res });
        this.getexamActiveData()
        this.getStandardActiveData()
        this.getSubjectActiveData()
        this.getCHapterActiveData()
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
  getCHapterActiveData() {
    this.http.getRequest(getAllActive_chapter).subscribe(
      (res: any) => {
        console.log({ getCHapterActiveData: res });
        this.activeChapter = res
      })
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing',
      console.log('topicMasterModel', this.topicMasterModel);
    this.http.putRequest(update_topic, this.topicMasterModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.gettopicData();
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
    this.topicMasterModel = new topicMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '900px',
      height: '500px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_topic + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '900px',
          height: '500px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        this.topicMasterModel = data;
        this.topicMasterModel.subjectId = data.subjectMaster.subjectId;
        this.topicMasterModel.standardId = data.standardMaster.standardId;
        this.topicMasterModel.entranceExamId = data.entranceExamMaster.entranceExamId;
        this.topicMasterModel.chapterId = data.chapterMaster.chapterId;
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

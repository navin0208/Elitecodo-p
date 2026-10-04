import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { subTopicMaster } from 'src/app/shared/adminModel';
import { create_subtopic, fileUpload, getAll_subtopic, update_subtopic, getById_subtopic, getActive_exam, getAllActive_standard, getActive_subject, getAllActive_chapter, getAllActive_topic, entranceexamwisestandard, standardwisesubject, subjectwisechapter, chapterwisetopics } from 'src/app/shared/allURL';
@Component({
  selector: 'app-sub-topic-management',
  templateUrl: './sub-topic-management.component.html',
  styleUrls: ['./sub-topic-management.component.css', '../../../../assets/css/form.css']
})
export class SubTopicManagementComponent implements OnInit {
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
  subTopicMasterModel = new subTopicMaster();
  AttendanceShift: any


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'subTopicName', 'topicName', 'chapterName', 'subjectName', 'entranceExamName', 'standardName', 'status', 'edit'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  activeExam: any;
  activestandard: any;
  activesubject: any;
  activeChapter: any;
  activeTopic: any;


  filteredStandards: any;
  filteredSubjects: any;
  filteredChapters: any;
  filteredTopics: any;

  ngOnInit(): void {
    this.examForm();
    this.getexamData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({

      subTopicId: [''],
      subTopicName: ['', [Validators.required]],
      entranceExamId: ['', [Validators.required]],
      standardId: ['', [Validators.required]],
      subjectId: ['', [Validators.required]],
      chapterId: ['', [Validators.required]],
      topicId: ['', [Validators.required]],
      date: [''],
      status: ['', [Validators.required]],
    });

    this.getexamActiveData();
  }



  submit() {
    this.isLoading = true;
    this.button = 'Processing',
      console.log('subTopicMasterModel', this.subTopicMasterModel);
    this.http.postRequest(create_subtopic, this.subTopicMasterModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Exam Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Exam Creation Failed", "Failed");
      })
  }

  getexamData() {
    this.http.getRequest(getAll_subtopic).subscribe(
      (res: any) => {
        this.getexamActiveData()
        this.getStandardActiveData()
        this.getSubjectActiveData()
        this.getCHapterActiveData()
        this.getTopicActiveData()
        console.log({ res });
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
        console.log({ getSubjectActiveData: res });
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
  getTopicActiveData() {
    this.http.getRequest(getAllActive_topic).subscribe(
      (res: any) => {
        console.log({ getTopicActiveData: res });
        this.activeTopic = res
      })
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing',
      console.log('subTopicMasterModel', this.subTopicMasterModel);
    this.http.putRequest(update_subtopic, this.subTopicMasterModel).subscribe(
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

    // Reset the filtered arrays for dropdowns
    this.filteredStandards = [];
    this.filteredSubjects = [];
    this.filteredChapters = [];
    this.filteredTopics = [];

    // If you have any other state that needs to be reset, do it here
    this.activeExam = null;
    this.activestandard = null;
    this.activesubject = null;
    this.activeChapter = null;
    this.activeTopic = null;

    this.isSubmit = true;
    this.isUpdate = false;
  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.button = 'Submit';
    this.subTopicMasterModel = new subTopicMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '900px',
      height: '570px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_subtopic + id).subscribe(
      (res: any) => {
        console.log({ res });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '900px',
          height: '570px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        // Set the subTopicMasterModel fields
        // Set the form values explicitly from the nested structure
        this.subTopicMasterModel.subTopicId = res.subTopicId,
        this.subTopicMasterModel.subTopicName = res.subTopicName,
        this.subTopicMasterModel.entranceExamId = res.entranceExamMaster?.entranceExamId,
        this.subTopicMasterModel.standardId = res.standardMaster?.standardId,
        this.subTopicMasterModel.subjectId = res.subjectMaster?.subjectId,
        this.subTopicMasterModel.chapterId = res.chapterMaster?.chapterId,
        this.subTopicMasterModel.topicId = res.topicMaster?.topicId,
        this.subTopicMasterModel.date = res.date,
        this.subTopicMasterModel.status = res.status
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

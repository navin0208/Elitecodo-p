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
import { subTopicMaster } from 'src/app/shared/adminModel';
import { TYPE } from 'src/app/shared/AllModel';
import { create_subtopic, fileUpload, getAll_subtopic, update_subtopic, getById_subtopic, getActive_exam, getAllActive_standard, getActive_subject, getAllActive_chapter, getAllActive_topic, entranceexamwisestandard, standardwisesubject, subjectwisechapter, chapterwisetopics, delete_Sub_Topic } from 'src/app/shared/allURL';
import swal from 'sweetalert2';

@Component({
  selector: 'app-sub-topic-management',
  templateUrl: './sub-topic-management.component.html',
  styleUrls: ['./sub-topic-management.component.css', '../../../../assets/css/form.css']
})
export class SubTopicManagementComponent implements OnInit {
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
  editForm!: FormGroup;
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
      subTopicName: ['', [Validators.required]],
      entranceExamId: ['', [Validators.required]],
      standardId: ['', [Validators.required]],
      subjectId: ['', [Validators.required]],
      chapterId: ['', [Validators.required]],
      topicId: ['', [Validators.required]],
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
        this.notificationService.showSuccess("Sub-Topic Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Sub-Topic Creation Failed", "Failed");
      })
  }

  getexamData() {
    this.http.getRequest(getAll_subtopic).subscribe(
      (res: any) => {
        this.getexamActiveData();
        this.getStandardActiveData();
        this.getSubjectActiveData();
        this.getCHapterActiveData();
        this.getTopicActiveData();

        let data = res.reverse();
        console.log({ res });
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
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
        this.notificationService.showSuccess("Sub-Topic Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Sub-Topic Updation Failed", "Failed");
      })
  }
  closeSubmitDialog() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.resetFilteredArrays();
  }
  close() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;

    // Reset the filtered arrays for dropdowns
    // this.filteredStandards = [];
    // this.filteredSubjects = [];
    // this.filteredChapters = [];
    // this.filteredTopics = [];

    // If you have any other state that needs to be reset, do it here
    // this.activeExam = [];
    // this.activestandard = [];
    // this.activesubject = [];
    // this.activeChapter = [];
    // this.activeTopic = [];

  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    console.log({ templateRef });

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

  openSubmitDialog(templateRef: TemplateRef<any>) {
    console.log({ templateRef });

    this.regiStrationForm.reset();
    this.dialogRef = this.dialog.open(templateRef, {
      width: '900px',
      height: '570px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  submitNewSubTopic() {
    if (this.regiStrationForm.valid) {
      this.isLoading = true;
      const newSubTopic = this.regiStrationForm.value;
      console.log({ newSubTopic });

      this.http.postRequest(create_subtopic, newSubTopic).subscribe(
        (res) => {
          console.log({ res });
          this.closeSubmitDialog();
          this.isLoading = false;
          this.getexamData();
          this.notificationService.showSuccess("Sub-Topic Creation Success", "Success");
        },
        (err) => {
          console.log({ err });
          this.isLoading = false;
          this.notificationService.showError("Sub-Topic Creation Failed", "Failed");
        }
      );
    }
  }
  onEntranceExamChange(entranceExamId: string) {
    this.http.getRequest(entranceexamwisestandard + entranceExamId).subscribe(
      (res: any) => {
        this.filteredStandards = res.standardMasters;
        this.regiStrationForm.patchValue({ standardId: '', subjectId: '', chapterId: '', topicId: '' });
      }
    );
  }

  onStandardChange(standardId: string) {
    this.http.getRequest(standardwisesubject + standardId).subscribe(
      (res: any) => {
        this.filteredSubjects = res.subjectMasters;
        this.regiStrationForm.patchValue({ subjectId: '', chapterId: '', topicId: '' });
      }
    );
  }

  onSubjectChange(subjectId: string) {
    const standardId = this.regiStrationForm.get('standardId')?.value;
    // Use an endpoint that takes both standardId and subjectId if available
    this.http.getRequest(`${subjectwisechapter}all/${subjectId}/${standardId}`).subscribe(
      (res: any) => {
        this.filteredChapters = res;
        this.regiStrationForm.patchValue({
          chapterId: '',
          topicId: ''
        });
      }
    );
  }

  onChapterChange(chapterId: string) {
    this.http.getRequest(chapterwisetopics + chapterId).subscribe(
      (res: any) => {
        this.filteredTopics = res;
        this.regiStrationForm.patchValue({ topicId: '' });
      }
    );
  }

  resetFilteredArrays() {
    this.filteredStandards = [];
    this.filteredSubjects = [];
    this.filteredChapters = [];
    this.filteredTopics = [];
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

  deleteSubTopic(subTopicId: any) {
    console.log({ subTopicId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Sub-Topic.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ subTopicId });
    //     this.http.deleteRequest(delete_Sub_Topic, subTopicId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Sub-Topic has been deleted."`,
    //           icon: "success"
    //         });
    //         this.getexamData();
    //       }, (err: any) => {
    //         swal.fire({
    //           text: "Something went wrong !!!",
    //           icon: "warning"
    //         })
    //       })
    //   }
    // });


    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Sub-Topic?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_Sub_Topic, subTopicId).subscribe((res) => {
          this.getexamData();
          this.message.success('Sub-Topic deleted successfully');
        }, err => {
          this.message.error('Sub-Topic deleted failed');
        })
      },
      nzCancelText: 'No'
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // Check main level properties
      const mainLevelMatch =
        (data.subTopicName?.toLowerCase().includes(filter)) ||
        (data.date?.toLowerCase().includes(filter)) ||
        (data.status?.toLowerCase().includes(filter));

      // Check nested entrance exam properties
      const entranceExamMatch =
        (data.entranceExamMaster?.entranceExamName?.toLowerCase().includes(filter)) ||
        (data.entranceExamMaster?.entranceExamId?.toString().includes(filter));

      // Check nested standard properties
      const standardMatch =
        (data.standardMaster?.standardName?.toLowerCase().includes(filter)) ||
        (data.standardMaster?.standardId?.toString().includes(filter));

      // Check nested subject properties
      const subjectMatch =
        (data.subjectMaster?.subjectName?.toLowerCase().includes(filter)) ||
        (data.subjectMaster?.subjectId?.toString().includes(filter));

      // Check nested chapter properties
      const chapterMatch =
        (data.chapterMaster?.chapterName?.toLowerCase().includes(filter)) ||
        (data.chapterMaster?.chapterId?.toString().includes(filter));

      // Check nested topic properties
      const topicMatch =
        (data.topicMaster?.topicName?.toLowerCase().includes(filter)) ||
        (data.topicMaster?.topicId?.toString().includes(filter));

      return mainLevelMatch || entranceExamMatch || standardMatch ||
        subjectMatch || chapterMatch || topicMatch;
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

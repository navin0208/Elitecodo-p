import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { TYPE } from 'src/app/shared/AllModel';
import { topicMaster } from 'src/app/shared/adminModel';
import { create_topic, fileUpload, getAll_topic, update_topic, getById_topic, getActive_exam, getAllActive_standard, getActive_subject, getAllActive_chapter, create_subtopic, entranceexamwisestandard, standardwisesubject, subjectwisechapter, chapterwisetopics, delete_Topic } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-topic-management',
  templateUrl: './topic-management.component.html',
  styleUrls: ['./topic-management.component.css', '../../../../assets/css/form.css']
})
export class TopicManagementComponent implements OnInit {
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
  topicMasterModel = new topicMaster();
  AttendanceShift: any


  filteredStandards: any;
  filteredSubjects: any;
  filteredChapters: any;
  filteredTopics: any;
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
        this.notificationService.showSuccess("Topic Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Topic Creation Failed", "Failed");
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
        this.dataSource = new MatTableDataSource(res.reverse());
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
        this.notificationService.showSuccess("Topic Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Topic Updation Failed", "Failed");
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

  closeSubmitDialog() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.resetFilteredArrays();
  }

  openSubmitDialog(templateRef: TemplateRef<any>) {
    console.log({ templateRef });

    this.regiStrationForm.reset();
    this.dialogRef = this.dialog.open(templateRef, {
      width: '900px',
      height: '500px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  submitNewTopic() {
    if (this.regiStrationForm.valid) {
      this.isLoading = true;
      const newSubTopic = this.regiStrationForm.value;
      console.log({ newSubTopic });

      this.http.postRequest(create_topic, newSubTopic).subscribe(
        (res) => {
          console.log({ res });
          this.closeSubmitDialog();
          this.isLoading = false;
          this.gettopicData();
          this.notificationService.showSuccess("Topic Creation Success", "Success");
        },
        (err) => {
          console.log({ err });
          this.isLoading = false;
          this.notificationService.showError("Topic Creation Failed", "Failed");
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
    this.http.getRequest(`${subjectwisechapter}all/${subjectId}/${standardId}`).subscribe(
      (res: any) => {
        this.filteredChapters = res;
        this.regiStrationForm.patchValue({ chapterId: '', topicId: '' });
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

  // Update the edit function to properly handle the dependencies
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

        // First set the entrance exam and get standards
        this.topicMasterModel = data;
        this.topicMasterModel.entranceExamId = data.entranceExamMaster.entranceExamId;
        this.regiStrationForm.patchValue({
          entranceExamId: data.entranceExamMaster.entranceExamId
        });

        // Get standards for this exam
        this.onEntranceExamChange(data.entranceExamMaster.entranceExamId);

        // After a small delay (to allow standards to load), set standard and get subjects
        setTimeout(() => {
          this.topicMasterModel.standardId = data.standardMaster.standardId;
          this.regiStrationForm.patchValue({
            standardId: data.standardMaster.standardId
          });
          this.onStandardChange(data.standardMaster.standardId);

          // After another delay, set subject and get chapters
          setTimeout(() => {
            this.topicMasterModel.subjectId = data.subjectMaster.subjectId;
            this.regiStrationForm.patchValue({
              subjectId: data.subjectMaster.subjectId
            });
            this.onSubjectChange(data.subjectMaster.subjectId);

            // Finally, set chapter and topics
            setTimeout(() => {
              this.topicMasterModel.chapterId = data.chapterMaster.chapterId;
              this.regiStrationForm.patchValue({
                chapterId: data.chapterMaster.chapterId
              });
              this.onChapterChange(data.chapterMaster.chapterId);
            }, 500);
          }, 500);
        }, 500);
      });
  }

  deleteTopic(topicId: any) {
    console.log({ topicId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Topic.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ topicId });
    //     this.http.deleteRequest(delete_Topic, topicId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Topic has been deleted."`,
    //           icon: "success"
    //         });
    //         this.gettopicData();
    //       }, (err: any) => {
    //         swal.fire({
    //           text: "Something went wrong !!!",
    //           icon: "warning"
    //         })
    //       })
    //   }
    // });

    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Topic?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_Topic, topicId).subscribe((res) => {
          this.gettopicData();
          this.message.success('Topic deleted successfully');
        }, err => {
          this.message.error('Topic deleted failed');
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
        (data.topicName?.toLowerCase().includes(filter)) ||
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


      return mainLevelMatch || entranceExamMatch || standardMatch ||
        subjectMatch || chapterMatch;
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

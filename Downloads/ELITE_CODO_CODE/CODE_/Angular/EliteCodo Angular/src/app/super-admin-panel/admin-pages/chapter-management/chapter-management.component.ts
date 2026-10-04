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
import { chapterMaster } from 'src/app/shared/adminModel';
import { companyMaster, teacherMaster, TYPE } from 'src/app/shared/AllModel';
import { create_chapter, fileUpload, getAll_chapter, update_chapter, getById_chapter, getActive_exam, getAllActive_standard, getActive_subject, entranceexamwisestandard, standardwisesubject, subjectwisechapter, delete_Chapter } from 'src/app/shared/allURL';
import swal from 'sweetalert2';


@Component({
  selector: 'app-chapter-management',
  templateUrl: './chapter-management.component.html',
  styleUrls: ['./chapter-management.component.css', '../../../../assets/css/form.css']
})
export class ChapterManagementComponent implements OnInit {
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
  examMasterModel = new chapterMaster();
  AttendanceShift: any

  filteredStandards: any;
  filteredSubjects: any;
  filteredChapters: any;
  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'chapterName', 'subjectName', 'entranceExamName', 'standardName', 'status', 'edit'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  activeExam: any;
  activestandard: any;
  activesubject: any;
  activeChapters: any;
  isEditMode: boolean = false;
  ngOnInit(): void {
    this.initForm();
    this.getexamActiveData();
    this.getchapterData();
  }

  initForm() {
    this.regiStrationForm = this.fb.group({
      entranceExamId: ['', [Validators.required]],
      standardId: ['', [Validators.required]],
      subjectId: ['', [Validators.required]],
      chapterName: ['', [Validators.required]],
      status: ['', [Validators.required]]
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
        this.notificationService.showSuccess("Chapter Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Chapter Creation Failed", "Failed");
      })
  }

  getchapterData() {
    this.http.getRequest(getAll_chapter).subscribe(
      (res: any) => {
        console.log({ res });
        this.getexamActiveData();
        this.getStandardActiveData();
        this.getSubjectActiveData();
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
        this.notificationService.showSuccess("Chapter Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Chapter Updation Failed", "Failed");
      })
  }

  close() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
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
      width: '700px',
      height: '500px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  submitNewChapter() {
    if (this.regiStrationForm.valid) {
      this.isLoading = true;
      const newChapter = this.regiStrationForm.value;
      console.log({ newChapter });

      this.http.postRequest(create_chapter, newChapter).subscribe(
        (res) => {
          console.log({ res });
          this.closeSubmitDialog();
          this.isLoading = false;
          this.getchapterData();
          this.notificationService.showSuccess("Chapter Creation Success", "Success");
        },
        (err) => {
          console.log({ err });
          this.isLoading = false;
          this.notificationService.showError("Chapter Creation Failed", "Failed");
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
    this.http.getRequest(subjectwisechapter + subjectId).subscribe(
      (res: any) => {
        this.filteredChapters = res;
        this.regiStrationForm.patchValue({ chapterId: '', topicId: '' });
      }
    );
  }
  resetFilteredArrays() {
    this.filteredStandards = [];
    this.filteredSubjects = [];
    this.filteredChapters = [];
  }


  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.button = 'Submit';
    this.examMasterModel = new chapterMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '700px',
      height: '500px',
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
          width: '700px',
          height: '500px',
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

  deleteChapter(chapterId: any) {
    console.log({ chapterId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Chapter.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ chapterId });
    //     this.http.deleteRequest(delete_Chapter, chapterId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Chapter has been deleted."`,
    //           icon: "success"
    //         });

    //         this.getchapterData()
    //       }, (err: any) => {
    //         swal.fire({
    //           text: "Something went wrong !!!",
    //           icon: "warning"
    //         })
    //       })
    //   }
    // });




    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Chapter?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_Chapter, chapterId).subscribe((res) => {
          this.getchapterData();
          this.message.success('Chapter deleted successfully');
        }, err => {
          this.message.error('Chapter deleted failed');
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
        (data.chapterName?.toLowerCase().includes(filter) ||
          data.status?.toLowerCase().includes(filter) ||
          data.date?.toLowerCase().includes(filter));

      // Check nested subject properties
      const subjectMatch =
        (data.subjectMaster?.subjectName?.toLowerCase().includes(filter) ||
          data.subjectMaster?.subjectId?.toString().includes(filter));

      // Check nested standard properties
      const standardMatch =
        (data.standardMaster?.standardName?.toLowerCase().includes(filter) ||
          data.standardMaster?.standardId?.toString().includes(filter));
      console.log({ standardMatch });

      // Check nested entrance exam properties
      const examMatch =
        (data.entranceExamMaster?.entranceExamName?.toLowerCase().includes(filter) ||
          data.entranceExamMaster?.entranceExamId?.toString().includes(filter));

      return mainLevelMatch || subjectMatch || standardMatch || examMatch;
    };

    this.dataSource.filter = filterValue;
    console.log({ data: this.dataSource });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }


}

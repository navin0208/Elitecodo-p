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
import { subjectMaster } from 'src/app/shared/adminModel';
import { TYPE } from 'src/app/shared/AllModel';
import { create_subject, fileUpload, getAll_subject, update_subject, getById_subject, getAllActive_standard, getActive_exam, entranceexamwisestandard, standardwisesubject, delete_subject } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
@Component({
  selector: 'app-subject-management',
  templateUrl: './subject-management.component.html',
  styleUrls: ['./subject-management.component.css', '../../../../assets/css/form.css']
})
export class SubjectManagementComponent implements OnInit {
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
  subjectMasterModel = new subjectMaster();
  AttendanceShift: any

  filteredStandards: any;
  filteredSubjects: any;
  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'subjectName', 'entranceExamName', 'standardName', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // activestandard: any;
  activeExam: any;
  activestandard: any;

  ngOnInit(): void {
    this.examForm();
    this.getexamData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      entranceExamId: ['', [Validators.required]],
      standardIds: ['', [Validators.required]],
      subjectId: ['',],
      subjectName: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing',
      console.log('subjectMasterModel', this.subjectMasterModel);
    this.http.postRequest(create_subject, this.regiStrationForm.value).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Subject Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Subject Creation Failed", "Failed");
      })
  }

  getexamData() {
    this.http.getRequest(getAll_subject).subscribe(
      (res: any) => {
        console.log({ res });
        this.getexamActiveData();
        this.getStandardActiveData();
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

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing',
      console.log('subjectMasterModel', this.subjectMasterModel);
    this.http.putRequest(update_subject, this.regiStrationForm.value).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Subject Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Subject Updation Failed", "Failed");
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
      width: '900px',
      height: '450px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  deleteSubjectId(subjectId: any) {
    console.log({ subjectId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Subject.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ subjectId });
    //     this.http.deleteRequest(delete_subject, subjectId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Subject has been deleted."`,
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
      nzTitle: 'Are you sure you want to delete this Subject?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_subject, subjectId).subscribe((res) => {
          this.getexamData();
          this.message.success('Subject deleted successfully');
        }, err => {
          this.message.error('Subject deleted failed');
        })
      },
      nzCancelText: 'No'
    });
  }

  submitNewChapter() {
    if (this.regiStrationForm.valid) {
      this.isLoading = true;
      const newChapter = this.regiStrationForm.value;
      console.log({ newChapter });

      this.http.postRequest(create_subject, newChapter).subscribe(
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
        console.log('filteredStandards', this.filteredStandards);

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

  resetFilteredArrays() {
    this.filteredStandards = [];
    this.filteredSubjects = [];
  }



  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.button = 'Submit';
    this.subjectMasterModel = new subjectMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '900px',
      height: '450px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_subject + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '900px',
          height: '450px',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        this.regiStrationForm.patchValue({
          entranceExamId: data.entranceExamMaster.entranceExamId,           // Set the entrance exam ID
          subjectId: data.subjectId,                     // Set the subject ID
          subjectName: data.subjectName,                 // Set the subject name
          standardIds: data.standardMaster.map((std: any) => std.standardId), // Extract standard IDs from standardMasters
          status: data.status                            // Set the status (Active/In-Active)
        });

      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // Set custom filter predicate
    this.dataSource.filterPredicate = (subject: any, filter: string) => {
      // Check top-level subject properties
      const subjectPropsMatch =
        (subject.subjectName?.toLowerCase().includes(filter)) ||
        (subject.status?.toLowerCase().includes(filter)) ||
        (subject.date?.toLowerCase().includes(filter)) ||
        (subject.subjectId?.toString().includes(filter));

      // Check nested standardMaster properties
      const standardMatch = subject.standardMaster?.some((standard: any) =>
        standard.standardName?.toLowerCase().includes(filter) ||
        standard.standardId?.toString().includes(filter) ||
        standard.date?.toLowerCase().includes(filter) ||
        standard.status?.toLowerCase().includes(filter)
      );

      // Check nested entranceExamMaster properties
      const examMatch =
        (subject.entranceExamMaster?.entranceExamName?.toLowerCase().includes(filter)) ||
        (subject.entranceExamMaster?.entranceExamId?.toString().includes(filter)) ||
        (subject.entranceExamMaster?.date?.toLowerCase().includes(filter)) ||
        (subject.entranceExamMaster?.status?.toLowerCase().includes(filter));

      // Check nested standardMasters within entranceExamMaster
      const examStandardsMatch = subject.entranceExamMaster?.standardMasters?.some((standard: any) =>
        standard.standardName?.toLowerCase().includes(filter) ||
        standard.standardId?.toString().includes(filter) ||
        standard.date?.toLowerCase().includes(filter) ||
        standard.status?.toLowerCase().includes(filter)
      );

      return subjectPropsMatch || standardMatch || examMatch || examStandardsMatch;
    };

    this.dataSource.filter = filterValue;
    console.log({ subject: this.dataSource })
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }


}

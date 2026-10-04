import {
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { chapterWiseweightageMaster, TYPE } from 'src/app/shared/AllModel';
import {
  chapterwisetopics,
  create_weightage,
  entranceexamwisestandard,
  entranceexamwisesubject,
  getActive_exam,
  getActive_subject,
  getAll_weightage,
  getAllActive_chapter,
  getAllActive_standard,
  getById_weightage,
  standardwisesubject,
  subjectwisechapter,
  update_weightage,
} from 'src/app/shared/allURL';

@Component({
  selector: 'app-chapter-wise-weightage',
  templateUrl: './chapter-wise-weightage.component.html',
  styleUrls: [
    './chapter-wise-weightage.component.css',
    '../../../../assets/css/form.css',
  ],
})
export class ChapterWiseWeightageComponent implements OnInit {
  typeIcon = TYPE.SUCCESS;
  http = inject(HttpmethodsService);
  fb = inject(FormBuilder);
  notificationService = inject(NotificationService);
  dialog = inject(MatDialog);
  ActivateRoute = inject(ActivatedRoute);
  router = inject(Router);
  modal = inject(NzModalService);
  message = inject(NzMessageService);
  disabled: any;
  AddressData: any;
  filetoUpload: any;
  isSubmit: boolean = true;
  isUpdate: boolean = false;
  isLoading = false;
  dialogRef: any;
  button = 'Submit';
  row: any;
  regiStrationForm!: FormGroup;
  date: any;
  chapterWiseweightageMasterModel = new chapterWiseweightageMaster();
  AttendanceShift: any;

  filteredStandards: any;
  filteredSubjects: any = [];
  filteredChapters: any = [];
  filteredTopics: any;
  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = [
    'id',
    'date',
    'chapterName',
    'subjectName',
    'entranceExamName',
    'weightage',
    'status',
    'edit',
  ];

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
      chapterWeightageId: [''],
      entranceExamId: ['', [Validators.required]],
      subjectId: ['', [Validators.required]],
      chapterId: ['', [Validators.required]],
      weightage: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing';
    console.log(
      'chapterWiseweightageMasterModel',
      this.chapterWiseweightageMasterModel
    );
    this.http
      .postRequest(create_weightage, this.chapterWiseweightageMasterModel)
      .subscribe(
        (res) => {
          console.log({ res });
          this.button = 'Submit';
          this.regiStrationForm.reset();
          this.close();
          this.isLoading = false;
          this.gettopicData();
          this.notificationService.showSuccess(
            'Chapter-Wise-weightage Creation Success',
            'Success'
          );
        },
        (err) => {
          console.log({ err });
          this.button = 'Submit';
          this.isLoading = false;
          this.notificationService.showError(
            'Chapter-Wise-weightage Creation Failed',
            'Failed'
          );
        }
      );
  }

  gettopicData() {
    this.http.getRequest(getAll_weightage).subscribe((res: any) => {
      console.log({ gettopicData: res });
      this.getexamActiveData();
      this.getStandardActiveData();
      this.getSubjectActiveData();
      this.getCHapterActiveData();
      this.dataSource = new MatTableDataSource(res.reverse());
      this.dataSource.paginator = this.paginator;
    });
  }

  getexamActiveData() {
    this.http.getRequest(getActive_exam).subscribe((res: any) => {
      console.log({ getexamActiveData: res });
      this.activeExam = res;
    });
  }

  getStandardActiveData() {
    this.http.getRequest(getAllActive_standard).subscribe((res: any) => {
      console.log({ getStandardActiveData: res });
      this.activestandard = res;
    });
  }

  getSubjectActiveData() {
    this.http.getRequest(getActive_subject).subscribe((res: any) => {
      console.log({ getSubjectActiveData: res });
      this.activesubject = res;
    });
  }

  getSubjectLabel(item: any): string {
    const standardName = item.standardResponses[0]?.name || '';
    return `${item.subjectName} (${standardName})`;
  }

  getCHapterActiveData() {
    this.http.getRequest(getAllActive_chapter).subscribe((res: any) => {
      console.log({ getCHapterActiveData: res });
      this.activeChapter = res;
    });
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing';
    console.log(
      'chapterWiseweightageMasterModel',
      this.chapterWiseweightageMasterModel
    );

    this.http
      .putRequest(update_weightage, this.regiStrationForm.value)
      .subscribe(
        (res) => {
          console.log({ res });
          this.button = 'Update';
          this.regiStrationForm.reset();
          this.close();
          this.isLoading = false;
          this.gettopicData();
          this.notificationService.showSuccess(
            'Chapter-Wise-weightage Updation Success',
            'Success'
          );
        },
        (err) => {
          console.log({ err });
          this.button = 'Update';
          this.isLoading = false;
          this.notificationService.showError(
            'Chapter-Wise-weightage Updation Failed',
            'Failed'
          );
        }
      );
  }

  close() {
    this.dialogRef.close();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.resetFilteredArrays();
  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.button = 'Submit';
    this.chapterWiseweightageMasterModel = new chapterWiseweightageMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '900px',
      height: '500px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: [
        'animate__animated',
        'animate__slideInLeft',
        'custom-animation',
      ],
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
    this.resetFilteredArrays();
    this.dialogRef = this.dialog.open(templateRef, {
      width: '700px',
      height: '500px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: [
        'animate__animated',
        'animate__slideInLeft',
        'custom-animation',
      ],
    });
  }

  submitNewTopic() {
    this.isLoading = true;
    this.button = 'Processing';
    const newSubTopic = this.regiStrationForm.value;
    console.log({ newSubTopic });

    this.http.postRequest(create_weightage, newSubTopic).subscribe(
      (res) => {
        console.log({ res });
        this.closeSubmitDialog();
        this.isLoading = false;
        this.gettopicData();
        this.notificationService.showSuccess(
          'Weightage added successfully',
          'Success'
        );
      },
      (err) => {
        console.log({ err });
        this.isLoading = false;
        this.notificationService.showError('Weightage added Failed', 'Failed');
      }
    );
  }

  onEntranceExamChange(entranceExamId: string) {
    console.log({ entranceExamId });

    if (entranceExamId) {
      this.http.getRequest(entranceexamwisesubject + entranceExamId).subscribe(
        (res: any) => {
          this.filteredSubjects = res || [];
          console.log('filteredSubjects', this.filteredSubjects);

          // Reset dependent fields
          this.regiStrationForm.patchValue({
            subjectId: '',
            chapterId: '',
          });

          // Also fetch chapters for the first subject if exists (optional)
          if (
            this.filteredSubjects.length > 0 &&
            this.regiStrationForm.get('subjectId')?.value
          ) {
            this.onSubjectChange(this.regiStrationForm.get('subjectId')?.value);
          } else {
            this.filteredChapters = [];
          }
        },
        (error) => {
          console.error('Error fetching subjects:', error);
          this.filteredSubjects = [];
          this.filteredChapters = [];
        }
      );
    } else {
      this.filteredSubjects = [];
      this.filteredChapters = [];
    }
  }

  getStandardsString(item: any): string {
    if (!item.standardResponses || item.standardResponses.length === 0) {
      return '';
    }
    return item.standardResponses
      .map((std: { name: any }) => std.name)
      .join(', ');
  }

  onSubjectChange(subjectId: string) {
    if (subjectId) {
      this.http.getRequest(subjectwisechapter + subjectId).subscribe(
        (res: any) => {
          this.filteredChapters = res || [];
          this.regiStrationForm.patchValue({ chapterId: '' });
        },
        (error) => {
          console.error('Error fetching chapters:', error);
          this.filteredChapters = [];
        }
      );
    } else {
      this.filteredChapters = [];
    }
  }

  resetFilteredArrays() {
    this.filteredSubjects = [];
    this.filteredChapters = [];
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });

    this.http.getRequest(getById_weightage + id).subscribe(
      (data: any) => {
        console.log({ edit: data });

        // First, get subjects based on the entrance exam
        const entranceExamId = data.entranceExamMaster?.entranceExamId;

        if (entranceExamId) {
          this.http
            .getRequest(entranceexamwisesubject + entranceExamId)
            .subscribe(
              (subjects: any) => {
                this.filteredSubjects = subjects || [];

                // Now get chapters based on the subject
                const subjectId = data.subjectMaster?.subjectId;
                if (subjectId) {
                  this.http
                    .getRequest(subjectwisechapter + subjectId)
                    .subscribe(
                      (chapters: any) => {
                        this.filteredChapters = chapters || [];

                        // Open dialog after all data is loaded
                        this.openEditDialog(
                          templateRef,
                          data,
                          entranceExamId,
                          subjectId
                        );
                      },
                      (chapterError) => {
                        console.error('Error fetching chapters:', chapterError);
                        this.filteredChapters = [];
                        this.openEditDialog(
                          templateRef,
                          data,
                          entranceExamId,
                          subjectId
                        );
                      }
                    );
                } else {
                  this.filteredChapters = [];
                  this.openEditDialog(
                    templateRef,
                    data,
                    entranceExamId,
                    subjectId
                  );
                }
              },
              (subjectError) => {
                console.error('Error fetching subjects:', subjectError);
                this.filteredSubjects = [];
                this.filteredChapters = [];
                this.openEditDialog(
                  templateRef,
                  data,
                  entranceExamId,
                  data.subjectMaster?.subjectId
                );
              }
            );
        } else {
          this.filteredSubjects = [];
          this.filteredChapters = [];
          this.openEditDialog(
            templateRef,
            data,
            null,
            data.subjectMaster?.subjectId
          );
        }
      },
      (error) => {
        console.error('Error fetching weightage data:', error);
        this.notificationService.showError(
          'Failed to load weightage data',
          'Error'
        );
      }
    );
  }

  openEditDialog(
    templateRef: TemplateRef<any>,
    data: any,
    entranceExamId: any,
    subjectId: any
  ) {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '700px',
      height: '500px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: [
        'animate__animated',
        'animate__slideInLeft',
        'custom-animation',
      ],
    });

    this.isSubmit = false;
    this.disabled = true;
    this.isUpdate = true;

    this.chapterWiseweightageMasterModel = data;
    this.chapterWiseweightageMasterModel.weightage = data.weightage;
    this.chapterWiseweightageMasterModel.subjectId =
      data.subjectMaster?.subjectId;
    this.chapterWiseweightageMasterModel.entranceExamId =
      data.entranceExamMaster?.entranceExamId;
    this.chapterWiseweightageMasterModel.chapterId =
      data.chapterMaster?.chapterId;
    this.chapterWiseweightageMasterModel.status = data?.status;

    this.regiStrationForm.patchValue({
      entranceExamId: data.entranceExamMaster?.entranceExamId,
      subjectId: data.subjectMaster?.subjectId,
      chapterId: data.chapterMaster?.chapterId,
      weightage: data.weightage,
      chapterWeightageId: data.chapterWeightageId,
      status: data.status,
    });
  }

  deleteTopic(Id: any) {
    console.log({ Id });
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this Weightage?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(create_weightage, Id).subscribe(
          (res) => {
            this.gettopicData();
            this.message.success('Weightage deleted successfully');
          },
          (err) => {
            this.message.error('Weightage deleted failed');
          }
        );
      },
      nzCancelText: 'No',
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['/admin/layout/kyc-Master'], {
      queryParams: { id: id },
    });
  }
}

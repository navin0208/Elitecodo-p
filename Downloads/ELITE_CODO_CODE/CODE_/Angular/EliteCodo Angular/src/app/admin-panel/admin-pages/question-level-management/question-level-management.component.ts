import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { patternMaster } from 'src/app/shared/adminModel';
import { create_pattern, fileUpload, getAll_pattern, update_pattern, getById_pattern } from 'src/app/shared/allURL';
@Component({
  selector: 'app-question-level-management',
  templateUrl: './question-level-management.component.html',
  styleUrls: ['./question-level-management.component.css', '../../../../assets/css/form.css']
})
export class QuestionLevelManagementComponent implements OnInit {
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
  patternMasterModel = new patternMaster();
  AttendanceShift: any



  listOfOption: string[] = [];
  listOfSelectedValue = [];


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'patternName', 'patternActualName', 'status', 'edit'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.examForm();
    this.getexamData();


    const children: string[] = [];
    for (let i = 10; i < 36; i++) {
      children.push(`${i.toString(36)}${i}`);
    }
    this.listOfOption = children;
    console.log('listOfOption', this.listOfOption);
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      patternName: ['', [Validators.required,]],
      patternActualName: ['', [Validators.required,]],
      status: ['', [Validators.required]],
    });
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing',
      console.log('patternMasterModel', this.patternMasterModel);
    this.http.postRequest(create_pattern, this.patternMasterModel).subscribe(
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
    this.http.getRequest(getAll_pattern).subscribe(
      (res: any) => {
        console.log({ res });
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator
      })
  }

  update() {
    this.button = 'Update';
    this.isLoading = true;
    this.button = 'Processing',
      console.log('patternMasterModel', this.patternMasterModel);
    this.http.putRequest(update_pattern, this.patternMasterModel).subscribe(
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
    this.patternMasterModel = new patternMaster();
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
    this.http.getRequest(getById_pattern + id).subscribe(
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

        this.patternMasterModel = data;
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

import { Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { yearOfAppearanceMaster } from 'src/app/shared/adminModel';
import { create_yearOfExp, fileUpload, getAll_yearOfExp, update_yearOfExp, getById_yearOfExp } from 'src/app/shared/allURL';
@Component({
  selector: 'app-year-of-appearance-management',
  templateUrl: './year-of-appearance-management.component.html',
  styleUrls: ['./year-of-appearance-management.component.css', '../../../../assets/css/form.css']
})
export class YearOfAppearanceManagementComponent implements OnInit {
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
  yearOfAppearanceModel = new yearOfAppearanceMaster();
  AttendanceShift: any


  dataSource = new MatTableDataSource<any>();
  @ViewChild('epltable', { static: false }) epltable!: ElementRef;
  displayedColumns: string[] = ["id", 'date', 'yearOfAppearance', 'status', 'edit'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.examForm();
    this.getexamData();
  }

  examForm() {
    this.regiStrationForm = this.fb.group({
      yearOfAppearance: ['', [Validators.required]],
      status: ['', [Validators.required]],
    }); 
  }

  submit() {
    this.isLoading = true;
    this.button = 'Processing',
      console.log('yearOfAppearanceModel', this.yearOfAppearanceModel);
    this.http.postRequest(create_yearOfExp, this.yearOfAppearanceModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Submit';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Year Of appearance Creation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Submit';
        this.isLoading = false;
        this.notificationService.showError("Year Of appearance Creation Failed", "Failed");
      })
  }

  getexamData() {
    this.http.getRequest(getAll_yearOfExp).subscribe(
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
      console.log('yearOfAppearanceModel', this.yearOfAppearanceModel);
    this.http.putRequest(update_yearOfExp, this.yearOfAppearanceModel).subscribe(
      (res) => {
        console.log({ res });
        this.button = 'Update';
        this.regiStrationForm.reset();
        this.close();
        this.isLoading = false;
        this.getexamData();
        this.notificationService.showSuccess("Year Of appearance Updation Success", "Success");
      }, (err) => {
        console.log({ err });
        this.button = 'Update';
        this.isLoading = false;
        this.notificationService.showError("Year Of appearance Updation Failed", "Failed");
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
    this.yearOfAppearanceModel = new yearOfAppearanceMaster();
    this.regiStrationForm.reset();
    this.isSubmit = true;
    this.isUpdate = false;
    this.dialogRef = this.dialog.open(templateRef, {
      width: '600px',
      height: '400px',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
    });
  }

  edit(id: any, templateRef: TemplateRef<any>) {
    this.button = 'Update';
    console.log({ id });
    this.http.getRequest(getById_yearOfExp + id).subscribe(
      (data: any) => {
        console.log({ data });
        this.dialogRef = this.dialog.open(templateRef, {
          width: '600px ',
          height: '400px  ',
          hasBackdrop: true,
          backdropClass: 'custom-backdrop',
          panelClass: ['animate__animated', 'animate__slideInLeft', 'custom-animation'],
        });
        this.isSubmit = false;
        this.disabled = true;
        this.isUpdate = true;

        this.yearOfAppearanceModel = data;
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

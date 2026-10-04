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
import { yearOfAppearanceMaster } from 'src/app/shared/adminModel';
import { TYPE } from 'src/app/shared/AllModel';
import { create_yearOfExp, fileUpload, getAll_yearOfExp, update_yearOfExp, getById_yearOfExp, delete_Year_Of_Appearance } from 'src/app/shared/allURL';
import swal from 'sweetalert2';
@Component({
  selector: 'app-year-of-appearance-management',
  templateUrl: './year-of-appearance-management.component.html',
  styleUrls: ['./year-of-appearance-management.component.css', '../../../../assets/css/form.css']
})
export class YearOfAppearanceManagementComponent implements OnInit {
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
  deleteYearOfAppearance(yearOfAppearanceId: any) {
    console.log({ yearOfAppearanceId });
    // swal.fire({
    //   title: "Are you sure you want to delete this Year.?",
    //   text: "You won't be able to revert this!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!"
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     console.log({ yearOfAppearanceId });
    //     this.http.deleteRequest(delete_Year_Of_Appearance, yearOfAppearanceId).subscribe(
    //       (res) => {
    //         console.log({ res });
    //         swal.fire({
    //           title: "Deleted!",
    //           text: `"Year has been deleted."`,
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
      nzTitle: 'Are you sure you want to delete this Year?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.http.deleteRequest(delete_Year_Of_Appearance, yearOfAppearanceId).subscribe((res) => {
          this.getexamData();
          this.message.success('Year deleted successfully');
        }, err => {
          this.message.error('Year deleted failed');
        })
      },
      nzCancelText: 'No'
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
    this.router.navigate(['/admin/layout/kyc-Master'], { queryParams: { id: id } });
  }
}

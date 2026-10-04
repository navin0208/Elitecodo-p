import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.component.html',
  styleUrls: [
    './teacher-home.component.scss',
    '../../../../assets/css/loading.css',
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TeacherHomeComponent implements OnInit {
  route = inject(Router);
  http = inject(HttpmethodsService);
  examByTeacher: any;
  loading: boolean = false; // Loading state
  emptyErr: boolean = false; // Loading state
  errorMsg: boolean = false;
  typeIcon = TYPE.SUCCESS;
  constructor(private toastr: ToastrService) { }
  ngOnInit(): void {
    this.fetchExams();
  }
  routToBoardDash(board: any) {
    console.log({ board });
    sessionStorage.setItem('entranceExamIdOfTeacher', board.entranceExamId);
    this.route.navigateByUrl(`teacher/${board.entranceExamName}/dashboard`);
  }


  getExamsByTeacherID(): Observable<any> {
    let teacherID = sessionStorage.getItem('teacherId');
    return this.http.getRequest(`api/auth/teacherentranceexams/${teacherID}`);
  }
  

  fetchExams(): void {
    this.loading = true;
    this.errorMsg = false;
    this.emptyErr = false;

    this.getExamsByTeacherID() // Make sure this service method internally uses studentId
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response && response.length > 0) {
            this.examByTeacher = response;
            console.log('examByTeacher', this.examByTeacher);

          } else {
            this.examByTeacher = [];
            this.emptyErr = true;
          }
        },
        (error) => {
          console.error('Error fetching exams:', error);
          this.errorMsg = true;
          this.toastr.error('Failed to load exams. Please try again later.', 'Error');
        }
      );
  }
  getUserName(): string {
    const user = sessionStorage.getItem('userFullName');
    console.log({ user })
    if (user) {
      return user || 'User';
    }
    return 'User';
  }

  contactSupport(): void {
    // Implement contact support functionality
    this.toastr.info('Connecting to support...', 'Please wait');
    this.route.navigateByUrl(`student/Support/user-feedback`)
    // You can navigate to support page or open a modal
    // this.router.navigate(['/support']);
  }
  Logout() {
    swal
      .fire({
        title: 'You will be logged out?',
        text: "Using the back button will log you out. Are you sure you want to proceed?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085D6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Log Out!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.http.logout()
        }
      });
  }
  goBack(): void {
    // this.route.navigateByUrl(`student/Support/student-feedback-managment`)

    // this.route.navigate(['/dashboard']);



  }

  refreshExams(): void {
    this.toastr.info('Retrying...', 'Please wait');
    this.fetchExams();
  }
}

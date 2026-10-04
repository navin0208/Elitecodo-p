import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { getById_teacher, getById_teacherAccessmentDetails } from 'src/app/shared/allURL';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss', '../../../../assets/css/loading.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class ViewProfileComponent implements OnInit {
  http = inject(HttpmethodsService)
  teacherId: any;
  tabs = [
    { id: 'about', name: 'About', icon: 'fa fa-user' },
    { id: 'exams', name: 'Entrance Exams', icon: 'fa fa-graduation' }
  ];
  loading: boolean = false; // Loading state
  errorMsg: boolean = false;
  activeTab: string = 'about';
  teacherData: any; // Initialize with roles as an empty array

  constructor(private route: ActivatedRoute) { }



  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.teacherId = params['teacherId'];
      console.log({ teacherIdFromQueryParams: this.teacherId });

      if (this.teacherId) {
        this.getTeacherQuestions(this.teacherId);
      }
    });
  }

  getTeacherQuestions(teacherID: any) {
    this.loading = true; // Start loading
    this.http.getRequest(getById_teacherAccessmentDetails + teacherID).subscribe((res: any) => {
      console.log({ getTeacherQuestions: res });
      this.errorMsg = false;
      this.loading = false; // Data loaded
      this.teacherData = res;
    }, (error) => {
      this.errorMsg = true;
      this.loading = false; // Error occurred, stop loading
    })
  }

  getTotalSubjects(): number {
    return this.teacherData.teacherAssessmentEntranceExams.reduce((total: any, exam: any) => {
      return total + exam.teacherAssessmentStandards.reduce((subtotal: any, standard: any) => {
        return subtotal + standard.teacherAssessmentSubjects.length;
      }, 0);
    }, 0);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getFullName(): string {
    return `${this.teacherData.firstName} ${this.teacherData.lastName}`;
  }

  getRoleName(): string {
    return this.teacherData.roles && this.teacherData.roles.length > 0
      ? this.teacherData.roles[0].name.replace('ROLE_', '')
      : '';
  }


}

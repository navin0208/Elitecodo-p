import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
interface overallReportCount {
  totalStudent: Number,
  activeExams: Number,
  passRate: Number
  // You can add other possible properties if needed
}
@Component({
  selector: 'app-overall-reports',
  templateUrl: './overall-reports.component.html',
  styleUrls: ['./overall-reports.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state('void', style({
        transform: 'translateY(20px)',
        opacity: 0
      })),
      transition('void => *', [
        animate('0.4s ease-out')
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class OverallReportsComponent {
  route = inject(Router);
  activateROut = inject(ActivatedRoute);
  http = inject(HttpmethodsService);
  boardName = this.activateROut.snapshot.paramMap.get('name');

  reportsCount: overallReportCount = {
    totalStudent: 0,
    activeExams: 0,
    passRate: 0
  }


  resultOptions = [
    // {
    //   title: 'Single Exam Result',
    //   description: 'View and analyze individual exam performance',
    //   icon: 'fa-file-alt',
    //   route: 'teacher/${this.boardName}/single-exam',
    //   colorClass: 'color-1'
    // },
    {
      title: 'All Exam Results',
      description: 'Comprehensive overview of all examination data',
      icon: 'fa-database',
      route: `/teacher/${this.boardName}/all-exams`,
      colorClass: 'color-2'
    },
    {
      title: 'All Student Results',
      description: 'Track performance across the entire class',
      icon: 'fa-users',
      route: `teacher/${this.boardName}/all-students`,
      colorClass: 'color-3'
    },
    // {
    //   title: 'Single Student All Exams',
    //   description: 'In-depth analysis of individual student progress',
    //   icon: 'fa-user-graduate',
    //   route: 'teacher/${this.boardName}/student-history',
    //   colorClass: 'color-4'
    // },
    {
      title: 'Exam Wise Results',
      description: 'Compare and analyze exam-wise performance',
      icon: 'fa-chart-bar',
      route: `teacher/${this.boardName}/exam-wise`,
      colorClass: 'color-5'
    },
    // {
    //   title: 'Subject Wise Results',
    //   description: 'Subject-based performance breakdown',
    //   icon: 'fa-book',
    //   route: 'teacher/${this.boardName}/subject-wise',
    //   colorClass: 'color-6'
    // }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.getOverAllReportDash();
  }



  getOverAllReportDash() {
    this.http.getRequest(`api/test/getTeacherReport/${Number(sessionStorage.getItem('teacherId'))}`).subscribe(
      (res: any) => {
        this.reportsCount = res;
      },
      (error) => {
        console.error('Error fetching dashboard count:', error);
        // Optionally reset to default values or show error message
      }
    );
  }


  navigateToOption(route: string): void {

    this.router.navigate([route]);
  }
}

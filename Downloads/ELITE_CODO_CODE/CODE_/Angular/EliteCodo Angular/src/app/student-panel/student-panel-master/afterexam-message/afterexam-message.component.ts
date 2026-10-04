import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-afterexam-message',
  templateUrl: './afterexam-message.component.html',
  styleUrls: ['./afterexam-message.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AfterexamMessageComponent {
  studentName: string = '';
  testName: string = '';
  currentDate: Date = new Date(); // Add this line
  activateROut = inject(ActivatedRoute);

  route = inject(Router);


  constructor(private router: Router) { }


  ngOnInit() {
    // Get data from session storage
    this.studentName = sessionStorage.getItem('studentName') || 'Student';
    this.testName = sessionStorage.getItem('testName') || 'Exam';
  }

  goToDashboard() {

    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.router.navigateByUrl(`student/${boardName}/dashboard`)

  }
}

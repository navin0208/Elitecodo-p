import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainURL } from 'src/app/ConfigUrl/config';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { animate, style, transition, trigger } from '@angular/animations';
interface DashboardCard {
  title: string;
  description: string;
  image: string;
  route: string;
  highlighted?: boolean;
}
@Component({
  selector: 'app-board-dashboard',
  templateUrl: './board-dashboard.component.html',
  styleUrls: ['./board-dashboard.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.3s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class BoardDashboardComponent {
  dashboardCards: DashboardCard[] = [
    {
      title: 'Study Resources',
      description: 'Access learning materials, textbooks, and guides',
      image: '../../../../assets/images/BoardsImage/study_resources.png',
      route: 'study_resources',
      highlighted: true,
    },
    {
      title: 'Question bank',
      description:
        'Explore a comprehensive collection of questions and answers for effective exam preparation',
      image: '../../../../assets/images/BoardsImage/question-bank.jpg',
      route: 'question-bank',
      highlighted: true,
    },
    {
      title: 'Create Tests',
      description:
        'Create and take custom mock tests for practice and self-assessment',
      image: '../../../../assets/images/BoardsImage/tests.jpg',
      route: 'test',
      highlighted: true,
    },
    {
      title: 'Join Test',
      description: 'Participate in scheduled and Mock examinations',
      image: '../../../../assets/images/BoardsImage/join.jpg',
      route: 'join-test',
      highlighted: true,
    },
    {
      title: 'Exam Results',
      description: 'View your performance and grade distribution',
      image: '../../../../assets/images/BoardsImage/tests3.jpg',
      route: 'exam-marks-distribution',
      highlighted: true,
    },
    {
      title: 'Communication',
      description: 'Connect with instructors',
      image: '../../../../assets/images/BoardsImage/communication.jpg',
      route: 'communication',
      highlighted: true,
    },
    {
      title: 'Important Questions',
      description: 'Connect with instructors',
      image:
        '../../../../assets/images/BoardsImage/important-question-bank.jpg',
      route: `important-questions?studentId=${sessionStorage.getItem(
        'studentId'
      )}`,
      highlighted: true,
    },
    {
      title: 'Feedback',
      description: 'Submit and review course evaluations',
      image: '../../../../assets/images/BoardsImage/feedbacak.png',
      route: 'student-feedback-managment',
      highlighted: true,
    },
  ];
  route = inject(Router);
  activateROut = inject(ActivatedRoute);
  http = inject(HttpmethodsService);
  ReactWebPage = MainURL.ReactWeb;
  BackgroundColor: any;

  routToBoardDash(board: any) {
    console.log({ board });

    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigateByUrl(`student/${boardName}/${board}`);
    let studentID = sessionStorage.getItem('studentId');
    this.BackgroundColor = localStorage.getItem('backgroundColor');
    let modiField = this.BackgroundColor.replace('#', '');
    console.log(modiField);

    if (board == 'AddQuestion') {
      window.location.href = `${this.ReactWebPage}/create-question/${modiField}/${studentID}`;
    } else if (board == 'ViewQuestions') {
      window.location.href = `${this.ReactWebPage}/question-list/${modiField}/${studentID}`;
    } else if (board == 'test') {
      this.route.navigate([`/student/${boardName}/test`]);
    }
  }
}

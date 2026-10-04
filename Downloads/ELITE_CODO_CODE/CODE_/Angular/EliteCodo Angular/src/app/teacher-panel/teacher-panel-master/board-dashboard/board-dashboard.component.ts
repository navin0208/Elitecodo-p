import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainURL } from 'src/app/ConfigUrl/config';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
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
  styleUrls: ['./board-dashboard.component.scss']
})
export class BoardDashboardComponent {
  teacherDashboardCards: DashboardCard[] = [
    {
      title: 'Exam Result',
      description: 'View and manage exam results',
      image: '../../../../assets/images/BoardsImage/result_icon.png',
      route: 'offline_test',
      highlighted: true
    },
    {
      title: 'Upload Content',
      description: 'Upload study materials, notes, and resources',
      image: '../../../../assets/images/BoardsImage/upload.jpg',
      route: 'upload-content',
      highlighted: true
    },
    {
      title: 'Create Tests',
      description: 'Create and manage tests for students',
      image: '../../../../assets/images/BoardsImage/tests.jpg',
      route: 'tests',
      highlighted: true
    },
    {
      title: 'Add Question',
      description: 'Add new questions to the question bank',
      image: '../../../../assets/images/BoardsImage/tests2.jpg',
      route: 'AddQuestion',
      highlighted: true
    },
    {
      title: 'View Questions',
      description: 'Browse and manage the question bank',
      image: '../../../../assets/images/BoardsImage/tests2.jpg',
      route: 'ViewQuestions',
      highlighted: true
    },
    {
      title: 'Overall Reports',
      description: 'Analyze student performance with detailed reports',
      image: '../../../../assets/images/BoardsImage/tests3.jpg',
      route: 'Overall-Reports',
      highlighted: true
    },
    {
      title: 'Communication',
      description: 'Connect and communicate with students',
      image: 'https://img01.flagma.co.il/photo/ishchu-onlayn-rabotu-znayu-russkiy-i-angliyskiy-1698648_medium.jpg',
      route: 'communication',
      highlighted: true
    },
    {
      title: 'Add Users',
      description: 'Add and manage student accounts',
      image: '../../../../assets/images/BoardsImage/add-user.png',
      route: 'add-user',
      highlighted: true
    },
    {
      title: 'Feedbacks',
      description: 'Provide and review feedback from students',
      image: '../../../../assets/images/BoardsImage/feedbacak.png',
      route: 'teacher-feedback-managemnt',
      highlighted: true
    }
  ];

  route = inject(Router);
  activateROut = inject(ActivatedRoute);
  http = inject(HttpmethodsService);
  ReactWebPage = MainURL.ReactWeb;
  BackgroundColor: any;

  routToBoardDash(board: any) {
    console.log({ board });
    
    if (board === 'AddQuestion' || board === 'ViewQuestions') {
      sessionStorage.setItem('preventLogout', 'true');
    }

    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigateByUrl(`teacher/${boardName}/${board}`)
    let teacherID = sessionStorage.getItem('teacherId');
    this.BackgroundColor = localStorage.getItem('backgroundColor');
    let modiField = this.BackgroundColor.replace("#", "")
    console.log(modiField)


    let entranceExamIdOfTeacher = sessionStorage.getItem('entranceExamIdOfTeacher')
    let sessionStorageObj: any = {
      adminprofilePicture: sessionStorage.getItem('adminprofilePicture'),
      adminlogoImage: sessionStorage.getItem('adminlogoImage'),
      adminwatermarkImage: sessionStorage.getItem('adminwatermarkImage'),
      userFullName: sessionStorage.getItem('userFullName'),
      className: sessionStorage.getItem('className'),
    }

    if (board == 'AddQuestion') {
      // window.location.href = `${this.ReactWebPage}/create-question/${modiField}/${entranceExamIdOfTeacher}/${boardName}/${teacherID}`
      window.location.href = `${this.ReactWebPage}/create-question/${modiField}/${entranceExamIdOfTeacher}/${boardName}/${teacherID}?` +
        `adminprofilePicture=${encodeURIComponent(sessionStorageObj.adminprofilePicture)}` +
        `&adminlogoImage=${encodeURIComponent(sessionStorageObj.adminlogoImage)}` +
        `&userFullName=${encodeURIComponent(sessionStorageObj.userFullName)}` +
        `&className=${encodeURIComponent(sessionStorageObj.className)}`;
    }
    else if (board == 'ViewQuestions') {
      window.location.href = `${this.ReactWebPage}/question-list/${modiField}/${entranceExamIdOfTeacher}/${boardName}/${teacherID}?` +
        `adminprofilePicture=${encodeURIComponent(sessionStorageObj.adminprofilePicture)}` +
        `&adminlogoImage=${encodeURIComponent(sessionStorageObj.adminlogoImage)}` +
        `&userFullName=${encodeURIComponent(sessionStorageObj.userFullName)}` +
        `&className=${encodeURIComponent(sessionStorageObj.className)}`;
    }




    console.log({ sessionStorageObj });

  }

}
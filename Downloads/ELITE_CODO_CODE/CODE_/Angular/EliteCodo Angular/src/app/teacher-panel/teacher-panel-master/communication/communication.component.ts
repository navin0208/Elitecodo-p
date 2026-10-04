import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface DashboardCount {
  studentCount: number;
  parentCount: number;
  questionCount: number;
  testCount: number;
  // You can add other possible properties if needed
}

interface CommunicationCard {
  id: string;
  icon: string;
  rout: string;
  title: string;
  description: string;
  backgroundColor: string;
  stats: {
    unreadMessages: number;
    totalContacts: number;
  };
}

@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss'],
})
export class CommunicationComponent implements OnInit {
  dashboardCount: DashboardCount = {
    studentCount: 0,
    parentCount: 0,
    questionCount: 0,
    testCount: 0
  };

  communicationCards!: CommunicationCard[]
  activateROut = inject(ActivatedRoute)
  http = inject(HttpmethodsService)

  constructor(private router: Router) { }
  ngOnInit(): void {
    this.getDashCount();
  }




  getDashCount() {
    this.http.getRequest(`api/auth/dashboardCount/${Number(sessionStorage.getItem('teacherId'))}`).subscribe(
      (res: any) => {
        console.log({ getDashCount: res });

        this.dashboardCount = res;
        this.communicationCards = [

          {
            id: 'parent-communication',
            icon: 'team',
            rout: 'parent-communication',
            title: 'Parent Communication',
            description: 'Seamless parent-teacher interaction',
            backgroundColor: '#0891b2', // Cyan
            stats: {
              unreadMessages: 12,
              totalContacts: this.dashboardCount.parentCount
            }
          },
          {
            id: 'student-communication',
            icon: 'message',
            rout: 'student-communication',
            title: 'Student Communication',
            description: 'Direct messaging platform',
            backgroundColor: '#7c3aed', // Purple
            stats: {
              unreadMessages: 8,
              totalContacts: this.dashboardCount.studentCount
            }
          }
        ];
      },
      (error) => {
        console.error('Error fetching dashboard count:', error);
        // Optionally reset to default values or show error message
      }
    );
  }


  routToBoardDash(board: any) {
    console.log({ board });

    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.router.navigateByUrl(`teacher/${boardName}/${board}`)
  }
  getGradient(colors: string[]): string {
    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  navigateToChannel(card: CommunicationCard): void {
    this.router.navigate([card.rout]);
  }



}

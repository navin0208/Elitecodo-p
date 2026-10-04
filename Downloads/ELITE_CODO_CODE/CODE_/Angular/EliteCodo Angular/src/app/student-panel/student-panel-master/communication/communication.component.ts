import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


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
  communicationCards: CommunicationCard[] = [
    // {
    //   id: 'super-admin-communication',
    //   icon: 'team',
    //   rout: 'user-feedback',
    //   title: 'Super-admin Communication',
    //   description: 'Seamless Super-admin-teacher interaction',
    //   backgroundColor: '#2563eb', // Blue
    //   stats: {
    //     unreadMessages: 12,
    //     totalContacts: 45
    //   }
    // },
    {
      id: 'Teacher-communication',
      icon: 'team',
      rout: 'user-feedback',
      title: 'Teacher Communication',
      description: 'Seamless Teacher interaction',
      backgroundColor: '#0891b2', // Cyan
      stats: {
        unreadMessages: 12,
        totalContacts: 45
      }
    }
    // {
    //   id: 'student-communication',
    //   icon: 'message',
    //   rout: 'student-communication',
    //   title: 'Student Communication',
    //   description: 'Direct messaging platform',
    //   backgroundColor: '#7c3aed', // Purple
    //   stats: {
    //     unreadMessages: 8,
    //     totalContacts: 32
    //   }
    // }
  ];
  activateROut = inject(ActivatedRoute)

  constructor(private router: Router) { }
  ngOnInit(): void {
  }

  routToBoardDash(board: any) {
    console.log({ board });

    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.router.navigateByUrl(`student/${boardName}/${board}`)
  }
  getGradient(colors: string[]): string {
    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  navigateToChannel(card: CommunicationCard): void {
    this.router.navigate([card.rout]);
  }



}

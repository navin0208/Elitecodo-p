import { Component, HostListener, inject } from '@angular/core';
import { LogoutService } from 'src/app/share-services/logout.service';

@Component({
  selector: 'app-teacher-panel',
  templateUrl: './teacher-panel.component.html',
  styleUrls: ['./teacher-panel.component.css']
})
export class TeacherPanelComponent {
  watermarkImage!: string
  logoutService = inject(LogoutService);
  constructor() { }

  ngOnInit(): void {
    this.watermarkImage = String(sessionStorage.getItem('adminwatermarkImage'))
  }
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   if (sessionStorage.getItem('preventLogout') === 'true') {
  //     sessionStorage.removeItem('preventLogout');
  //     return;
  //   }

  //   $event.preventDefault();
  //   $event.returnValue = '';
  //   this.logoutService.logWithSession();
  // }

  // @HostListener('window:unload', ['$event'])
  // beforeunload($event: any) {
  //   // Do cleanup here, if necessary
  // }
}

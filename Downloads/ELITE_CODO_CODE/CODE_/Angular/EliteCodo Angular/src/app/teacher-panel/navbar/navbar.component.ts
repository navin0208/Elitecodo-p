import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { TYPE } from 'src/app/shared/AllModel';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { LogoutService } from 'src/app/share-services/logout.service';
interface LogoutRoleWiseRequest {
  id: number;
  userRole: string;
}
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  typeIcon = TYPE.SUCCESS;
  sessionStorageObj: any;
  http = inject(HttpmethodsService);
  router = inject(Router);
  unreadNotifications = 3;
  showNotifications = false;
  activateROut = inject(ActivatedRoute);
  logoutService = inject(LogoutService);


  constructor(private location: Location) { }

  ngOnInit(): void {
    this.sessionStorageObj = {
      adminprofilePicture: sessionStorage.getItem('adminprofilePicture'),
      adminlogoImage: sessionStorage.getItem('adminlogoImage'),
      adminwatermarkImage: sessionStorage.getItem('adminwatermarkImage'),
      userFullName: sessionStorage.getItem('userFullName'),
      className: sessionStorage.getItem('className'),
    }
    console.log('sessionStorageObj', this.sessionStorageObj);

  }

  goBack(): void {
    this.location.back();
  }
  toggleNotifications() {
    const boardName = this.activateROut.snapshot.paramMap.get('name');

    this.router.navigate([`teacher/notification`]);
  }



  Logout() {
    swal
      .fire({
        title: 'Are you sure you want to log out?',
        // text: "Are you sure you want to log out?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085D6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Log Out!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.logoutService.logWithSession();
        }
      });
  }



}

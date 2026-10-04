// role.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';
import { RoleNotificationComponent } from 'src/app/teacher-panel/teacher-panel-master/role-notification/role-notification.component';

@Injectable({
  providedIn: 'root'
})
export class RolesserviceForOthersService {
  constructor(
    private dialog: MatDialog,
  ) { }

  // Method to show the role creation success notification
  showRoleCreationSuccess(roleName: string): void {
    this.dialog.open(RoleNotificationComponent, {
      width: '500px',
      disableClose: false,
      panelClass: 'notification-dialog',
      data: {
        roleName: roleName
      }
    });
  }
}
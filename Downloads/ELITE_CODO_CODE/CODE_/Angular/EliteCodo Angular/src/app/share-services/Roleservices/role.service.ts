// role.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RoleNotificationComponent } from 'src/app/super-admin-panel/admin-pages/role-notification/role-notification.component';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(
    private dialog: MatDialog,
    private http: HttpClient
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
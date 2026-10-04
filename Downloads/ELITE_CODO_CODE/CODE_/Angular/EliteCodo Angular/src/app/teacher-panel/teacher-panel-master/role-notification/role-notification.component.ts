import { Component, Inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-role-notification',
  templateUrl: './role-notification.component.html',
  styleUrls: ['./role-notification.component.scss', '../../../../assets/css/form.css'],
  animations: [
    trigger('dialogEnterLeave', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class RoleNotificationComponent {
  constructor(
    public dialogRef: MatDialogRef<RoleNotificationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { roleName: string },
    private router: Router
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  navigateToDashboard(): void {
    this.dialogRef.close();
    this.router.navigate(['/super_admin/Slayout/pending-user-status']);
  }
}

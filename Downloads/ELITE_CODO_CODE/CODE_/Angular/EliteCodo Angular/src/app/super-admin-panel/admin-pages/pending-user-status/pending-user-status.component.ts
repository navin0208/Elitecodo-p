import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

@Component({
  selector: 'app-pending-user-status',
  templateUrl: './pending-user-status.component.html',
  styleUrls: ['./pending-user-status.component.css']
})
export class PendingUserStatusComponent implements OnInit {

  Math = Math;
  router = inject(Router);
  http = inject(HttpmethodsService);
  statusData: any;

  constructor() { }

  ngOnInit(): void {
    this.http.getRequest('api/auth/dashboarddetails').subscribe(
      (response: any) => {
        this.statusData = response
        console.log('statusData', this.statusData);
      })
  }

  /**
   * Navigate to pending user list with the role filter
   * This is called when clicking the status tag (the pending count/message)
   * Same navigation as "View Details" button
   */
  navigateToPendingList(role: string): void {
    console.log('Navigating to pending list for role:', role);
    // Navigate to the exact same route as "View Details" button
    this.router.navigate(['/super_admin/Slayout/pending-user-list'], { 
      queryParams: { orderby: role } 
    });
  }

  getStatusColor(item: any): string {
    if (item.totalPendingCount === 0) {
      return 'success';
    }
    if (item.totalPendingCount <= item.total * 0.2) { // less than 20%
      return 'processing';
    }
    if (item.totalPendingCount <= item.total * 0.5) { // less than 50%
      return 'warning';
    }
    return 'error';
  }

  getStatusIcon(item: any): string {
    if (item.totalPendingCount === 0) {
      return 'check-circle';
    }
    if (item.trend > 0) {
      return 'arrow-up';
    }
    if (item.trend < 0) {
      return 'arrow-down';
    }
    return 'exclamation-circle';
  }

  getStatusMessage(item: any): string {
    // Calculate percentage
    const pendingPercentage = (item.totalPendingCount / item.total) * 100;

    switch (item.role) {
      case 'Teacher':
        return item.totalPendingCount === 0
          ? 'All teachers verified'
          : `${item.totalPendingCount} Teachers need approval`;

      case 'Student':
        return item.totalPendingCount === 0
          ? 'All students registered'
          : `${item.totalPendingCount} Registrations pending`;

      case 'Parent':
        return item.totalPendingCount === 0
          ? 'All parent accounts active'
          : `${item.totalPendingCount} Parents await verification`;

      case 'Admin':
        return item.totalPendingCount === 0
          ? 'All tasks completed'
          : `${item.totalPendingCount} Tasks require attention`;

      case 'Institution':
        return item.totalPendingCount === 0
          ? 'All institutions verified'
          : `${item.totalPendingCount} Institutions pending`;

      default:
        return item.totalPendingCount === 0
          ? 'All items completed'
          : `${item.totalPendingCount} Items pending`;
    }
  }

  routToNextPage(id: any) {
    this.router.navigate(['../pending-user-status'], { queryParams: { Role: id } });
  }
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { Location } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
  status: string;
  contactNumber: string;
  avatarUrl: string;
  registrationDate?: string;
}

@Component({
  selector: 'app-pending-user-details',
  templateUrl: './pending-user-details.component.html',
  styleUrls: ['./pending-user-details.component.scss']
})
export class PendingUserDetailsComponent implements OnInit {
  user: User | null = null;
  loading = true;
  apiUrl = 'api/auth/getInfo';

  // Flag to disable both buttons after any action (Activate or Reject)
  isActionPerformed: boolean = false;

  userTypeIcons: { [key: string]: string } = {
    ROLE_TEACHER: 'book',
    ROLE_STUDENT: 'user',
    ROLE_PARENT: 'team',
    ROLE_ADMIN: 'crown',
    ROLE_INSTITUTE: 'bank'
  };

  constructor(
    private http: HttpmethodsService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private location: Location
  ) { }

  ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    this.fetchUserDetails(userId);
  }

  fetchUserDetails(userId: number) {
    this.http.getRequest(`${this.apiUrl}/${userId}`).subscribe({
      next: (response: any) => {
        this.user = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        this.message.error('Failed to fetch user details');
        this.loading = false;
      }
    });
  }

  /**
   * Redirect to Dashboard after any action
   */
  redirectToDashboard(): void {
    // Navigate to Super Admin Dashboard
    this.router.navigate(['/super_admin/Slayout']);
  }

  activateUser() {
    if (this.user && !this.isActionPerformed) {
      this.loading = true;

      const requestObj = {
        userIds: [this.user.id],
        status: 'Active',
        acceptBy: sessionStorage.getItem('superadminId')
      };

      this.http.putRequest(`api/auth/bulkuserchangestatus`, requestObj).subscribe({
        next: () => {
          if (this.user?.userType === 'ROLE_PARENT') {
            this.updateParentStatus(requestObj);
          } else {
            this.handleSuccess('User activated successfully');
          }
        },
        error: () => {
          this.handleError('Failed to activate user');
        }
      });
    }
  }

  rejectUser() {
    if (this.user && !this.isActionPerformed) {
      this.modal.confirm({
        nzTitle: 'Are you sure you want to reject this user?',
        nzContent: 'This action cannot be undone.',
        nzOkText: 'Yes',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzOnOk: () => {
          this.loading = true;

          const requestObj = {
            userIds: [this.user!.id],
            status: 'Rejected',
            acceptBy: sessionStorage.getItem('superadminId')
          };

          this.http.putRequest(`api/auth/bulkuserchangestatus`, requestObj).subscribe({
            next: () => {
              this.handleSuccess('User rejected');
            },
            error: () => {
              this.handleError('Failed to reject user');
            }
          });
        },
        nzCancelText: 'No'
      });
    }
  }

  private updateParentStatus(requestObj: any) {
    this.http.putRequest(`api/auth/bulkparentstatuschange`, requestObj).subscribe({
      next: () => {
        this.handleSuccess('Parent activated successfully');
      },
      error: () => {
        this.handleError('Failed to update parent status');
      }
    });
  }

  /**
   * Handle success - set action flag, show message, redirect to dashboard
   */
  private handleSuccess(message: string) {
    this.message.success(message);
    this.loading = false;
    
    // Mark action as performed to disable both buttons
    this.isActionPerformed = true;
    
    // Update user status to reflect the change
    if (this.user) {
      // Determine the new status based on the action
      // We need to know which action was performed
      // Since we don't track it, we'll check the current status
      // But we can just set a flag and let the UI handle it
    }
    
    // Redirect to Dashboard after a short delay
    setTimeout(() => {
      this.redirectToDashboard();
    }, 1500);
  }

  /**
   * Handle error - show error, stop loading, do NOT redirect
   */
  private handleError(message: string) {
    this.message.error(message);
    this.loading = false;
    // Do NOT set isActionPerformed = true on error
    // User should be able to retry
  }

  goBack(): void {
    this.location.back();
  }

  getStatusColor(status: string): 'red' | 'green' | 'blue' | 'grey' | 'gray' {
    switch (status.toLowerCase()) {
      case 'Active':
        return 'green';
      case 'Pending':
        return 'blue';
      case 'rejected':
        return 'red';
      default:
        return 'grey';
    }
  }

  getStatusBadge(status: string): string {
    const badges = {
      Pending: 'processing',
      Active: 'success',
      rejected: 'error'
    } as { [key: string]: string };
    return badges[status] || 'default';
  }
}
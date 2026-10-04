import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';

interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  status: 'pending' | 'active' | 'rejected';
  creatorId: number | null;
  role: string;
  date: string;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
  } | null;
  selected: boolean;
  name?: string;
  userType?: string;
  registrationDate?: Date;
}

@Component({
  selector: 'app-pending-user-list',
  templateUrl: './pending-user-list.component.html',
  styleUrls: ['./pending-user-list.component.css', '../../../../assets/css/pagination.css']
})
export class PendingUserListComponent implements OnInit {
  users: User[] = [];
  selectedUserType = '';
  selectedStatus = '';
  showBulkActivation = false;
  searchTerm = '';
  isLoading = false;
  disableBtn = false;

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  visiblePages: number[] = [];
  currentRole: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpmethodsService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentRole = params['orderby']?.toLowerCase() || '';
      if (this.currentRole) {
        this.fetchPendingUsers();
      } else {
        this.errorMessage = 'No role specified';
        this.isLoading = false;
      }
    });
  }

  fetchPendingUsers() {
    let apiEndpoint = '';
    switch (this.currentRole) {
      case 'teacher':
        apiEndpoint = 'api/auth/pendingteacherlist';
        break;
      case 'student':
        apiEndpoint = 'api/auth/pendingstudentlist';
        break;
      case 'parent':
        apiEndpoint = 'api/auth/pendingparentlist';
        break;
      case 'admin':
        apiEndpoint = 'api/auth/pendingadminlist';
        break;
      case 'institute':
        apiEndpoint = 'api/auth/pendinginstitutelist';
        break;
      default:
        this.errorMessage = 'Invalid role specified';
        return;
    }
    this.fetchUsers(apiEndpoint);
  }

  fetchUsers(api: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.getRequest(api).subscribe({
      next: (data: any) => {
        console.log('Data received:', data); // Debug log

        if (data && Array.isArray(data)) {
          this.users = data.map((user: any) => {
            // Format user name
            const displayName = this.formatUserName(user);

            // Format creator name
            let creatorName = 'System';
            if (user.creator) {
              creatorName = `${user.creator.firstName || ''} ${user.creator.lastName || ''}`.trim();
              if (!creatorName) creatorName = user.creator.email || 'System';
            }

            // Map role to user type
            const userType = user.role ? user.role.replace('ROLE_', '').toLowerCase() : this.currentRole;

            return {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              status: user.status?.toLowerCase() || 'pending',
              creatorId: user.creatorId,
              role: user.role,
              date: user.date,
              creator: user.creator,
              selected: false,
              name: displayName,
              userType: userType,
              registrationDate: user.date ? new Date(user.date) : new Date(),
              creatorName: creatorName // Add this for easier access
            };
          });

          console.log('Processed users:', this.users); // Debug log
          this.updatePagination();
        } else {
          this.users = [];
          this.errorMessage = 'Invalid data format received';
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching pending users', error);
        this.errorMessage = 'Error loading data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  formatUserName(user: any): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else if (user.email) {
      return user.email.split('@')[0];
    } else {
      return 'Unknown User';
    }
  }

  get hasData(): boolean {
    return this.filteredUsers.length > 0;
  }

  get filteredUsers() {
    return this.users.filter(user => {
      // Search in user's full name
      const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim();

      // Search in creator's full name (handle null creator)
      let creatorFullName = '';
      if (user.creator) {
        creatorFullName = `${user.creator.firstName || ''} ${user.creator.lastName || ''}`.toLowerCase().trim();
      } else {
        creatorFullName = 'system';
      }

      // Search in creator's email (handle null creator)
      let creatorEmail = '';
      if (user.creator) {
        creatorEmail = user.creator.email?.toLowerCase() || '';
      }

      // Search in creator's mobile (handle null creator)
      let creatorMobile = '';
      if (user.creator) {
        creatorMobile = user.creator.mobile || '';
      }

      const searchMatch = !this.searchTerm ||
        userFullName.includes(this.searchTerm.toLowerCase()) ||
        creatorFullName.includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        creatorEmail.includes(this.searchTerm.toLowerCase()) ||
        creatorMobile.includes(this.searchTerm);

      // Match status
      const statusMatch = !this.selectedStatus ||
        user.status.toLowerCase() === this.selectedStatus.toLowerCase();

      return searchMatch && statusMatch;
    });
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages);
    this.updateVisiblePages();
  }

  updateVisiblePages() {
    const totalVisible = 5;
    const halfVisible = Math.floor(totalVisible / 2);

    let start = Math.max(this.currentPage - halfVisible, 1);
    let end = Math.min(start + totalVisible - 1, this.totalPages);

    if (end - start + 1 < totalVisible) {
      start = Math.max(end - totalVisible + 1, 1);
    }

    this.visiblePages = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateVisiblePages();
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  viewDetails(user: User) {
    this.router.navigateByUrl(`super_admin/Slayout/pending-user-details/${user.id}`);
  }

  toggleBulkActivation() {
    this.users.forEach(user => (user.selected = false));
    this.showBulkActivation = !this.showBulkActivation;
  }

  selectAll(event: any) {
    const checked = event.target.checked;
    this.paginatedUsers.forEach(paginatedUser => {
      const user = this.users.find(u => u.id === paginatedUser.id);
      if (user) {
        user.selected = checked;
      }
    });
  }

  bulkActivate() {
    this.disableBtn = true;
    const selectedUsers = this.users.filter(user => user.selected);

    if (selectedUsers.length === 0) {
      this.notificationService.showWarning("Please select at least one user", "No Selection");
      this.disableBtn = false;
      return;
    }

    const userIds = selectedUsers.map(user => user.id);

    const requestObj = {
      userIds: userIds,
      status: 'Active',
      acceptBy: sessionStorage.getItem('superadminId')
    };

    this.http.putRequest(`api/auth/bulkuserchangestatus`, requestObj).subscribe({
      next: (res) => {
        console.log('Bulk activate response:', res);

        if (this.currentRole === 'parent') {
          this.http.putRequest(`api/auth/bulkparentstatuschange`, requestObj).subscribe({
            next: (res) => {
              console.log('Parent status update response:', res);
              this.notificationService.showSuccess("Users Activated Successfully", "Success");
              this.fetchUsers(`api/auth/pending${this.currentRole}list`);
              this.showBulkActivation = false;
              this.disableBtn = false;
            },
            error: (error) => {
              console.error('Error updating parent status:', error);
              this.notificationService.showError("Error updating parent status", "Error");
              this.disableBtn = false;
            }
          });
        } else {
          this.notificationService.showSuccess("Users Activated Successfully", "Success");
          this.fetchUsers(`api/auth/pending${this.currentRole}list`);
          this.showBulkActivation = false;
          this.disableBtn = false;
        }
      },
      error: (error) => {
        console.error('Error in bulk activation:', error);
        this.notificationService.showError("Something Went Wrong", "Error");
        this.disableBtn = false;
      }
    });
  }

  bulkReject() {
    this.disableBtn = true;
    const selectedUsers = this.users.filter(user => user.selected);

    if (selectedUsers.length === 0) {
      this.notificationService.showWarning("Please select at least one user", "No Selection");
      this.disableBtn = false;
      return;
    }

    const userIds = selectedUsers.map(user => user.id);

    const requestObj = {
      userIds: userIds,
      status: 'Rejected',
      acceptBy: sessionStorage.getItem('superadminId')
    };

    this.http.putRequest(`api/auth/bulkuserchangestatus`, requestObj).subscribe({
      next: (res) => {
        console.log('Bulk reject response:', res);
        this.notificationService.showSuccess("Users Rejected Successfully", "Success");
        this.fetchUsers(`api/auth/pending${this.currentRole}list`);
        this.showBulkActivation = false;
        this.disableBtn = false;
      },
      error: (error) => {
        console.error('Error in bulk rejection:', error);
        this.notificationService.showError("Something Went Wrong", "Error");
        this.disableBtn = false;
      }
    });
  }

  onCheckboxChange(changedUser: User) {
    const user = this.users.find(u => u.id === changedUser.id);
    if (user) {
      user.selected = changedUser.selected;
    }
  }
}
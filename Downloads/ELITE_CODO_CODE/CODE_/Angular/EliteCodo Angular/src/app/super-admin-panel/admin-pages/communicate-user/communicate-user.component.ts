import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { animate, style, transition, trigger } from '@angular/animations';
import { Draft, DraftService } from 'src/app/share-services/draftService/draft.service';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  lastActive: string;
  status: 'Online' | 'Offline' | 'away';
}

@Component({
  selector: 'app-communicate-user',
  templateUrl: './communicate-user.component.html',
  styleUrls: ['./communicate-user.component.scss'],
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class CommunicateUserComponent implements OnInit {
  private _activeTab = 'broadcast';
  get activeTab(): string {
    return this._activeTab;
  }
  http = inject(HttpmethodsService)
  set activeTab(value: string) {
    if (this._activeTab !== value) {
      this._activeTab = value;
      this.resetCurrentForm();
      this.selectedUsers = [];  // Reset selected users when changing tabs
    }
  }

  isSidebarCollapsed = false;
  broadcastForm!: FormGroup;
  individualForm!: FormGroup;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  currentUser: User | null = null;
  drafts: Draft[] = [];

  // Profile image - will be loaded from sessionStorage
  profileImage: string = '';
  defaultImagePath: string = '../../../../assets/images/elitecodo.png';

  userTypes = [
    { value: 'all', label: 'All Users', icon: 'team', count: 2500 },
    { value: 'admin', label: 'Administrators', icon: 'crown', count: 15 },
    { value: 'teacher', label: 'Teachers', icon: 'user', count: 180 },
    { value: 'student', label: 'Students', icon: 'solution', count: 2000 },
    { value: 'parent', label: 'Parents', icon: 'contacts', count: 305 }
  ];
  subjectPrefix: any;

  constructor(
    private fb: FormBuilder,
    private draftService: DraftService,
    private message: NzMessageService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.draftService.getDrafts().subscribe(drafts => {
      this.drafts = drafts;
    });
    this.loadMockUsers();
    this.loadCurrentUser();
    this.loadProfileImage();
  }

  private initializeForms() {
    this.broadcastForm = this.fb.group({
      notificationId: 0,
      userType: [[], Validators.required],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.individualForm = this.fb.group({
      notificationId: 0,
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  /**
   * Load profile image from sessionStorage
   */
  private loadProfileImage(): void {
    // Try to get super admin data from sessionStorage
    const superAdminDataStr = sessionStorage.getItem('superAdminData');
    
    if (superAdminDataStr) {
      try {
        const adminData = JSON.parse(superAdminDataStr);
        this.profileImage = adminData.profilePicture || 
                            adminData.profileImage || 
                            adminData.image || 
                            adminData.photo || 
                            '';
      } catch (e) {
        console.error('Error parsing super admin data:', e);
      }
    }
    
    // If not found, try individual keys
    if (!this.profileImage) {
      this.profileImage = sessionStorage.getItem('superAdminProfilePicture') || 
                          sessionStorage.getItem('profilePicture') || 
                          '';
    }
    
    // If still no profile image, use default
    if (!this.profileImage || this.profileImage.trim() === '') {
      this.profileImage = this.defaultImagePath;
    }
  }

  /**
   * Get profile image source with fallback
   */
  getProfileImageSource(): string {
    return this.profileImage || this.defaultImagePath;
  }

  private resetCurrentForm() {
    if (this._activeTab === 'broadcast') {
      this.broadcastForm.reset();
    } else if (this._activeTab === 'individual') {
      this.individualForm.reset();
    }
  }

  private loadCurrentUser() {
    // Simulate loading current user
    this.currentUser = {
      id: 0,
      name: 'Super Admin',
      role: 'Administrator',
      email: 'admin@school.com',
      lastActive: 'Now',
      status: 'Online'
    };
  }

  private loadMockUsers() {
    this.http.getRequest(`api/auth/rolesactivities`).subscribe((response: any) => {
      this.users = response;
      this.filteredUsers = [...this.users];
    }, err => {
      this.message.error('Please fill in required fields before saving draft');
    })
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  saveDraft(): void {
    const form = this.activeTab === 'broadcast' ? this.broadcastForm : this.individualForm;

    if (form.valid) {
      const draft: Partial<Draft> = {
        type: this.activeTab as 'broadcast' | 'individual',
        subject: form.get('subject')?.value,
        message: form.get('message')?.value,
        recipients: this.activeTab === 'broadcast'
          ? form.get('userType')?.value
          : this.selectedUsers
      };

      this.draftService.saveDraft(draft);
      form.reset();
      this.selectedUsers = [];
    } else {
      this.message.warning('Please fill in required fields before saving draft');
    }
  }

  loadDraft(draft: Draft): void {
    this.activeTab = draft.type;

    if (draft.type === 'broadcast') {
      this.broadcastForm.patchValue({
        subject: draft.subject,
        message: draft.message,
        userType: draft.recipients
      });
    } else {
      this.individualForm.patchValue({
        subject: draft.subject,
        message: draft.message
      });
      this.selectedUsers = draft.recipients || [];
    }

  }

  deleteDraft(id: string, event: Event): void {
    event.stopPropagation();
    this.draftService.deleteDraft(id);
  }

  getDraftsList(): Draft[] {
    return this.drafts.sort((a, b) => {
      const dateA = new Date(a.lastModified).getTime();
      const dateB = new Date(b.lastModified).getTime();
      return dateB - dateA;
    });
  }

  sendBroadcast() {
    let requestObj = {
      ...this.broadcastForm.value,
      senderId: Number(sessionStorage.getItem('superadminId'))
    }

    if (this.broadcastForm.valid) {
      console.log('Broadcast message:', requestObj);
      this.http.postRequest(`api/notification/broadcastsend`, requestObj).subscribe(
        (response) => {
          console.log({ response });
          this.message.success('Broadcast message sent successfully!');
          this.broadcastForm.reset();
        }, error => {
          this.message.error('Something Went Wrong!');
          console.log({ error });
        })
    } else {
      this.message.error('Please fill all the Fields!');
    }
  }

  sendIndividual() {
    if (this.individualForm.valid && this.selectedUsers.length > 0) {
      const messageData = {
        ...this.individualForm.value,
        recipients: this.selectedUsers.map(user => user.id),
        senderId: Number(sessionStorage.getItem('superadminId'))
      };

      console.log('Individual message:', messageData);
      this.http.postRequest(`api/notification/individualsend`, messageData).subscribe(
        (response) => {
          console.log({ response });
          this.message.success('Message sent successfully!');
          this.selectedUsers = [];
          this.individualForm.reset();
        }, error => {
          this.message.error('Something Went Wrong!');
          console.log({ error });
        })
    } else {
      this.message.error('Please fill all the Fields!');
    }
  }
}
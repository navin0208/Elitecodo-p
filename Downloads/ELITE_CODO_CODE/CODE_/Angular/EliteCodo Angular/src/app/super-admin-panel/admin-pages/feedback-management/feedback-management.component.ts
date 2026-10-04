// feedback-management.component.ts
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { fileUpload } from 'src/app/shared/allURL';

interface FeedbackItem {
  id: number;
  userId: number;
  userType: string;
  userName: string;
  userAvatar: string;
  message: string;
  date: Date;
  status: 'read' | 'unread';
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.component.html',
  styleUrls: ['./feedback-management.component.scss'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FeedbackManagementComponent implements OnInit {
  feedbacks: FeedbackItem[] = [];
  isReplyModalVisible = false;
  replyForm: FormGroup;
  selectedUser: any;
  searchText = '';
  activeTab = 'all';
  loading = true;
  attachments: File[] = [];
  attachmentFile: File | null = null;
  showFormByReplyOrNot = true;
  fileList: any;
  previewImage: string | undefined = '';
  previewVisible = false;
  fileName: string | undefined;
  serverImage: string | undefined;
  isLoading = false;
  attachmentPresent = true;
  filteredFeedbacks: FeedbackItem[] = [];
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private http: HttpmethodsService,
    private notificationService: NotificationService

  ) {
    this.replyForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      attachments: [[]]
    });
  }

  ngOnInit(): void {

    // this.feedbacks = [
    //   {
    //     id: 1,
    //     userId: 101,
    //     userType: 'Student',
    //     userName: 'John Doe',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    //     message: 'The new library system is very helpful! I especially like the new search feature.The new library system is very helpful! I especially like the new search feature.The new library system is very helpful! I especially like the new search feature.',
    //     date: new Date(),
    //     status: 'unread',
    //     priority: 'high'
    //   },
    //   {
    //     id: 2,
    //     userId: 102,
    //     userType: 'Teacher',
    //     userName: 'Sarah Smith',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    //     message: 'Could we get more resources for the science department?',
    //     date: new Date(Date.now() - 86400000),
    //     status: 'read',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 3,
    //     userId: 103,
    //     userType: 'Parent',
    //     userName: 'Michael Brown',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    //     message: 'It’s great to see a focus on student safety during school activities.',
    //     date: new Date(Date.now() - 2 * 86400000),
    //     status: 'read',
    //     priority: 'low'
    //   },
    //   {
    //     id: 4,
    //     userId: 104,
    //     userType: 'Student',
    //     userName: 'Emily Davis',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    //     message: 'Could you add more practice tests for upcoming exams?',
    //     date: new Date(),
    //     status: 'read',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 5,
    //     userId: 105,
    //     userType: 'Teacher',
    //     userName: 'David Wilson',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    //     message: 'The new attendance system is a bit confusing to use. Can we simplify it?',
    //     date: new Date(Date.now() - 3 * 86400000),
    //     status: 'read',
    //     priority: 'high'
    //   },
    //   {
    //     id: 6,
    //     userId: 106,
    //     userType: 'Parent',
    //     userName: 'Sophia Martinez',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    //     message: 'Thank you for organizing the parent-teacher meeting so efficiently.',
    //     date: new Date(Date.now() - 86400000),
    //     status: 'read',
    //     priority: 'low'
    //   },
    //   {
    //     id: 7,
    //     userId: 107,
    //     userType: 'Student',
    //     userName: 'Oliver Garcia',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    //     message: 'The cafeteria menu update is awesome! I love the new options.',
    //     date: new Date(Date.now() - 5 * 86400000),
    //     status: 'read',
    //     priority: 'low'
    //   },
    //   {
    //     id: 8,
    //     userId: 108,
    //     userType: 'Teacher',
    //     userName: 'Liam Rodriguez',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
    //     message: 'Can we introduce a training program for new teachers?',
    //     date: new Date(),
    //     status: 'read',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 9,
    //     userId: 109,
    //     userType: 'Student',
    //     userName: 'Charlotte Hernandez',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte',
    //     message: 'The library should have a longer open time for evening study.',
    //     date: new Date(Date.now() - 6 * 86400000),
    //     status: 'read',
    //     priority: 'high'
    //   },
    //   {
    //     id: 10,
    //     userId: 110,
    //     userType: 'Parent',
    //     userName: 'William Lee',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=William',
    //     message: 'The online fee payment system is very convenient. Thank you!',
    //     date: new Date(Date.now() - 7 * 86400000),
    //     status: 'read',
    //     priority: 'low'
    //   },
    //   {
    //     id: 11,
    //     userId: 111,
    //     userType: 'Teacher',
    //     userName: 'Amelia Walker',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia',
    //     message: 'I appreciate the new project management tool added recently.',
    //     date: new Date(Date.now() - 3 * 86400000),
    //     status: 'read',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 12,
    //     userId: 112,
    //     userType: 'Student',
    //     userName: 'Ethan Hall',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
    //     message: 'Could we have a coding club for students interested in programming?',
    //     date: new Date(Date.now() - 4 * 86400000),
    //     status: 'unread',
    //     priority: 'high'
    //   },
    //   {
    //     id: 13,
    //     userId: 113,
    //     userType: 'Parent',
    //     userName: 'Isabella Allen',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
    //     message: 'The recent sports event was wonderfully organized!',
    //     date: new Date(),
    //     status: 'read',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 14,
    //     userId: 114,
    //     userType: 'Teacher',
    //     userName: 'James Young',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    //     message: 'Could we discuss the curriculum updates in the next meeting?',
    //     date: new Date(Date.now() - 2 * 86400000),
    //     status: 'read',
    //     priority: 'high'
    //   },
    //   {
    //     id: 15,
    //     userId: 115,
    //     userType: 'Student',
    //     userName: 'Ava King',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
    //     message: 'The math tutorial videos are very helpful!',
    //     date: new Date(Date.now() - 86400000),
    //     status: 'unread',
    //     priority: 'medium'
    //   },
    //   {
    //     id: 16,
    //     userId: 116,
    //     userType: 'Parent',
    //     userName: 'Benjamin Scott',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin',
    //     message: 'Thank you for the detailed progress reports.',
    //     date: new Date(Date.now() - 5 * 86400000),
    //     status: 'read',
    //     priority: 'low'
    //   },
    //   {
    //     id: 17,
    //     userId: 117,
    //     userType: 'Teacher',
    //     userName: 'Mia Harris',
    //     userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    //     message: 'Could we get more resources for the arts department?',
    //     date: new Date(),
    //     status: 'unread',
    //     priority: 'medium'
    //   }
    // ];

    this.getData()
    this.loading = false;
  }

  getData() {
    this.http.getRequest(`api/reportstosuperadmin/getallreports`).subscribe(
      (response: any) => {
        this.feedbacks = response.filter((val: any) => val.userType == 'Teacher');
        this.filteredFeedbacks = this.feedbacks;
        console.log({ response });
      })
  }

  filterFeedback(status: string): void {
    // this.getData();
    this.activeTab = status;
    if (status === 'all') {
      this.filteredFeedbacks = this.feedbacks; // Show all feedback
    } else if (status === 'unread') {
      this.filteredFeedbacks = this.feedbacks.filter(f => f.status === 'unread');
    } else if (status === 'read') {
      this.filteredFeedbacks = this.feedbacks.filter(f => f.status === 'read');
    }
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  get unreadFeedbackCount(): number {
    return this.feedbacks.filter(f => f.status === 'unread').length;
  }
  get readFeedbackCount(): number {
    return this.feedbacks.filter(f => f.status === 'read').length;
  }

  get highPriorityFeedbackCount(): number {
    return this.feedbacks.filter(f => f.priority === 'high').length;
  }
  getPriorityColor(priority: string): string {
    const colors = {
      high: '#ff4d4f',
      medium: '#faad14',
      low: '#52c41a'
    } as { [key: string]: string };
    return colors[priority] || '#1890ff';
  }

  showReplyModal(feedback: any): void {
    this.attachmentPresent = true;
    this.http.getRequest(`api/reportstosuperadmin/getallreply/${feedback.reportsToSuperAdminId}`).subscribe(
      (response: any) => {
        this.selectedUser = response;
        this.isReplyModalVisible = true;

        if (response.reply === null) {
          this.showFormByReplyOrNot = false;
        } else {
          this.showFormByReplyOrNot = true;
        }

        this.removeAttachment();
      })
  }
  downloadAttachment() {
    // Implement download logic
    window.open(this.selectedUser.attachments, '_blank');
  }
  downloadAttachmentOfReply() {
    // Implement download logic
    if (this.selectedUser.reply.attachments.startsWith('https://zplusglobalmarketinsights.com/')) {
      console.log('the attachment is present');
      this.attachmentPresent = true;
      window.open(this.selectedUser.reply.attachments, '_blank');
    } else {
      this.attachmentPresent = false;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  openOriginalAttachment() {
    if (this.selectedUser.attachments) {
      window.open(this.selectedUser.attachments, '_blank');
    }
  }

  handleReply() {
    this.isLoading = true; // Start loader

    if (this.replyForm.valid) {
      const replyData = {
        ...this.replyForm.value,
        attachments: this.serverImage,
        reportsToSuperAdminId: this.selectedUser.reportsToSuperAdminId
      };
      this.http.postRequest('api/reportstosuperadmin/reply', replyData).subscribe(
        (res) => {
          console.log({ res });
          this.isLoading = false; // Start loader
          this.removeAttachment();
          this.cancelReply();
          this.http.getRequest(`api/reportstosuperadmin/readreport/${replyData.reportsToSuperAdminId}`).subscribe(
            (res) => {
              this.notificationService.showSuccess('Successfully sent the response', 'Success');
              this.getData();
              console.log({ res });
            }, error => {
              this.notificationService.showError('Something went wrong for status read..!!!', 'Failed');
            })
        }, error => {
          console.log({ error });
          this.isLoading = false; // Start loader
          this.notificationService.showError('Something went wrong..!!!', 'Failed');
        })
      // Here you would typically call a service to send the reply
      console.log('Reply Data:', replyData);

      // Close the modal
    } else {
      this.isLoading = false; // Start loader
      // Mark form as touched to show validation errors
      Object.values(this.replyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log({ file });
    const inputElement = event.target as HTMLInputElement;
    // const file = inputElement?.files?.[0]; // Access file directly from the event
    this.fileName = file?.name;
    this.isLoading = true; // Start loader
    const formData = new FormData();
    formData.append('uploadfile', file);
    if (file) {
      this.attachmentFile = file;
      this.http.postRequest(fileUpload, formData).subscribe(
        (data: any) => {
          this.isLoading = false;
          if (data.status === true) {
            this.serverImage = data.path;
            console.log('serverImage', this.serverImage);

            this.notificationService.showSuccess('Successfully uploaded File', 'Success');
            this.replyForm.setValue({
              attachments: data.path // Use the server-provided path
            });
          } else {
            this.notificationService.showError('Failed to upload File', 'Error');
          }
        },
        (error) => {
          this.isLoading = false;
          this.notificationService.showError('Something went wrong during the upload', 'Error');
        }
      );

      // this.replyForm.patchValue({
      //   attachment: file.name
      // });
    }
  }


  removeAttachment() {
    console.log('Removing attachment');

    this.attachmentFile = null;
    this.replyForm.patchValue({
      attachment: null
    });
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  cancelReply() {
    this.isReplyModalVisible = false;
    this.replyForm.reset();
    this.attachments = [];
  }

}
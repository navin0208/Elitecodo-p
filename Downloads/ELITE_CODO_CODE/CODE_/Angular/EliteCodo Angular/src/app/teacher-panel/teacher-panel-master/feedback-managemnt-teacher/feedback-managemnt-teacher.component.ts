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
  selector: 'app-feedback-managemnt-teacher',
  templateUrl: './feedback-managemnt-teacher.component.html',
  styleUrls: ['./feedback-managemnt-teacher.component.scss'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class FeedbackManagemntTeacherComponent implements OnInit {
  feedbacks: FeedbackItem[] = [];
  isReplyModalVisible = false;
  replyForm: FormGroup;
  searchText = '';
  activeTab = 'all';
  loading = true;
  attachments: File[] = [];

 selectedUser: any = {
  userAvatar: '',
  userName: 'Unknown User',
  userType: '',
  message: '',
  title: '',
  attachments: null,
  reply: null,
  date: new Date(),
  priority: 'medium'
};  



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
  unreadFeedbackCount: number = 0;
  readFeedbackCount: number = 0;
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    public http: HttpmethodsService,
    private notificationService: NotificationService
  ) {
    this.replyForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      attachments: [[]],
    });
  }

  ngOnInit(): void {


    this.getData();
    this.loading = false;
  }

  getData() {
    this.http
      .getRequest(
        `api/messages/getAllMsgPar/${sessionStorage.getItem(
          'teacherId'
        )}?role=teacher`
      )
      .subscribe(
        (response: any) => {
          this.feedbacks = response || []; // Ensure it's always an array
          this.filteredFeedbacks = [...this.feedbacks];
          this.unreadFeedbackCount = this.feedbacks.filter(f => f.status === 'unread').length;
          this.readFeedbackCount = this.feedbacks.filter(f => f.status === 'read').length;
        },
        (error) => {
          console.error('Error fetching feedback:', error);
          this.feedbacks = [];
          this.filteredFeedbacks = [];
          this.unreadFeedbackCount = 0;
          this.readFeedbackCount = 0;
        }
      );
  }

  filterFeedback(status: string): void {
    this.activeTab = status;
    if (status === 'all') {
      this.filteredFeedbacks = [...this.feedbacks];
    } else if (status === 'unread') {
      this.filteredFeedbacks = this.feedbacks.filter(f => f.status === 'unread');
    } else if (status === 'read') {
      this.filteredFeedbacks = this.feedbacks.filter(f => f.status === 'read');
    }
  }

  truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''; // Return empty string if text is null/undefined
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

  // get unreadFeedbackCount(): number {
  //   return this.feedbacks.filter((f) => f.status === 'unread').length;
  // }
  // get readFeedbackCount(): number {
  //   return this.feedbacks.filter((f) => f.status === 'read').length;
  // }

  get highPriorityFeedbackCount(): number {
    return this.feedbacks.filter((f) => f.priority === 'high').length;
  }

  getPriorityColor(priority: string): string {
    const colors = {
      high: '#ff4d4f',
      medium: '#faad14',
      low: '#52c41a',
    } as { [key: string]: string };
    return colors[priority] || '#1890ff';
  }

  recipientIds: any;
  senderId: any;
  replyToMessageId: any;

  showReplyModal(response: any): void {
    if (!response) {
      console.error('No feedback item provided');
      return;
    }

    this.selectedUser = { ...response }; // Create a copy


    this.attachmentPresent = true;
    this.isReplyModalVisible = true;

    // {
    //   "senderId": 0,
    //   "recipientIds": 0,
    //   "replyToMessageId": 0,
    //   "attachments": "string",
    //   "title": "string",
    //   "category": "string",
    //   "description": "string",
    //   "priority": "string",
    //   "type": "string",
    //   "status": "string",
    //   "role": "string"
    // }

    this.recipientIds = response.userId;
    this.senderId = response.recipientIds;
    this.replyToMessageId = response.id;

    // const replyData = {
    //   ...this.replyForm.value,

    //   recipientIds: response.senderId,
    //   senderId: response.recipientIds,
    //   replyToMessageId: response.id,
    //   type: 'reply',
    //   status: 'read',
    //   priority: 'medium',
    //   title: '',
    //   role: 'teacher',
    //   category: 'doubts',
    //   // senderId recipientIds
    //   // replyToMessageId id
    //   // type reply
    // };
    console.log('Unread messages:', this.feedbacks.filter(f => f.status === 'unread'));
    // console.log('replyData', replyData);

    if (response.reply === null) {
      this.showFormByReplyOrNot = false;
    } else {
      this.showFormByReplyOrNot = true;
    }

    this.removeAttachment();
    // this.http
    //   .getRequest(
    //     `api/reportstosuperadmin/getallreply/${feedback.reportsToSuperAdminId}`
    //   )
    //   .subscribe((response: any) => {
    //   });
  }
  downloadAttachment() {
    // Implement download logic
    window.open(this.selectedUser.attachments, '_blank');
  }
  downloadAttachmentOfReply() {
    // Implement download logic
    if (
      this.selectedUser.reply.attachments.startsWith(
        'https://zplusglobalmarketinsights.com/'
      )
    ) {
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
      minute: '2-digit',
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
      // const replyData = {
      //   ...this.replyForm.value,
      //   attachments: this.serverImage,
      //   reportsToSuperAdminId: this.selectedUser.reportsToSuperAdminId,
      //   // senderId recipientIds
      //   // replyToMessageId id
      //   // type reply
      // };
      // console.log({ replyData });

      // this.recipientIds = response.senderId;
      // this.senderId = response.recipientIds;
      // this.replyToMessageId = response.id;

      // this.recipientIds = response.userId;
      // this.senderId = response.recipientIds;
      // this.replyToMessageId = response.id;

      const replyData = {
        ...this.replyForm.value,
        attachments: this.serverImage,
        recipientIds: this.recipientIds,
        senderId: this.senderId,
        replyToMessageId: this.replyToMessageId,
        type: 'reply',
        status: 'read',
        priority: 'medium',
        title: '',
        role: 'teacher',
        category: 'doubts',
        // senderId recipientIds
        // replyToMessageId id
        // type reply
      };

      // const replyData = {
      //   ...this.replyForm.value,
      // }

      this.http.postRequest('api/messages/sendMessage', replyData).subscribe(
        (res) => {
          console.log({ res });
          this.isLoading = false;
          this.removeAttachment();
          this.cancelReply();
          this.getData();
          // this.http
          //   .getRequest(
          //     `api/reportstosuperadmin/readreport/${replyData.reportsToSuperAdminId}`
          //   )
          //   .subscribe(
          //     (res) => {
          //       this.notificationService.showSuccess(
          //         'Successfully sent the response',
          //         'Success'
          //       );
          //       this.getData();
          //       console.log({ res });
          //     },
          //     (error) => {
          //       this.notificationService.showError(
          //         'Something went wrong for status read..!!!',
          //         'Failed'
          //       );
          //     }
          //   );
        },
        (error) => {
          console.log({ error });
          this.isLoading = false; // Start loader
          this.notificationService.showError(
            'Something went wrong..!!!',
            'Failed'
          );
        }
      );
      // Here you would typically call a service to send the reply
      console.log('Reply Data:', replyData);

      // Close the modal
    } else {
      this.isLoading = false; // Start loader
      // Mark form as touched to show validation errors
      Object.values(this.replyForm.controls).forEach((control) => {
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

            this.notificationService.showSuccess(
              'Successfully uploaded File',
              'Success'
            );
            this.replyForm.setValue({
              attachments: data.path, // Use the server-provided path
            });
          } else {
            this.notificationService.showError(
              'Failed to upload File',
              'Error'
            );
          }
        },
        (error) => {
          this.isLoading = false;
          this.notificationService.showError(
            'Something went wrong during the upload',
            'Error'
          );
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
      attachment: null,
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

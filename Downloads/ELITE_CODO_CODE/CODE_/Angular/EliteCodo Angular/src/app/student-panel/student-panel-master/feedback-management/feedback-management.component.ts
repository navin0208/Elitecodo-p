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
  title: string;
  date: Date;
  status: 'read' | 'unread';
  priority: 'high' | 'medium' | 'low';
  attachments?: string | null;
  reply?: {
    replyToMessageId: number | null;
    recipientIds: number;
    id: number | null;
    userId: number;
    userType: string;
    userName: string;
    message: string;
    title: string;
    date: Date;
    status: 'read' | 'unread';
    priority: 'high' | 'medium' | 'low';
    attachments: string | null;
    reply: any | null;
  } | null;
  replyToMessageId?: number | null;
  recipientIds?: number;
}
@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.component.html',
  styleUrls: ['./feedback-management.component.scss'],
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
      attachments: [[]],
    });
  }

  ngOnInit(): void {
    this.getData();
    this.loading = false;
  }
  searchFeedback(): void {
    if (this.searchText) {
      this.filteredFeedbacks = this.feedbacks.filter(feedback =>
        feedback.message.toLowerCase().includes(this.searchText.toLowerCase()) ||
        feedback.userName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        feedback.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredFeedbacks = this.feedbacks; // If search text is empty, show all feedback
    }
  }
  getData() {
    this.http
      .getRequest(
        `api/messages/getAllMsgPar/${sessionStorage.getItem(
          'studentId'
        )}?role=student`
      )
      .subscribe(
        (response: any) => {
          this.feedbacks = response;
          this.filteredFeedbacks = [...this.feedbacks];
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          // Handle error
        }
      );
  }

  filterFeedback(status: string): void {
    this.activeTab = status;

    if (status === 'all') {
      this.filteredFeedbacks = [...this.feedbacks];
    } else {
      this.filteredFeedbacks = this.feedbacks.filter(feedback => {
        // Check the feedback status
        if (feedback.status === status) return true;

        // Check reply status if reply exists
        if (feedback.reply && feedback.reply.status === status) return true;

        return false;
      });
    }

    // Apply search filter if there's search text
    if (this.searchText) {
      this.searchFeedback();
    }
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  get unreadFeedbackCount(): number {
    return this.feedbacks.filter(f =>
      f.status === 'unread' ||
      (f.reply && f.reply.status === 'unread')
    ).length;
  }

  get readFeedbackCount(): number {
    return this.feedbacks.filter(f =>
      f.status === 'read' ||
      (f.reply && f.reply.status === 'read')
    ).length;
  }

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

  showReplyModal(response: any): void {
    this.attachmentPresent = true;
    this.selectedUser = response;
    this.isReplyModalVisible = true;

    // this.http
    //   .getRequest(
    //     `api/reportstosuperadmin/getallstudentreply/${feedback.reportsToSuperAdminId}`
    //   )
    //   .subscribe((response: any) => {
    //     this.selectedUser = response;
    //     this.isReplyModalVisible = true;

    //     if (response.reply === null) {
    //       this.showFormByReplyOrNot = false;
    //     } else {
    //       this.showFormByReplyOrNot = true;
    //     }

    //     this.removeAttachment();
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
      const replyData = {
        ...this.replyForm.value,
        attachments: this.serverImage,
        reportsToSuperAdminId: this.selectedUser.reportsToSuperAdminId,
      };
      this.http
        .postRequest('api/reportstosuperadmin/replytostudent', replyData)
        .subscribe(
          (res) => {
            console.log({ res });
            this.isLoading = false; // Start loader
            this.removeAttachment();
            this.cancelReply();
            this.http
              .getRequest(
                `api/reportstosuperadmin/readstudentreport/${replyData.reportsToSuperAdminId}`
              )
              .subscribe(
                (res) => {
                  this.notificationService.showSuccess(
                    'Successfully sent the response',
                    'Success'
                  );
                  this.getData();
                  console.log({ res });
                },
                (error) => {
                  this.notificationService.showError(
                    'Something went wrong for status read..!!!',
                    'Failed'
                  );
                }
              );
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

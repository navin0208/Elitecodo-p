// teacher-feedback.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import {
  ChangePasswordBySuperAdminOfStudent,
  create_student,
  delete_student,
  fileUpload,
  getActive_exam,
  getActive_subject,
  getAll_student,
  getAll_teacher,
  getAllActive_standard,
  getById_student,
  update_student,
} from 'src/app/shared/allURL';
// Interfaces
interface Teacher {
  id: number;
  name: string;
  subject: string;
  avatar: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Feedback {
  id: number;
  userId?: number;
  teacherId: number;
  teacherName: string;
  teacherAvatar: string;
  subject: string;
  message: string;
  date: string;
  time: string;
  status: 'pending' | 'responded';
  response?: string;
  responseDate?: string;
  attachments?: string[];
}
interface FeedbackRes {
  id: number;
  userId: number;
  userType: string;
  userName: string;
  message: string;
  title: string;
  date: string;
  status: string;
  priority: string;
  attachments?: string;
  reply?: FeedbackRes;
}
@Component({
  selector: 'app-teacher-feedback',
  templateUrl: './teacher-feedback.component.html',
  styleUrls: ['./teacher-feedback.component.scss'],
})
export class TeacherFeedbackComponent implements OnInit {
  // Form and Modal
  feedbackForm!: FormGroup;
  feedbacks: FeedbackRes[] = []; // Initialize as empty array
  uploadInProgress = false;
  isModalVisible = false;
  fileList: NzUploadFile[] = [];
  http = inject(HttpmethodsService);
  notificationService = inject(NotificationService);
  // Filters
  // Component class variables
  isLoading = false;
  // Add these properties to your component class
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;
  paginatedFeedbacks: FeedbackRes[] = [];

  selectedTeacher: number | null = null;
  selectedSubject: number | null = null;
  selectedStatus: string = 'all';
  dateRange: Date[] = [];

  // Statistics
  totalFeedbacks: number = 0;
  responseRate: string = '0%';

  isPending: boolean = false;

  // Mock Data
  teachers: Teacher[] = [
    {
      id: 1,
      name: 'John Smith',
      subject: 'Mathematics',
      avatar: 'assets/avatars/teacher1.jpg',
    },
    {
      id: 2,
      name: 'Emily Johnson',
      subject: 'Science',
      avatar: 'assets/avatars/teacher2.jpg',
    },
    {
      id: 3,
      name: 'Michael Brown',
      subject: 'English',
      avatar: 'assets/avatars/teacher3.jpg',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      subject: 'History',
      avatar: 'assets/avatars/teacher4.jpg',
    },
  ];

  subjects: Subject[] = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    { id: 4, name: 'History' },
  ];
  sessionStorageObj: any;
  constructor(private fb: FormBuilder, private message: NzMessageService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadFeedbacks();
    this.calculateStatistics();
    this.getData();


    this.sessionStorageObj = {
      adminprofilePicture: sessionStorage.getItem('adminprofilePicture'),
      adminlogoImage: sessionStorage.getItem('adminlogoImage'),
      adminwatermarkImage: sessionStorage.getItem('adminwatermarkImage'),
      userFullName: sessionStorage.getItem('userFullName'),
      className: sessionStorage.getItem('className'),
    }
  }

  // Initialize feedback form
  private initForm(): void {
    this.feedbackForm = this.fb.group({
      // subject: [null, [Validators.required]],
      title: [null, [Validators.required]],
      description: [null, [Validators.required, Validators.minLength(10)]],
      attachments: [null],
    });
  }

  // Modal Methods
  showNewFeedbackModal(): void {
    this.isModalVisible = true;
    this.feedbackForm.reset();
    this.fileList = [];
  }

  handleModalCancel(): void {
    this.isModalVisible = false;
  }

  handleModalOk(): void {
    // if (this.feedbackForm.valid) {
    let messagesObj = {
      ...this.feedbackForm.value,
      senderId: Number(sessionStorage.getItem('parentId')),
      category: 'doubts',
      priority: 'medium',
      type: 'message',
      status: 'unread',
      role: 'parent',
      replyToMessageId: null,
      recipientIds: null,
    };
    console.log('messagesObj', messagesObj);

    // API Call (Uncomment when needed)
    this.http.postRequest(`api/messages/sendMessage`, messagesObj).subscribe({
      next: (response) => {
        // console.log(response);
        this.handleModalCancel()
        this.getData()
      },
      error: (err) => {
        console.log('Error in subscription:', err);
      },
    });

    // const formData = this.feedbackForm.value;
    // this.submitFeedback();
    // } else {
    //   Object.values(this.feedbackForm.controls).forEach((control) => {
    //     if (control.invalid) {
    //       control.markAsTouched();
    //       control.updateValueAndValidity({ onlySelf: true });
    //     }
    //   });
    // }
  }
  getData() {
    this.http
      .getRequest(
        `api/messages/getAllMsgPar/${sessionStorage.getItem('parentId')}?role=parent`
      )
      .subscribe({
        next: (response: any) => {
          console.log({ getData: response });

          // Store the original data
          this.feedbacks = response;
          this.totalItems = response.length;
          this.currentPage = 1; // Reset to first page when new data loads
          // Calculate statistics after getting the data
          this.totalFeedbacks = response.length; // Total messages

          // Calculate replied messages (where reply is not null)
          const repliedMessages = response.filter((msg: any) => msg.reply !== null).length;

          // Calculate Response Rate with zero-division guard
          this.responseRate = this.totalFeedbacks > 0
            ? ((repliedMessages / this.totalFeedbacks) * 100).toFixed(2) + '%'
            : '0%';

          console.log({
            totalFeedbacks: this.totalFeedbacks,
            responseRate: this.responseRate
          });

          // Set loading state to false
          this.isPending = false;
        },
        error: (error) => {
          console.error('Error fetching feedback data:', error);
          this.isPending = false;
          this.notificationService.showError('Failed to load messages', 'Error');
        }
      });
  }

  // Feedback Submission
  submitFeedback() {
    // Simulate API call
    let messagesObj = {
      ...this.feedbackForm,
      senderId: Number(sessionStorage.getItem('parentId')),
      category: 'doubts',
      priority: 'medium',
      type: 'message',
      status: 'unread',
      role: 'parent',
      replyToMessageId: null,
      recipientIds: null,
    };
    console.log('messagesObj', messagesObj);

    // this.isPending = true;
    // setTimeout(() => {
    //   const newFeedback: Feedback = {
    //     id: this.feedbacks.length + 1,
    //     teacherId: data.teacherId,
    //     teacherName:
    //       this.teachers.find((t) => t.id === data.teacherId)?.name || '',
    //     teacherAvatar:
    //       this.teachers.find((t) => t.id === data.teacherId)?.avatar || '',
    //     subject: this.subjects.find((s) => s.id === data.subject)?.name || '',
    //     message: data.message,
    //     date: new Date().toISOString().split('T')[0],
    //     time: new Date().toLocaleTimeString(),
    //     status: 'pending',
    //   };

    //   this.feedbacks.unshift(newFeedback);
    //   this.calculateStatistics();
    //   this.isModalVisible = false;
    //   this.isPending = false;
    //   this.message.success('Feedback sent successfully');
    // }, 1000);
  }

  // Utility Methods
  getFeedbackColor(status: string): 'red' | 'blue' | 'green' | 'grey' | 'gray' {
    return status === 'read' ? 'green' : 'blue';
  }

  getStatusColor(status: string): string {
    return (
      {
        unread: 'processing',
        read: 'success',
      }[status] || 'default'
    );
  }

  // Action Methods
  viewDetails(feedback: Feedback): void {
    console.log('Viewing feedback:', feedback);
  }

  sendReminder(feedback: FeedbackRes): void {
    this.message.success(`Reminder sent to ${feedback.userName}`);
  }

  // Data Loading and Processing
  loadFeedbacks(): void {
    console.log('selectedStatus', this.selectedStatus);

    // Simulate API call
    this.isPending = true;
    this.calculateStatistics();

  }
  getFilteredFeedbacks(): FeedbackRes[] {
    if (!this.feedbacks) {
      return [];
    }

    let filtered = this.feedbacks;

    if (this.selectedStatus !== 'all') {
      filtered = this.feedbacks.filter(feedback => feedback.status === this.selectedStatus);
    }

    // Update total items count
    this.totalItems = filtered.length;

    // Calculate paginated results
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedFeedbacks = filtered.slice(startIndex, startIndex + this.pageSize);

    return this.paginatedFeedbacks;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // No need to call getFilteredFeedbacks() here since it will be called by the template
  }
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // Reset to first page when changing page size
    // No need to call getFilteredFeedbacks() here since it will be called by the template
  }
  private calculateStatistics(): void {
    // this.totalFeedbacks = this.feedbacks.length;
  }

  // Filter Change Handlers
  onTeacherChange(): void {
    this.loadFeedbacks();
  }

  onSubjectChange(): void {
    this.loadFeedbacks();
  }

  onStatusChange(): void {
    // No need to reload feedbacks, just let the template re-render
    // with the new filtered results from getFilteredFeedbacks()
    console.log('Status changed to:', this.selectedStatus);
  }


  onDateRangeChange(): void {
    this.loadFeedbacks();
  }

  // File Upload Handlers
  // handleFileUpload(file: NzUploadFile): boolean {
  //   const isValidFile = this.validateFile(file);
  //   if (!isValidFile) {
  //     this.message.error(
  //       'Please upload valid file types only (PDF, DOC, DOCX, JPG, PNG)'
  //     );
  //   }
  //   return isValidFile;
  // }
  filetoUpload: any;

  // To upload images
  handleFileUpload(e: any) {
    this.isLoading = true; // This will trigger the loader
    console.log('Event Object:', e);
    const file = e.file;
    if (file.status === 'uploading' || this.uploadInProgress) {
      this.isLoading = false; // Reset if we're not proceeding
      return;
    }
    this.uploadInProgress = true;

    this.filetoUpload = e.file?.originFileObj || e.fileList[0]?.originFileObj;
    console.log('File to Upload:', this.filetoUpload);

    if (!this.filetoUpload) {
      console.error('No file to upload');
      this.isLoading = false;
      return;
    }
    if (file.originFileObj) {
      this.http.fileUpload(fileUpload, this.filetoUpload).subscribe({
        next: (response: any) => {
          if (response.status == true) {
            this.notificationService.showSuccess(
              'Successfully Load file',
              'Success'
            );
            this.feedbackForm.patchValue({
              attachments: response.path,
            });
          } else {
            this.notificationService.showError(
              'Something went wrong !!!',
              'Error'
            );
          }
        },
        error: () => {
          this.message.error(`Failed to upload ${file.name}`);
          file.status = 'error';
          this.isLoading = false;
        },
        complete: () => {
          this.uploadInProgress = false;
          this.isLoading = false;
        },
      });
    }
  }

  private validateFile(file: NzUploadFile): boolean {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'image/jpeg',
      'image/png',
    ];
    return validTypes.includes(file.type || '');
  }
}

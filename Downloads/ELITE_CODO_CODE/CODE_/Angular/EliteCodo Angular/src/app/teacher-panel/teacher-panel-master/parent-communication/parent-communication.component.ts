import { Component, inject, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { fileUpload } from 'src/app/shared/allURL';


interface Student {
  id: string;
  name: string;
  class: string;
  parentEmail: string;
}

interface Notification {
  id?: string;
  type: 'general' | 'report' | 'student-specific';
  title: string;
  uploadedFile?: '',
  content: string;
  students?: string[]; // Student IDs for specific notifications
  reportType?: string;
  toRole?: string;
}

@Component({
  selector: 'app-parent-communication',
  templateUrl: './parent-communication.component.html',
  styleUrls: ['./parent-communication.component.scss']
})
export class ParentCommunicationComponent implements OnInit {
  GeneralImg: any
  StudentImg: any
  fileList: NzUploadFile[] = [];
  uploadInProgress = false;
  generalNotificationforAll = {
    title: '',
    content: '',
    uploadedFile: ''
  };
  generalNotificationforSigle = {
    selectedStudents: [] as string[], // Array to store selected student IDs
    reportType: '',
    title: '',
    content: '',
    uploadedFile: '',
  }
  studentsData: any[] = []; // This should contain student objects with id and name properties
  filteredStudents: any;
  http = inject(HttpmethodsService)
  // Notification properties


  selectedStudent: string | null = null;
  reportType: 'monthly' | 'quarterly' | 'yearly' | null = null;
  uploadedFile: File | null = null;

  // Notifications history
  notifications: Notification[] = [];

  constructor(private message: NzMessageService) { }

  ngOnInit() {
    this.getAllStudent();
    this.getAllParentCommunication();
  }

  getAllStudent() {
    this.http.getRequest(`api/auth/getAllStudentByTeachId/${sessionStorage.getItem('teacherId')}`).subscribe((res: any) => {
      console.log({ res });
      this.studentsData = res;
      this.filteredStudents = res; // Initialize filteredStudents with all students
    });
  }

  onSearch(searchText: string) {
    const searchTextLower = searchText.toLowerCase(); // Convert search text to lowercase once
    this.filteredStudents = this.studentsData.filter((student: any) =>
      (student.firstName.toLowerCase() + ' ' + student.lastName.toLowerCase()).includes(searchTextLower) ||
      student.email.toLowerCase().includes(searchTextLower)
    );
  }

  // Handle file upload
  handleFileUpload(event: NzUploadChangeParam, session: any): void {
    const file = event.file;

    if (file.status === 'uploading' || this.uploadInProgress) {
      return; // Prevent multiple API calls
    }

    this.uploadInProgress = true;

    if (file.originFileObj) {
      const formData = new FormData();
      formData.append('uploadfile', file.originFileObj);

      this.http.postRequest(fileUpload, formData).subscribe({
        next: (response: any) => {
          this.message.success(`${file.name} uploaded successfully`);
          file.status = 'done'; // Mark upload as completed
          if (session == 'General') {
            this.GeneralImg = response.path;
          } else if (session == 'Student') {
            this.StudentImg = response.path;
          }
          file.url = response.path; // Assuming API returns file URL
        },
        error: () => {
          this.message.error(`Failed to upload ${file.name}`);
          file.status = 'error';
        },
        complete: () => {
          this.uploadInProgress = false;
        }
      });
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const acceptedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!acceptedTypes.includes(fileExtension)) {
      this.message.error('You can only upload PDF or Word documents!');
      return false;
    }

    this.fileList = [file]; // Replace the file list to allow only one file at a time
    return false; // Prevent default upload behavior
  };

  // Send general notification to all parents
  sendGeneralNotification() {
    if (!this.generalNotificationforAll.title || !this.generalNotificationforAll.content) {
      this.message.error('Please fill in all fields');
      return;
    }

    const notification: Notification = {
      id: String(sessionStorage.getItem('teacherId')),
      type: 'general',
      uploadedFile: this.GeneralImg,
      title: this.generalNotificationforAll.title,
      content: this.generalNotificationforAll.content,
      toRole: 'parent'
    };
    this.http.postRequest('api/notification/addNotification', notification).subscribe((response) => {
      console.log({ response });
      this.getAllParentCommunication();
    }, err => {
      console.log({ err });
    })
    console.log({ sendGeneralNotification: notification });

    this.notifications.push(notification);
    this.message.success('General notification sent to all parents');

    // Reset form
    this.generalNotificationforAll.title = '';
    this.generalNotificationforAll.content = '';
  }
  getAllParentCommunication() {
    this.http
      .getRequest(
        `api/notification/all/parent/${sessionStorage.getItem('teacherId')}`
      )
      .subscribe((response: any) => {
        console.log({ getData: response });

        // this.feedbacks = response.filter((val: any) => val.userType == 'Teacher');
        this.notifications = response;
        // this.filteredFeedbacks = this.feedbacks;
        console.log({ response });
      });
  }
  // Send report to specific student's parent
  sendStudentReport() {
    if (!this.generalNotificationforSigle.selectedStudents || !this.generalNotificationforSigle.reportType) {
      this.message.error('Please select all fields and upload a report');
      return;
    }

    const selectedStudents = this.studentsData.filter((s: { id: string }) =>
      this.generalNotificationforSigle.selectedStudents.includes(s.id)
    );

    if (selectedStudents.length === 0) return;

    const notification: Notification = {
      id: String(sessionStorage.getItem('teacherId')),
      type: 'report',
      uploadedFile: this.StudentImg,
      title: this.generalNotificationforSigle.title,
      content: this.generalNotificationforSigle.content,
      students: this.generalNotificationforSigle.selectedStudents, // Array of selected student IDs
      reportType: this.generalNotificationforSigle.reportType,
      toRole: 'parent'
    };

    this.http.postRequest('api/notification/addNotification', notification).subscribe((response) => {
      console.log({ response });
      this.getAllParentCommunication();

    }, err => {
      console.log({ err });
    })

    console.log({ sendStudentReport: notification });

    // this.notifications.push(notification);
    this.message.success(`Report sent to parents of ${selectedStudents.map((s: { name: any; }) => s.name).join(', ')}`);

    // Reset form
    this.generalNotificationforSigle.selectedStudents = [];
    this.generalNotificationforSigle.reportType = '';
    this.generalNotificationforSigle.title = '';
    this.generalNotificationforSigle.content = '';
    this.uploadedFile = null;
  }

  // Get student names from IDs
  // Alternative approach if you can't load all students
  getStudentNames(studentEmails: string[], maxToShow = 3): string {
    if (studentEmails.length <= maxToShow) {
      return studentEmails.join(', ');
    }
    return `${studentEmails.slice(0, maxToShow).join(', ')} and ${studentEmails.length - maxToShow} more`;
  }

  // Resend a previous notification
  resendNotification(notification: Notification) {
    this.message.success(`Notification "${notification.title}" resent`);
    // In a real app, you would implement the actual resend logic
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface Notification {
  id?: string;
  type: 'general' | 'report' | 'student-specific';
  title: string;
  uploadedFile?: string;
  content: string;
  students?: string[]; // Student IDs for specific notifications
  reportType?: string;
  date?: Date; // Add date property for sorting and display
  isRead?: boolean; // Add read status property
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  http = inject(HttpmethodsService);

  // Filter properties
  activeFilter: 'all' | 'general' | 'report' = 'all';
  searchTerm: string = '';

  // Notifications
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  // Student data
  studentsData: any[] = [];

  constructor(private message: NzMessageService) { }

  ngOnInit() {
    this.getAllStudent();
    this.getNotifications();
  }

  getAllStudent() {
    this.http.getRequest('api/auth/allstudents').subscribe((res: any) => {
      this.studentsData = res;
    });
  }

  getNotifications() {
    // In a real implementation, get this from an API
    // For now, we'll use mock data
    this.notifications = [
      {
        id: '1',
        type: 'general',
        title: 'School Closure - Teacher Professional Development',
        content: 'Please note that the school will be closed on Friday, March 1st for teacher professional development. Classes will resume on Monday, March 4th.',
        date: new Date(2025, 1, 20),
        isRead: false
      },
      {
        id: '2',
        type: 'report',
        title: 'Quarterly Performance Report',
        content: 'The quarterly performance report for your child is now available. Please review the attached document and contact the teacher with any questions.',
        reportType: 'quarterly',
        students: ['1', '2'],
        uploadedFile: 'quarterly_report.pdf',
        date: new Date(2025, 1, 15),
        isRead: true
      },
      {
        id: '3',
        type: 'general',
        title: 'Upcoming Science Fair',
        content: 'We are excited to announce our annual Science Fair will be held on April 15th. Students should start preparing their projects now. Guidelines are attached.',
        uploadedFile: 'science_fair_guidelines.pdf',
        date: new Date(2025, 1, 10),
        isRead: false
      },
      {
        id: '4',
        type: 'report',
        title: 'Monthly Progress Update',
        content: 'This monthly report provides an overview of your child\'s academic progress, behavior, and participation in class activities during February.',
        reportType: 'monthly',
        students: ['3'],
        uploadedFile: 'monthly_report.pdf',
        date: new Date(2025, 1, 28),
        isRead: false
      }
    ];

    this.filterNotifications();
  }

  filterNotifications() {
    // Filter by type first
    let filtered = this.notifications;
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === this.activeFilter);
    }

    // Then filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(term) ||
        notification.content.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => {
      if (a.date && b.date) {
        return b.date.getTime() - a.date.getTime();
      }
      return 0;
    });

    this.filteredNotifications = filtered;
  }

  getStudentName(studentId: string): string {
    const student = this.studentsData.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  }

  markAsRead(notification: Notification) {
    notification.isRead = true;
    // In a real app, send update to backend
    this.message.success('Notification marked as read');
  }

  getFormattedDate(): string {
    // Placeholder for date formatting - in real app, use the actual notification date
    return 'Feb 20, 2025';
  }

  downloadAttachment(notification: Notification) {
    // In a real app, this would trigger a download
    this.message.info(`Downloading ${notification.uploadedFile}`);
  }

  viewNotificationDetails(notification: Notification) {
    // In a real app, this would open a modal or navigate to details page
    this.message.info(`Viewing details for ${notification.title}`);
  }
}
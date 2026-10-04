import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface Student {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  date: Date;
  type: 'general' | 'report';
  read: boolean;
  uploadedFile?: string;
  reportType?: string;
  students?: string[];
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  http = inject(HttpmethodsService)
  // Notifications
  allNotifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  // Filter settings
  activeFilter: 'all' | 'general' | 'report' = 'all';
  searchTerm = '';
  searchFocused = false;

  // View settings
  viewMode: 'card' | 'list' = 'card';

  // Sort settings
  currentSort = { field: 'date', direction: 'desc' as 'asc' | 'desc' };

  // Student data
  students: Student[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadStudents();
  }

  /**
   * Load notifications from the backend
   */
  loadNotifications(): void {
    // In a real app, you would fetch from an API
    this.allNotifications = [
      {
        id: '1',
        title: 'New School Schedule',
        content: 'The school schedule for the upcoming semester has been updated. Please check the portal for details.',
        date: new Date('2025-02-15'),
        type: 'general',
        read: false
      },
      {
        id: '2',
        title: 'Parent-Teacher Conference',
        content: 'Parent-teacher conferences will be held on March 15th. Please schedule your appointment through the portal.',
        date: new Date('2025-02-10'),
        type: 'general',
        read: true
      },
      {
        id: '3',
        title: 'Progress Report Available',
        content: 'The quarterly progress report for your student is now available for review.',
        date: new Date('2025-02-20'),
        type: 'report',
        read: false,
        reportType: 'Progress',
        students: ['S1001'],
        uploadedFile: 'progress_report_Q1_2025.pdf'
      },
      {
        id: '4',
        title: 'Assignment Feedback',
        content: 'Feedback for the recent science project has been posted.',
        date: new Date('2025-02-05'),
        type: 'report',
        read: true,
        reportType: 'Assignment',
        students: ['S1001', 'S1002']
      },
      {
        id: '5',
        title: 'Absence Notice',
        content: 'This is to notify you that your student was marked absent on February 18th.',
        date: new Date('2025-02-18'),
        type: 'report',
        read: false,
        reportType: 'Attendance',
        students: ['S1002']
      }
    ];

    this.filterNotifications();
  }

  /**
   * Load student data
   */
  loadStudents(): void {
    // In a real app, you would fetch from an API
    this.students = [
      { id: 'S1001', name: 'Alex Johnson' },
      { id: 'S1002', name: 'Maya Williams' }
    ];
  }

  /**
   * Get student name by ID
   */
  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  }

  /**
   * Get student initials for avatar
   */
  getStudentInitials(studentId: string): string {
    const name = this.getStudentName(studentId);
    return name.split(' ').map(n => n[0]).join('');
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Set active filter and apply filtering
   */
  setActiveFilter(filter: 'all' | 'general' | 'report'): void {
    this.activeFilter = filter;
    this.filterNotifications();
  }

  /**
   * Filter notifications based on active filter and search term
   */
  filterNotifications(): void {
    let result = [...this.allNotifications];

    // Apply type filter
    if (this.activeFilter !== 'all') {
      result = result.filter(notification => notification.type === this.activeFilter);
    }

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const search = this.searchTerm.toLowerCase();
      result = result.filter(notification =>
        notification.title.toLowerCase().includes(search) ||
        notification.content.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    this.applySorting(result);

    this.filteredNotifications = result;
  }

  /**
   * Apply sorting to notifications
   */
  applySorting(notifications: Notification[]): void {
    notifications.sort((a, b) => {
      if (this.currentSort.field === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return this.currentSort.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (this.currentSort.field === 'title') {
        return this.currentSort.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (this.currentSort.field === 'unread') {
        // Unread first sorting
        return a.read === b.read ? 0 : a.read ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Sort notifications by field and direction
   */
  sortBy(field: 'date' | 'title' | 'unread', direction: 'asc' | 'desc' = 'asc'): void {
    this.currentSort = { field, direction };
    this.filterNotifications();
  }

  /**
   * Get the count of unread notifications
   */
  getUnreadCount(): number {
    return this.allNotifications.filter(notification => !notification.read).length;
  }

  /**
   * Get the count of notifications by type
   */
  getCountByType(type: 'general' | 'report'): number {
    return this.allNotifications.filter(notification => notification.type === type).length;
  }

  /**
   * Calculate position of tab indicator
   */
  getIndicatorPosition(): number {
    switch (this.activeFilter) {
      case 'all': return 0;
      case 'general': return 33.33;
      case 'report': return 66.66;
      default: return 0;
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.allNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.filterNotifications();
  }
}
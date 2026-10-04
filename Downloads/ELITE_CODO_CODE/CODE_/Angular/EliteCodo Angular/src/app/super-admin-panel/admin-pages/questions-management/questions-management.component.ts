import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { getallactiveteachers_teacher, getallteachers } from 'src/app/shared/allURL';

@Component({
  selector: 'app-questions-management',
  templateUrl: './questions-management.component.html',
  styleUrls: ['./questions-management.component.scss', '../../../../assets/css/loading.css']
})
export class QuestionsManagementComponent implements OnInit {
  Math = Math;
  http = inject(HttpmethodsService);
  notificationService = inject(NotificationService)
  router = inject(Router)
  allTeachers: any[] = []; // Initialize as an empty array
  displayedTeachers: any[] = []; // Teachers to display on the current page
  errorMsg: boolean = false;
  // Filters
  filteredTeachers: any[] = [];

  filters = {
    name: '',
    email: '',
    status: '',
    questionCount: '',
    mobile: ''
  };

  loading: boolean = false; // Loading state

  noTeachers!: boolean;
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;

  get paginatedQuestions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allTeachers.slice(startIndex, endIndex);
  }
  constructor() { }

  ngOnInit(): void {
    this.getActiveTeacher();
  }

  getActiveTeacher() {
    this.loading = true; // Start loading
    this.http.getRequest(getallteachers).subscribe(
      (res: any) => {
        console.log({ getallactiveteachers_teacher: res });
        this.allTeachers = res;
        this.filteredTeachers = [...this.allTeachers];
        this.noTeachers = this.allTeachers.length === 0;

        this.errorMsg = false;
        this.loading = false; // Data loaded
      },
      (error) => {
        this.errorMsg = true;
        this.loading = false; // Error occurred, stop loading
      }
    );
  }
  applyFilters(): void {
    this.filteredTeachers = this.allTeachers.filter(teacher => {
      const nameMatch = teacher.firstName.toLowerCase().includes(this.filters.name.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(this.filters.name.toLowerCase());
      const emailMatch = teacher.email.toLowerCase().includes(this.filters.email.toLowerCase());
      const statusMatch = !this.filters.status || teacher.status === this.filters.status;

      let questionMatch = true;
      if (this.filters.questionCount === 'with') {
        questionMatch = teacher.pendingQuestionCount > 0;
      } else if (this.filters.questionCount === 'without') {
        questionMatch = teacher.pendingQuestionCount === 0;
      }

      const mobileMatch = teacher.mobile.toLowerCase().includes(this.filters.mobile.toLowerCase());

      return nameMatch && emailMatch && statusMatch && questionMatch && mobileMatch;
    });

    // Reset pagination to first page when filters change
    this.currentPage = 1;
  }

  resetFilters(): void {
    console.log('Resetting filters');

    // Reset filter values
    this.filters = {
      name: '',
      email: '',
      status: '',
      questionCount: '',
      mobile: ''
    };

    // Reset filtered teachers to show all teachers
    this.filteredTeachers = [...this.allTeachers];

    // Reset pagination
    this.currentPage = 1;

    console.log('Filters after reset:', this.filters);
    console.log('Filtered teachers after reset:', this.filteredTeachers);
  }

  updateDisplayedTeachers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTeachers.slice(startIndex, endIndex);
  }

  // pagintions
  onPageChange(page: number): void {
    this.currentPage = page;
  }
  onItemsPerPageChange(itemsCount: number): void {
    this.itemsPerPage = itemsCount;
    this.currentPage = 1; // Reset to first page when changing items per page
  }
  // pagintions

  teacherIdWiseQuestion(userID: any) {
    console.log({ teacherIdWiseQuestion: userID });
    this.router.navigate(
      ['super_admin/Slayout/pending-question'],
      { queryParams: { teacherId: userID } }
    );
  }
  teacherIdInfo(userID: any) {
    console.log({ teacherIdInfo: userID });
    this.router.navigate(
      ['super_admin/Slayout/view-profile'],
      { queryParams: { teacherId: userID } }
    );
  }
  statusWiseQuestion(status: any, userID: any) {
    this.router.navigate(
      ['super_admin/Slayout/status-wise-questions'],
      { queryParams: { teacherId: userID, status: status } }
    );
  }
}

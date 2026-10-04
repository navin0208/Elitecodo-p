import { Component, ElementRef, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface TestType {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
}

interface DashboardCount {
  totalTestCount: number;
  completedTestCount: number;
  upcomingTestCount: number;
  studentCount: number;
}

interface Test {
  testId: number;
  testName: string;
  startTime: string;
  endTime: string;
  marks: number;
  id: number;
  subjectName: string[];
  status: string;
  typeOfTest: string;
  chapterName: string[];
  testDate: string;
  standardName: string[];
  entranceExamName: string | null;
  yearOfAppearance: string | null;
  createdDate: string;
  questionCount: number;
}

interface RescheduleForm {
  testId: number;
  testDate: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit {
  route = inject(Router);
  activateROut = inject(ActivatedRoute);
  http = inject(HttpmethodsService);
  modal = inject(NzModalService);
  notification = inject(NzNotificationService);

  allTests: Test[] = [];
  upcomingTests: Test[] = [];
  completedTests: Test[] = [];

  // Filter properties
  searchText: string = '';
  selectedTestType: string = 'All Types';
  selectedSubject: string = 'All Subjects';

  loading = true;

  // Pagination properties for Upcoming Tests
  upcomingCurrentPage = 1;
  upcomingPageSize = 8;
  paginatedUpcomingTests: Test[] = [];

  // Pagination properties for Completed Tests
  completedCurrentPage = 1;
  completedPageSize = 8;
  paginatedCompletedTests: Test[] = [];

  // Expose Math object to template
  Math = Math;

  @ViewChild('courseSection') courseSection!: ElementRef;
  @ViewChild('rescheduleModal') rescheduleModal!: TemplateRef<any>;

  // Reschedule properties
  selectedTest: Test | null = null;
  rescheduleForm: RescheduleForm = {
    testId: 0,
    testDate: '',
    startTime: '',
    endTime: ''
  };
  todayDate: string = new Date().toISOString().split('T')[0];

  // Modal reference
  private rescheduleModalRef: any = null;

  dashboardCount: DashboardCount = {
    totalTestCount: 0,
    completedTestCount: 0,
    upcomingTestCount: 0,
    studentCount: 0
  };

  testTypes: TestType[] = [
    {
      id: 'chapter-wise',
      title: 'Chapter Wise Test',
      icon: 'read',
      description: 'Create tests based on specific book chapters',
      color: '#1890ff'
    },
    {
      id: 'subject-wise',
      title: 'Subject Wise Test',
      icon: 'book',
      description: 'Generate tests covering entire subject areas',
      color: '#52c41a'
    },
    {
      id: 'group-wise',
      title: 'Group Wise Test',
      icon: 'team',
      description: 'Design tests for specific student groups',
      color: '#faad14'
    },
    {
      id: 'topic-wise',
      title: 'Topic Wise Test',
      icon: 'reconciliation',
      description: 'Create focused tests on specific learning topics',
      color: '#eb2f96'
    },
    {
      id: 'weightage-wise',
      title: 'Weightage Wise Test',
      icon: 'pie-chart',
      description: 'Generate tests with variable question weightages',
      color: '#722ed1'
    },
    {
      id: 'pyq-wise',
      title: 'Previous Year Question Test',
      icon: 'history',
      description: 'Create tests using past examination questions',
      color: '#13c2c2'
    },
    {
      id: 'numerical',
      title: 'Numerical Test',
      icon: 'calculator',
      description: 'Focus on quantitative and problem-solving questions',
      color: '#fa541c'
    },
    {
      id: 'theoretical',
      title: 'Theoretical Test',
      icon: 'file-text',
      description: 'Design comprehensive theoretical knowledge tests',
      color: '#2f54eb'
    },
    {
      id: 'random',
      title: 'Random Test',
      icon: 'shuffle',
      description: 'Generate randomized tests from question bank',
      color: '#fa8c16'
    },
    {
      id: 'level-wise',
      title: 'Level Wise Test',
      icon: 'rise',
      description: 'Create tests matching student difficulty levels',
      color: '#52c41a'
    }
  ];

  // List of available subjects extracted from data
  subjectsList: string[] = [];

  ngOnInit() {
    this.fetchTests();
  }

  getDashCount() {
    const teacherId = sessionStorage.getItem('teacherId');
    this.http.getRequest(`api/teacherReport/getTestDetailCount/${Number(teacherId)}`).subscribe(
      (res: any) => {
        this.dashboardCount = res;
      },
      (error) => {
        console.error('Error fetching dashboard count:', error);
      }
    );
  }

  fetchTests() {
    this.loading = true;
    const teacherId = sessionStorage.getItem('teacherId');

    this.http.getRequest(`api/test/getUserIdWiseTests/${teacherId}`).subscribe(
      (data: any) => {
        this.allTests = data;
        this.extractSubjectsList();
        this.separateTestsByStatus();
        this.updatePaginations();
        this.getDashCount();
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.notification.error(
          'Error',
          'Failed to load tests. Please try again later.'
        );
        console.error('Error loading tests:', error);
      }
    );
  }

  extractSubjectsList() {
    // Extract unique subject names from test data
    const subjects = new Set<string>();
    this.allTests.forEach(test => {
      test.subjectName.forEach(subject => {
        // Extract subject name without prefix (e.g., "SCPNEET_SUBJECT_BIO" -> "BIO")
        const simplifiedSubject = subject.split('_').pop() || subject;
        subjects.add(simplifiedSubject);
      });
    });
    this.subjectsList = Array.from(subjects);
  }

  separateTestsByStatus() {
    const now = new Date();

    // Reset arrays
    this.upcomingTests = [];
    this.completedTests = [];

    // Filter tests based on search and selected filters
    let filteredTests = [...this.allTests];

    // Apply text search if provided
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      filteredTests = filteredTests.filter(test =>
        test.testName.toLowerCase().includes(searchLower) ||
        test.typeOfTest.toLowerCase().includes(searchLower) ||
        test.subjectName.some(subject => subject.toLowerCase().includes(searchLower))
      );
    }

    // Apply test type filter if selected
    if (this.selectedTestType !== 'All Types') {
      filteredTests = filteredTests.filter(test =>
        test.typeOfTest === this.selectedTestType
      );
    }

    // Apply subject filter if selected
    if (this.selectedSubject !== 'All Subjects') {
      filteredTests = filteredTests.filter(test =>
        test.subjectName.some(subject => subject.includes(this.selectedSubject))
      );
    }

    // Separate tests by status based on end date and time
    filteredTests.forEach(test => {
      // Create date object for test end time
      const testEndDateTime = new Date(test.testDate);
      const [endHours, endMinutes] = test.endTime.split(':').map(Number);
      testEndDateTime.setHours(endHours, endMinutes);

      // Check if test is upcoming or completed
      if (testEndDateTime > now) {
        this.upcomingTests.push({ ...test, status: 'Upcoming' });
      } else {
        this.completedTests.push({ ...test, status: 'Completed' });
      }
    });

    // Sort upcoming tests by date (earliest first)
    this.upcomingTests.sort((a, b) => {
      const dateA = new Date(a.testDate);
      const dateB = new Date(b.testDate);
      return dateA.getTime() - dateB.getTime();
    });

    // Sort completed tests by date (latest first)
    this.completedTests.sort((a, b) => {
      const dateA = new Date(a.testDate);
      const dateB = new Date(b.testDate);
      return dateB.getTime() - dateA.getTime();
    });
  }

  // Pagination methods for Upcoming Tests
  updateUpcomingPagination() {
    const startIndex = (this.upcomingCurrentPage - 1) * this.upcomingPageSize;
    const endIndex = startIndex + this.upcomingPageSize;
    this.paginatedUpcomingTests = this.upcomingTests.slice(startIndex, endIndex);
  }

  changeUpcomingPage(page: number): void {
    if (page < 1 || page > this.getUpcomingTotalPages()) {
      return;
    }
    this.upcomingCurrentPage = page;
    this.updateUpcomingPagination();
  }

  getUpcomingTotalPages(): number {
    return Math.ceil(this.upcomingTests.length / this.upcomingPageSize);
  }

  getUpcomingDisplayedPages(): number[] {
    const totalPages = this.getUpcomingTotalPages();
    const currentPage = this.upcomingCurrentPage;
    const pages = [];

    if (totalPages <= 5) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis effect
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // Ellipsis indicator
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis indicator
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis indicator
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1); // Ellipsis indicator
        pages.push(totalPages);
      }
    }

    return pages;
  }

  // Pagination methods for Completed Tests
  updateCompletedPagination() {
    const startIndex = (this.completedCurrentPage - 1) * this.completedPageSize;
    const endIndex = startIndex + this.completedPageSize;
    this.paginatedCompletedTests = this.completedTests.slice(startIndex, endIndex);
  }

  changeCompletedPage(page: number): void {
    if (page < 1 || page > this.getCompletedTotalPages()) {
      return;
    }
    this.completedCurrentPage = page;
    this.updateCompletedPagination();
  }

  getCompletedTotalPages(): number {
    return Math.ceil(this.completedTests.length / this.completedPageSize);
  }

  getCompletedDisplayedPages(): number[] {
    const totalPages = this.getCompletedTotalPages();
    const currentPage = this.completedCurrentPage;
    const pages = [];

    if (totalPages <= 5) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis effect
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // Ellipsis indicator
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis indicator
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis indicator
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1); // Ellipsis indicator
        pages.push(totalPages);
      }
    }

    return pages;
  }

  // Update all paginations
  updatePaginations() {
    // Reset to first page when data changes
    this.upcomingCurrentPage = 1;
    this.completedCurrentPage = 1;
    this.updateUpcomingPagination();
    this.updateCompletedPagination();
  }

  searchTests(): void {
    this.separateTestsByStatus();
    this.updatePaginations();
  }

  onTestTypeChange(event: any): void {
    this.selectedTestType = event.target.value;
    this.searchTests();
  }

  onSubjectChange(event: any): void {
    this.selectedSubject = event.target.value;
    this.searchTests();
  }

  openTestCreationModal(testType: TestType) {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigate(
      [`/teacher/${boardName}/standard-test`], { queryParams: { type: `${testType.id}` } }
    );
  }

  scrollToCourseSection() {
    if (this.courseSection && this.courseSection.nativeElement) {
      this.courseSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeString: string | undefined): string {
    if (!timeString) return 'N/A';

    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  getSubjectName(subjectNameArray: string[]): string {
    if (!subjectNameArray || subjectNameArray.length === 0) {
      return 'N/A';
    }
    const subject = subjectNameArray[0];
    if (!subject) {
      return 'N/A';
    }
    const parts = subject.split('_');
    return parts.pop() || subject;
  }

  viewTestDetails(test: any): void {
    this.modal.create({
      nzTitle: 'Test Details',
      nzContent: `Details for ${test.typeOfTest} test on ${test.subjectName}`,
      nzFooter: null,
      nzWidth: '600px',
      nzBodyStyle: {
        padding: '24px',
        maxHeight: '80vh',
        overflow: 'auto'
      }
    });
  }

  deleteTest(testId: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this test?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkDanger: true,
      nzOnOk: () => {
        // Implement delete logic here
        this.notification.success('Success', 'Test deleted successfully');
        this.fetchTests();
      },
      nzCancelText: 'Cancel'
    });
  }

  // Reschedule Methods
  openRescheduleModal(test: Test): void {
    this.selectedTest = test;

    // Format date for input field (YYYY-MM-DD)
    const testDate = new Date(test.testDate);
    const formattedDate = testDate.toISOString().split('T')[0];

    // Initialize form with current test data
    this.rescheduleForm = {
      testId: test.testId,
      testDate: formattedDate,
      startTime: test.startTime.substring(0, 5), // Remove seconds if present
      endTime: test.endTime.substring(0, 5)
    };

    // Create modal with proper configuration
    this.rescheduleModalRef = this.modal.create({
      nzTitle: 'Reschedule Test',
      nzContent: this.rescheduleModal,
      nzFooter: null,
      nzWidth: 520,
      nzMaskClosable: false,
      nzClosable: true,
      nzAutofocus: 'auto',
      nzStyle: { top: '50px' },
      nzBodyStyle: { padding: '0' },
      nzOnCancel: () => {
        this.selectedTest = null;
        this.rescheduleModalRef = null;
      }
    });
  }

  isValidTimeRange(): boolean {
    if (!this.rescheduleForm.startTime || !this.rescheduleForm.endTime) {
      return false;
    }
    return this.rescheduleForm.startTime < this.rescheduleForm.endTime;
  }

  isRescheduleFormValid(): boolean {
    // Check if all fields are filled
    if (!this.rescheduleForm.testDate || !this.rescheduleForm.startTime || !this.rescheduleForm.endTime) {
      return false;
    }

    // Check if date is not in the past
    if (this.rescheduleForm.testDate < this.todayDate) {
      return false;
    }

    // Check if time range is valid
    if (!this.isValidTimeRange()) {
      return false;
    }

    return true;
  }

  confirmReschedule(): void {
    if (!this.isRescheduleFormValid()) {
      return;
    }

    // Show loading
    this.loading = true;

    // Prepare request body
    const requestBody = {
      testId: this.rescheduleForm.testId,
      testDate: this.rescheduleForm.testDate,
      startTime: this.rescheduleForm.startTime + ':00',
      endTime: this.rescheduleForm.endTime + ':00'
    };

    // Call reschedule API
    this.http.putRequest('api/auth/test/reschedule', requestBody).subscribe(
      (response: any) => {
        this.loading = false;
        this.notification.success(
          'Success',
          'Test rescheduled successfully'
        );

        // Close modal using the stored reference
        if (this.rescheduleModalRef) {
          this.rescheduleModalRef.destroy();
          this.rescheduleModalRef = null;
        }

        // Reset selected test
        this.selectedTest = null;

        // Refresh test data immediately
        this.fetchTests();
      },
      (error) => {
        this.loading = false;
        console.error('Error rescheduling test:', error);
        this.notification.error(
          'Error',
          error.error?.message || 'Failed to reschedule test. Please try again.'
        );
      }
    );
  }

  // Method to close modal manually
  closeRescheduleModal(): void {
    if (this.rescheduleModalRef) {
      this.rescheduleModalRef.destroy();
      this.rescheduleModalRef = null;
      this.selectedTest = null;
    }
  }

  /**
   * EDIT TEST METHOD - Navigate to test-creation with edit mode
   * This is the ONLY change in this file
   */
  editTest(testId: number): void {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigate([`/teacher/${boardName}/testcreation`], {
      queryParams: { 
        mode: 'edit',
        testId: testId,
        type: 'test-creation'
      }
    });
  }
}
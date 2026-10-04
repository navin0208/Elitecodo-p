import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

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
  entranceExamName: any;
  yearOfAppearance: any;
  createdDate: string;
  questionCount: number;
}

@Component({
  selector: 'app-join-test',
  templateUrl: './join-test.component.html',
  styleUrls: ['./join-test.component.scss']
})
export class JoinTestComponent {
  activateROut = inject(ActivatedRoute);
  route = inject(Router);
  selectedTestType: string = 'Schedule';
  filteredTests: Test[] = [];
  tests: Test[] = [];
  searchText: string = '';
  selectedStandard: string = '';
  allTests: Test[] = []; // Keep a copy of all tests for filtering

  http = inject(HttpmethodsService);

  constructor(
    private router: Router,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.filterTests();
  }

  filterTests() {
    const apiUrl = this.selectedTestType === 'Schedule'
      ? `api/test/getStudentIdWiseTests/${sessionStorage.getItem('studentId')}`
      : `api/test/getTestCreatedByStudent/${sessionStorage.getItem('studentId')}`;

    this.http.getRequest(apiUrl).subscribe(
      (res: any) => {
        console.log({ tests: res });
        this.allTests = res;
        this.applyFilters();
      }
    );
  }

  applyFilters() {
    let filtered = [...this.allTests];

    // Apply search filter
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(test =>
        test.testName.toLowerCase().includes(searchLower) ||
        test.typeOfTest.toLowerCase().includes(searchLower) ||
        test.subjectName.some(subject => subject.toLowerCase().includes(searchLower)) ||
        test.chapterName.some(chapter => chapter.toLowerCase().includes(searchLower))
      );
    }

    // Apply standard filter
    if (this.selectedStandard) {
      filtered = filtered.filter(test =>
        test.standardName.includes(this.selectedStandard)
      );
    }

    this.filteredTests = filtered;
  }

  onSearch(event: any) {
    this.searchText = event.target.value;
    this.applyFilters();
  }

  onStandardChange(event: any) {
    this.selectedStandard = event.target.value;
    this.applyFilters();
  }

  getUniqueStandards(): string[] {
    const standards = new Set<string>();
    this.allTests.forEach(test => {
      test.standardName.forEach(standard => {
        standards.add(standard);
      });
    });
    return Array.from(standards);
  }


  navigateToTest(test: Test): void {
    console.log({ test });
    sessionStorage.setItem('testName', test.testName)
    sessionStorage.setItem('testId', String(test.testId))
    sessionStorage.setItem('examStartTime', test.startTime);
    sessionStorage.removeItem('examSubmitted'); // Clear any previous submission flag


    if (!test.startTime || !test.endTime) {
      this.notification.warning(
        '',
        'Test timing not set',
        { nzPlacement: 'top' }
      );
      return;
    }

    const testDateTime = this.getTestDateTime(test);
    const endDateTime = this.getEndDateTime(test);

    if (testDateTime && endDateTime) {
      const isAvailable = this.isTestAvailable(testDateTime, endDateTime);
      if (isAvailable) {
        // const boardName = this.activateROut.snapshot.paramMap.get('name');
        // this.route.navigate(
        //   [`/student/${boardName}/exam-portal`],
        //   { queryParams: { testId: test.testId.toString() } }
        // );
        // this.onStartTest();
      }
    }
  }

  getTestDateTime(test: Test): Date | null {
    if (!test.testDate || !test.startTime) return null;
    const [hours, minutes] = test.startTime.split(':');
    const testDate = new Date(test.testDate);
    testDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return testDate;
  }

  getEndDateTime(test: Test): Date | null {
    if (!test.testDate || !test.endTime) return null;
    const [hours, minutes] = test.endTime.split(':');
    const endDate = new Date(test.testDate);
    endDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return endDate;
  }

  isTestEnded(test: Test): boolean {
    const endDateTime = this.getEndDateTime(test);
    if (!endDateTime) return false;
    return new Date() > endDateTime;
  }

  getTestStatus(test: Test): { status: string; class: string } {
    const currentTime = new Date();
    const testDateTime = this.getTestDateTime(test);
    const endDateTime = this.getEndDateTime(test);

    if (!testDateTime || !endDateTime) {
      return { status: 'Not Scheduled', class: 'status-upcoming' };
    }

    if (currentTime > endDateTime) {
      return { status: 'Ended', class: 'status-ended' };
    } else if (currentTime < testDateTime) {
      return { status: 'Upcoming', class: 'status-upcoming' };
    } else {
      return { status: 'Started', class: 'status-active' };
    }
  }

  isTestAvailable(testDateTime: Date, endDateTime: Date): boolean {
    const currentTime = new Date();

    if (currentTime < testDateTime) {
      this.notification.warning(
        '',
        'Test has not started yet.',
        { nzPlacement: 'top' }
      );
      return false;
    }

    if (currentTime > endDateTime) {
      this.notification.warning(
        '',
        'Test has ended.',
        { nzPlacement: 'top' }
      );
      return false;
    }

    this.onStartTest();
    return true;
  }

  onStartTest(): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to start the test?',
      nzContent: '<p>Once the test starts, the timer will begin, and you cannot pause or restart.</p>',
      nzOkText: 'Yes, Start Test',
      nzCancelText: 'Cancel',
      nzOnOk: () => this.proceedWithTest(),
      nzOnCancel: () => console.log('Test start cancelled')
    });
  }

  proceedWithTest(): void {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigate(
      [`/student/${boardName}/exam-portal`],
      {
        queryParams: { test: this.selectedTestType },
        state: { fromJoinTest: true }  // Add this state
      }
    );
  }

  formatDateTime(test: Test): string {
    if (!test.testDate || !test.startTime) return 'Not scheduled';

    const testDate = new Date(test.testDate);
    const [hours, minutes] = test.startTime.split(':');
    testDate.setHours(parseInt(hours), parseInt(minutes), 0);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(testDate);
  }

  getDuration(test: Test): string {
    if (!test.startTime || !test.endTime) return 'Not set';

    const [startHours, startMinutes] = test.startTime.split(':');
    const [endHours, endMinutes] = test.endTime.split(':');

    const startDate = new Date();
    startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0);

    const endDate = new Date();
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    const durationInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return `${durationInMinutes} mins`;
  }

  getDataOfTestStudentWise() {

  }

}
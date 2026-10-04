import { Component, inject, OnInit } from '@angular/core';
import { NzProgressStatusType } from 'ng-zorro-antd/progress';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface DashboardStats {
  student: {
    name: string;
    grade: string;
    rollNo: string;
    avatar: string;
  };
  overallGrade: number;
  attendance: number;
  classRank: {
    rank: number;
    percentile: string;
  };
  improvement: number;
  subjects: SubjectPerformance[];
}
interface SubjectPerformance {
  subject: string;
  score: number;
  average: number;
  improvement: number;
  trend: 'up' | 'down' | 'stable';
}
interface MenuItem {
  title: string;
  icon: string;
  description: string;
  routerLink: string;
}

interface Activity {
  name: string;
  subject: string;
  date: string;
  status: string;
  statusColor: string;
  icon: string;
}

@Component({
  selector: 'app-parent-home',
  templateUrl: './parent-home.component.html',
  styleUrls: ['./parent-home.component.scss'],
})
export class ParentHomeComponent implements OnInit {
  studentImage = 'assets/student-avatar.jpg';
  http = inject(HttpmethodsService);
  isLoading = false;

  // Pagination properties
  pageSize = 3;
  pageIndex = 1;
  total = 0;
  displayData: Activity[] = [];
  upcomingEvents: any = []
  recentActivities: any[] = []
  dashboardData: DashboardStats = {
    student: {
      name: 'Loading...',
      grade: 'Loading...',
      rollNo: '...',
      avatar: 'assets/student-avatar.jpg'
    },
    overallGrade: 0,
    attendance: 0,
    classRank: {
      rank: 0,
      percentile: '...'
    },
    improvement: 0,
    subjects: [
      { subject: 'Loading...', score: 0, average: 0, improvement: 0, trend: 'stable' },
      { subject: 'Loading...', score: 0, average: 0, improvement: 0, trend: 'stable' }
    ]
  };
  // Dynamic values
  averageScore: number = 0;
  completedTests: number = 0;
  pendingTests: number = 0;

  ngOnInit(): void {
    this.getmocksummary();
    this.getRecentActivities();
    this.getupcomingEvents();
    this.getPercentageByParentID();
    this.getPerformanceByParentID();
    this.updateDisplayData();
    this.fetchPerformanceData();
    this.total = this.recentActivities.length;
  }
  fetchPerformanceData(): void {
    this.isLoading = true;

    // Check if we have cached data first
    const cachedData = sessionStorage.getItem('performanceData');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        this.processResponse(parsedData);
        return;
      } catch (e) {
        console.error('Error parsing cached data', e);
      }
    }

    this.http.getRequest(`parent/${sessionStorage.getItem('parentId')}/performance`).subscribe({
      next: (response: any) => {
        // Cache the response
        sessionStorage.setItem('performanceData', JSON.stringify(response));
        this.processResponse(response);
      },
      error: (error) => {
        console.error('Error fetching performance data:', error);
      }
    });
  }
  loadMetricsData() {
    // Replace with your actual data fetching logic
    // This could be from a service, API, or input properties
    this.averageScore = 92; // Example dynamic value
    this.completedTests = 15; // Example dynamic value
    this.pendingTests = 5; // Example dynamic value
  }

  // Optional: Dynamic progress bar color based on score
  getProgressStatus(score: number): NzProgressStatusType {
    if (score >= 90) return 'success';
    if (score >= 70) return 'normal';
    if (score >= 50) return 'active';
    return 'exception';
  }
  // Example method to update values (could be called from user actions)
  updateMetrics(newScore: number, completed: number, pending: number) {
    this.averageScore = newScore;
    this.completedTests = completed;
    this.pendingTests = pending;
  }

  getupcomingEvents() {
    this.isLoading = true;
    this.http.getRequest(`api/test/upcoming-events/${sessionStorage.getItem('parentId')}`).subscribe(
      (res: any) => {
        // Transform the API response to match your Activity interface
        this.upcomingEvents = res;

        this.total = this.upcomingEvents.length;
        this.updateDisplayData();
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  getmocksummary() {
    this.isLoading = true;
    this.http.getRequest(`parent/mock-summary/${sessionStorage.getItem('parentId')}`).subscribe(
      (res: any) => {
        // Transform the API response to match your Activity interface
        console.log({ getmocksummary: res })
        this.updateMetrics(res.averageScore, res.completedTests, res.pendingTests);
        // updateMetrics
        this.updateDisplayData();
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }
  getRecentActivities() {
    this.isLoading = true;
    this.http.getRequest(`api/test/recent-activities/${sessionStorage.getItem('parentId')}`).subscribe(
      (res: any) => {
        // Transform the API response to match your Activity interface
        this.recentActivities = res;

        this.total = this.recentActivities.length;
        this.updateDisplayData();
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  // Helper function to determine status color based on status text
  private getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'graded':
        return 'blue';
      case 'excellent':
        return 'purple';
      case 'pending':
        return 'orange';
      default:
        return 'grey';
    }
  }

  parentAttendancePercentage: any = 0;
  getPercentageByParentID() {
    this.isLoading = true;
    let parentId = sessionStorage.getItem('parentId');
    this.http.getRequest(`parent/percentage/${parentId}`).subscribe(
      (res) => {
        this.parentAttendancePercentage = Number(res);
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  parentAttendancePerformance: any = 0;
  getPerformanceByParentID() {
    this.isLoading = true;
    let parentId = sessionStorage.getItem('parentId');
    this.http.getRequest(`parent/performance/${parentId}`).subscribe(
      (res) => {
        this.parentAttendancePerformance = Number(res).toFixed(2);
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  // New methods for pagination
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.updateDisplayData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1; // Reset to first page when changing page size
    this.updateDisplayData();
  }

  updateDisplayData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayData = this.recentActivities.slice(start, end);
  }


  private processResponse(response: any): void {
    this.dashboardData = {
      student: {
        name: response.student.name || 'Unknown Student',
        grade: response.student.grade ? `Grade ${response.student.grade}` : 'Unknown Grade',
        rollNo: response.student.rollNo || 'N/A',
        avatar: response.student.avatar || 'assets/student-avatar.jpg'
      },
      overallGrade: response.overallGrade || 0,
      attendance: response.attendance || 0,
      classRank: {
        rank: response.classRank?.rank || 0,
        percentile: response.classRank?.percentile || 'N/A'
      },
      improvement: response.improvement || 0,
      subjects: response.subjects?.map((subject: any) => ({
        subject: subject.subject,
        score: subject.score || 0,
        average: subject.average || 0,
        improvement: subject.improvement || 0,
        trend: subject.trend || 'stable'
      })) || []
    };
  }
}
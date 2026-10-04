// student-performance.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface SubjectPerformance {
  subject: string;
  score: number;
  average: number;
  improvement: number;
  trend: 'up' | 'down' | 'stable';
}

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

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {
  http = inject(HttpmethodsService);
  isLoading = true;
  errorMessage: string | null = null;
  hasData = false;
  retryCount = 0;
  maxRetries = 3;

  // Default data for skeleton loading
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

  subjectChartOption: any;
  attendanceChartOption: any;

  ngOnInit(): void {
    this.fetchPerformanceData();
  }

  fetchPerformanceData(): void {
    this.isLoading = true;
    this.errorMessage = null;

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
        this.retryCount = 0;
      },
      error: (error) => {
        console.error('Error fetching performance data:', error);

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Retrying... Attempt ${this.retryCount}`);
          setTimeout(() => this.fetchPerformanceData(), 2000 * this.retryCount);
        } else {
          this.errorMessage = 'Failed to load performance data. Please try again later.';
          this.isLoading = false;
          this.hasData = false;
        }
      }
    });
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

    this.initializeCharts();
    this.isLoading = false;
    this.hasData = true;
  }

  initializeCharts(): void {
    if (!this.dashboardData.subjects.length) return;

    // Subject Chart
    this.subjectChartOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Student Score', 'Class Average']
      },
      xAxis: {
        type: 'category',
        data: this.dashboardData.subjects.map(item => item.subject)
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100
      },
      series: [
        {
          name: 'Student Score',
          type: 'bar',
          data: this.dashboardData.subjects.map(item => item.score),
          itemStyle: {
            color: '#1890ff'
          }
        },
        {
          name: 'Class Average',
          type: 'line',
          data: this.dashboardData.subjects.map(item => item.average),
          itemStyle: {
            color: '#722ed1'
          }
        }
      ]
    };

    // Attendance Chart
    this.attendanceChartOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Attendance',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: this.dashboardData.attendance,
              name: 'Present',
              itemStyle: { color: '#52c41a' }
            },
            {
              value: 100 - this.dashboardData.attendance,
              name: 'Absent',
              itemStyle: { color: '#f5222d' }
            }
          ]
        }
      ]
    };
  }

  refreshData(): void {
    // Clear cache and reset loading states
    sessionStorage.removeItem('performanceData');
    this.isLoading = true;
    this.hasData = false;
    this.errorMessage = null;

    // Force change detection
    setTimeout(() => {
      this.fetchPerformanceData();
    }, 0);
  }
  // Helper methods remain the same
  getProgressColor(score: number): { '0%': string; '100%': string } {
    if (score >= 90) return { '0%': '#b7eb8f', '100%': '#52c41a' };
    if (score >= 75) return { '0%': '#91d5ff', '100%': '#1890ff' };
    if (score >= 60) return { '0%': '#ffd591', '100%': '#faad14' };
    return { '0%': '#ffa39e', '100%': '#f5222d' };
  }

  getStatusColor(score: number): string {
    if (score >= 90) return 'success';
    if (score >= 75) return 'processing';
    if (score >= 60) return 'warning';
    return 'error';
  }

  getStatus(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  }

  getImprovementClass(improvement: number): string {
    return improvement >= 0 ? 'improvement-up' : 'improvement-down';
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'arrow-up';
      case 'down': return 'arrow-down';
      default: return 'minus';
    }
  }

  getTrendClass(trend: 'up' | 'down' | 'stable'): string {
    return `trend-${trend}`;
  }
}
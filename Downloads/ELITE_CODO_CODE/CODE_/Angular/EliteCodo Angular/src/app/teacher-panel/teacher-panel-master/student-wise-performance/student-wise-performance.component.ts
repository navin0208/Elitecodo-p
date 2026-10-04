import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface StudentResult {
  id?: number;
  subject: string;
  marks: number;
  total: number;
  grade: string;
  date: string;
  improvement: number;
}

interface Student {
  id?: number;
  rollNo: string;
  name: string;
  clazz: string;
  average: number;
  status: string;
  attendance: number;
  expand: boolean;
  trend: Array<{ month: string; score: number }>;
  results: StudentResult[];
}

@Component({
  selector: 'app-student-wise-performance',
  templateUrl: './student-wise-performance.component.html',
  styleUrls: ['./student-wise-performance.component.scss']
})
export class StudentWisePerformanceComponent implements OnInit {
  student: Student | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public http: HttpmethodsService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.loadStudentData();
  }

  loadStudentData() {
    const studentId = this.route.snapshot.paramMap.get('id');
    this.loading = true;

    this.http.getRequest(`api/teacherReport/studentPerformance/${studentId}`).subscribe(
      (response: any) => {
        console.log({ getStudentsData: response });
        this.student = response;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching student data:', error);
        this.message.error('Failed to load student data');
        this.loading = false;
      }
    );
  }

  get displayName(): string {
    return this.student?.name?.[0] ?? '';
  }

  getPerformanceChartOptions() {
    if (!this.student) return {};

    // Filter out months with zero scores to avoid cluttering the chart
    const filteredTrend = this.student.trend.filter(t => t.score > 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: filteredTrend.map(t => t.month),
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [{
        name: 'Performance',
        type: 'line',
        data: filteredTrend.map(t => t.score),
        smooth: true,
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10
        },
        itemStyle: {
          color: '#1890ff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(24,144,255,0.3)'
            }, {
              offset: 1,
              color: 'rgba(24,144,255,0.1)'
            }]
          }
        }
      }]
    };
  }

  getStatusColor(status: string | undefined): string {
    const colors: { [key: string]: string } = {
      'Excellent': 'green',
      'Good': 'blue',
      'Average': 'orange',
      'Poor': 'red',
      'Needs Improvement': 'red'
    };
    return status ? colors[status] || 'default' : 'default';
  }

  getSubjectIcon(subject: string): string {
    const icons: { [key: string]: string } = {
      'MATH_Ash': 'calculator',
      'Ash_Aldehyde_Subject': 'experiment',
      'Mathematics': 'calculator',
      'Science': 'experiment',
      'English': 'read',
      'History': 'clock-circle',
      'Geography': 'global'
    };
    return icons[subject] || 'book';
  }

  getProgressStatus(value: number): 'success' | 'normal' | 'exception' {
    if (value >= 80) return 'success';
    if (value >= 60) return 'normal';
    return 'exception';
  }

  getGradeColor(grade: string): string {
    const colors: { [key: string]: string } = {
      'A+': '#52c41a',
      'A': '#1890ff',
      'B+': '#722ed1',
      'B': '#faad14',
      'C': '#fa8c16',
      'D': '#f5222d',
      'F': '#ff4d4f'
    };
    return colors[grade] || '#d9d9d9';
  }

  getTopSubjectScore(): number {
    if (!this.student?.results) return 0;
    return Math.max(...this.student.results.map(r => r.marks));
  }

  getAverageImprovement(): number {
    if (!this.student?.results) return 0;
    const improvements = this.student.results.map(r => r.improvement);
    return Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length);
  }

  goBack(): void {
    this.location.back();
  }

  printReport(): void {
    this.message.info('Preparing report for printing...');
    // Implement print functionality
  }

  contactParent(): void {
    this.message.info('Opening communication panel...');
    // Implement parent contact functionality
  }

  scheduleParentMeeting(): void {
    this.message.info('Opening scheduler...');
    // Implement meeting scheduler
  }

  addNote(): void {
    this.message.info('Opening note editor...');
    // Implement note adding functionality
  }

  reportIssue(): void {
    this.message.info('Opening issue reporter...');
    // Implement issue reporting
  }

  viewFullReport(): void {
    this.message.info('Generating full report...');
    // Implement full report view
  }
}
// practice-test-report.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

// Interfaces
interface TestReport {
  id: number;
  subjectName: any;
  testName: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  score: number;
  improvement: number;
  details?: {
    topicWisePerformance: TopicPerformance[];
    strengthAreas: string[];
    improvementAreas: string[];
  };
}

interface TopicPerformance {
  topic: string;
  score: number;
}

interface SubjectOption {
  label: string;
  value: string;
}

interface PerformanceData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-practice-tests',
  templateUrl: './practice-tests.component.html',
  styleUrls: ['./practice-tests.component.scss'],
})
export class PracticeTestsComponent {
  
  // Basic Properties
  selectedSubject: string = 'all';
  dateRange: Date[] = [];
  loading: boolean = false;
  averageScore: number = 85;
  totalTests: number = 24;
  testReports: TestReport[] = [];
  performanceData: any[] = []; // Initialize with an empty array
  // Subject Colors for consistent styling
  subjectColors: { [key: string]: string } = {
    'SCPNEET_SUBJECT_BIO': '#52c41a',
    'SCPNEET_SUBJECT_PHY': '#1890ff',
    'SCPNEET_SUBJECT_CHEM': '#722ed1',
    'MATHEMATICS': '#1890ff',
    'SCIENCE': '#52c41a',
    'ENGLISH': '#722ed1',
    'HISTORY': '#fa8c16'
  };
  // Dynamic values for the cards
  animatedAverageScore: number = 0;
  animatedTotalTests: number = 0;
  animatedTotalTime: number = 0;

  // Target values
  targetAverageScore: number = 85; // Example value
  targetTotalTests: number = 24; // Example value
  targetTotalTime: number = 12.5; // Example value

  // Animation duration (in milliseconds)
  animationDuration: number = 2000; // 2 seconds
  animationInterval: number = 50; // Update every 50ms

  http = inject(HttpmethodsService);
  // Dropdown Options - Initialize with just "All Subjects"
  subjects: SubjectOption[] = [
    { label: 'All Subjects', value: 'all' }
  ];

  // Chart Options
  // Initialize subjectChartOption with empty data
  subjectChartOption: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%',
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#595959',
      },
    },
    series: [
      {
        name: 'Subject Performance',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [], // Initialize with empty data
      },
    ],
  };
  timelineChartOption!: {
    tooltip: { trigger: string; axisPointer: { type: string; }; }; grid: { left: string; right: string; bottom: string; containLabel: boolean; }; xAxis: {
      type: string; data: string[]; // Dynamically setting test names
      axisLabel: { color: string; rotate: number; };
    }; yAxis: { type: string; min: number; max: number; axisLabel: { formatter: string; color: string; }; }; series: {
      name: string; type: string; smooth: boolean; data: number[]; // Dynamically setting scores
      symbolSize: number; itemStyle: { color: string; }; areaStyle: { color: { type: string; x: number; y: number; x2: number; y2: number; colorStops: { offset: number; color: string; }[]; }; };
    }[];
  };
  private initializeTimelineChart(): void {

    this.timelineChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.testReports.map((report) => report.testName), // Dynamically setting test names
        axisLabel: {
          color: '#595959',
          rotate: 45, // Optional: Rotate labels to improve readability
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: '#595959',
        },
      },
      series: [
        {
          name: 'Score',
          type: 'line',
          smooth: true,
          data: this.testReports.map((report) => report.score), // Dynamically setting scores
          symbolSize: 8,
          itemStyle: {
            color: '#1890ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(24,144,255,0.3)',
                },
                {
                  offset: 1,
                  color: 'rgba(24,144,255,0.1)',
                },
              ],
            },
          },
        },
      ],
    };

  }

  constructor(private message: NzMessageService) { }

  ngOnInit(): void {
    this.initializeTimelineChart(); // Initialize chart with empty data
    this.getTestReports();
    this.fetchTestReports();
    this.calculateStatistics();
    this.updateSubjectChart(); // Initialize the chart with empty data
    this.startCountingAnimation();
  }

  // Function to start the counting animation
  startCountingAnimation(): void {
    this.animateValue('animatedAverageScore', 0, this.targetAverageScore);
    this.animateValue('animatedTotalTests', 0, this.targetTotalTests);
    this.animateValue('animatedTotalTime', 0, this.targetTotalTime);
  }

  // Generic function to animate a value
  // Updated animation function with start and target values
  animateValue(
    property: keyof PracticeTestsComponent,
    startValue: number,
    targetValue: number
  ): void {
    const step =
      targetValue / (this.animationDuration / this.animationInterval);
    let currentValue = startValue;

    const interval = setInterval(() => {
      currentValue += step;
      if (currentValue >= targetValue) {
        (this[property] as number) = targetValue; // Type assertion
        clearInterval(interval); // Stop the interval
      } else {
        (this[property] as number) = Math.round(currentValue); // Type assertion
      }
    }, this.animationInterval);
  }

  getTestReports() {
    this.http
      .getRequest(
        `parent/recent-tests?parentId=${sessionStorage.getItem('parentId')}`
      )
      .subscribe((res: any) => {
        this.processPerformanceData(res);
        this.testReports = res.map((report: any) => ({
          ...report,
          subjectName: report.subjectNames.join(', '),
        }));

        this.extractSubjectsFromReports(res);
        this.getSubjectData();

        // Update timeline chart with the loaded data
        this.updateTimelineChart();
      });
  }
  // Add this new method to update the timeline chart
  private updateTimelineChart(): void {
    if (!this.timelineChartOption) return;

    const latestScores = this.testReports.map((report) => report.score);
    const latestTestNames = this.testReports.map((report) => report.testName);

    this.timelineChartOption = {
      ...this.timelineChartOption,
      xAxis: {
        ...this.timelineChartOption.xAxis,
        data: latestTestNames,
      },
      series: [
        {
          ...(this.timelineChartOption.series as any[])[0],
          data: latestScores,
        },
      ],
    };
  }


  // Extract unique subjects from the reports and update the dropdown
  private extractSubjectsFromReports(reports: any[]): void {
    const uniqueSubjects = new Set<string>();

    reports.forEach(report => {
      if (report.subjectNames && report.subjectNames.length > 0) {
        report.subjectNames.forEach((subject: string) => {
          uniqueSubjects.add(subject);
        });
      }
    });

    // Add the unique subjects to the dropdown (except "all" which is already there)
    Array.from(uniqueSubjects).forEach(subject => {
      // Skip if already exists
      if (!this.subjects.some(s => s.value === subject.toLowerCase())) {
        this.subjects.push({
          label: this.formatSubjectName(subject),
          value: subject.toLowerCase()
        });
      }
    });
  }

  // Format subject name for display (remove prefixes and underscores)
  private formatSubjectName(subject: string): string {
    // Remove SCPNEET_SUBJECT_ prefix if exists
    if (subject.startsWith('SCPNEET_SUBJECT_')) {
      subject = subject.replace('SCPNEET_SUBJECT_', '');
    }
    // Replace underscores with spaces
    return subject.replace(/_/g, ' ');
  }

  processPerformanceData(data: any): void {
    console.log({ processPerformanceData: data });
    if (!data || data.length === 0) return;

    let totalScore = 0;
    let totalTests = data.length;
    let totalTimeInSeconds = 0;

    data.forEach((entry: any) => {
      totalScore += entry.score || 0;

      if (entry.timeTaken) {
        const timeParts = entry.timeTaken.split(':').map(Number);
        let seconds = 0;

        if (timeParts.length === 3) {
          // HH:MM:SS format
          seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else if (timeParts.length === 2) {
          // MM:SS format
          seconds = timeParts[0] * 60 + timeParts[1];
        }

        totalTimeInSeconds += seconds;
      }
    });

    const totalEntries = data.length;
    this.targetAverageScore = totalEntries
      ? Math.round(totalScore / totalEntries)
      : 0;
    this.targetTotalTests = totalTests;

    // Calculate total time in minutes
    const totalMinutes = totalTimeInSeconds / 60;
    this.targetTotalTime = Number(totalMinutes.toFixed(1));

    // Reset animation values
    this.animatedAverageScore = 0;
    this.animatedTotalTests = 0;
    this.animatedTotalTime = 0;

    // Start the animation
    this.startCountingAnimation();

    console.log('targetAverageScore:', this.targetAverageScore);
    console.log('targetTotalTests:', this.targetTotalTests);
    console.log('targetTotalTime (minutes):', this.targetTotalTime);
  }

  getSubjectData() {
    this.http
      .getRequest(
        `parent/getSubjectPerformance/${sessionStorage.getItem('parentId')}`
      )
      .subscribe((res: any) => {
        this.performanceData = res;
        this.updateSubjectChart(); // Update the chart after data is fetched
      });
  }

  // Method to update the subject chart
  private updateSubjectChart(): void {
    // Ensure series is an array
    const series = Array.isArray(this.subjectChartOption.series)
      ? this.subjectChartOption.series
      : [this.subjectChartOption.series];

    this.subjectChartOption = {
      ...this.subjectChartOption, // Keep existing options
      series: [
        {
          ...series[0], // Use the first series (or default if undefined)
          data: this.performanceData, // Update with new data
        },
      ],
    };
  }

  // Event Handlers
  onSubjectChange(value: string): void {
    this.selectedSubject = value;
    this.fetchTestReports();
  }

  onDateRangeChange(dates: Date[]): void {
    this.dateRange = dates;
    this.fetchTestReports();
  }

  viewTestDetails(report: TestReport): void {
    // Implement test detail view logic
    console.log('Viewing details for test:', report.id);
    this.message.info(`Viewing details for ${report.testName}`);
  }

  // Utility Methods
  getSubjectColor(subject: string): string {
    // Use the first subject for color (or handle all subjects)
    const firstSubject = subject.split(',')[0].trim();
    return this.subjectColors[firstSubject] || '#1890ff'; // Default color
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  }

  // Data Fetching and Processing
  private fetchTestReports(): void {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      // Filter reports based on selected subject and date range
      if (this.selectedSubject !== 'all') {
        this.testReports = this.testReports.filter(
          (report) => report.subjectName.toLowerCase() === this.selectedSubject
        );
      }
      this.loading = false;
      this.calculateStatistics();
    }, 1000);
  }

  private calculateStatistics(): void {
    if (this.testReports.length === 0) return;

    this.averageScore = Math.round(
      this.testReports.reduce((acc, curr) => acc + curr.score, 0) /
      this.testReports.length
    );

    this.totalTests = this.testReports.length;
    this.updateTimelineChart(); // Add this line
    this.updateCharts();
  }

  private updateCharts(): void {
    // Update timeline chart
    const latestScores = this.testReports.map((report) => report.score); // Show all test scores
    const latestTestNames = this.testReports.map((report) => report.testName); // Show all test names

    (this.timelineChartOption.xAxis as any).data = latestTestNames; // Update x-axis labels
    (this.timelineChartOption.series as any[])[0].data = latestScores; // Update data points

    // Force charts to update
    this.timelineChartOption = { ...this.timelineChartOption };
    this.subjectChartOption = { ...this.subjectChartOption };
  }

  // Export Methods
  exportReport(): void {
    // Implement export functionality
    this.message.success('Report exported successfully');
  }

  // Print Methods
  printReport(): void {
    window.print();
  }
}
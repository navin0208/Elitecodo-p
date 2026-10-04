// admin-reports.component.ts
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';
import { ReportService } from 'src/app/share-services/institutionReport/report.service';
import { debounceTime, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  activeTab: string = 'teacher';
  teachers: any[] = [];
  tests: any[] = [];
  students: any[] = [];
  selectedTeacher: any = null;
  selectedTest: any = null;
  selectedStudent: any = null;
  Math = Math; // 👈 this makes Math accessible in the HTML

  // Pagination for large datasets
  pageSize: number = 10;
  currentPage: number = 1;
  filteredTeachers: any[] = [];
  searchTerm: string = '';

  // Chart instances
  charts: { [key: string]: echarts.ECharts } = {};

  // Loading states
  isLoading: boolean = false;
  loadingMessages: { [key: string]: string } = {};

  // Dashboard stats
  dashboardStats = {
    totalTeachers: 0,
    totalStudents: 0,
    totalTests: 0,
    avgScore: 0
  };

  // Screen size detection
  isMobileView: boolean = false;
  resizeSubscription!: Subscription;

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.detectScreenSize();
    this.loadInitialData();

    // Handle window resize events with debounce
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.detectScreenSize();
        this.resizeAllCharts();
      });
  }

  ngOnDestroy(): void {
    // Clean up all chart instances
    this.disposeAllCharts();

    // Unsubscribe from resize events
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  detectScreenSize(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  loadInitialData(): void {
    this.setLoading('initial', 'Loading dashboard data...');

    Promise.all([
      this.reportService.getAllTeachers(),
      this.reportService.getAllTests(),
      this.reportService.getAllStudents()
    ]).then(([teachers, tests, students]) => {
      this.teachers = teachers || [];
      this.tests = tests || [];
      this.students = students || [];

      // Calculate dashboard stats
      this.calculateDashboardStats();

      // Initialize filtered teachers for pagination
      this.filterTeachers();

      if (this.teachers.length > 0) {
        this.selectedTeacher = this.teachers[0];
        this.loadTeacherReports();
      }

      this.clearLoading('initial');
    }).catch(error => {
      console.error('Error loading initial data:', error);
      this.clearLoading('initial');
    });
  }

  calculateDashboardStats(): void {
    this.dashboardStats = {
      totalTeachers: this.teachers.length,
      totalStudents: this.students.length,
      totalTests: this.tests.length,
      avgScore: this.calculateAverageScore()
    };
  }

  calculateAverageScore(): number {
    if (!this.teachers.length) return 0;
    const totalScore = this.teachers.reduce((sum, teacher) => sum + (teacher.avgScore || 0), 0);
    return Math.round(totalScore / this.teachers.length);
  }

  filterTeachers(): void {
    this.filteredTeachers = this.teachers
      .filter(teacher =>
        teacher.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      );
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.filterTeachers();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterTeachers();
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.detectChanges();

    setTimeout(() => {
      switch (tab) {
        case 'teacher':
          if (this.selectedTeacher) this.loadTeacherReports();
          break;
        case 'test':
          if (this.tests.length > 0) {
            this.selectedTest = this.selectedTest || this.tests[0];
            this.loadTestReports();
          }
          break;
        case 'student':
          if (this.students.length > 0) {
            this.selectedStudent = this.selectedStudent || this.students[0];
            this.loadStudentReports();
          }
          break;
        case 'overview':
          this.initOverviewCharts();
          break;
      }
    }, 300);
  }

  onTeacherChange(): void {
    this.loadTeacherReports();
  }

  onTestChange(): void {
    this.loadTestReports();
  }

  onStudentChange(): void {
    this.loadStudentReports();
  }

  loadTeacherReports(): void {
    if (!this.selectedTeacher) return;

    this.isLoading = true;

    Promise.all([
      this.reportService.getTeacherPerformanceData(this.selectedTeacher.id),
      this.reportService.getTeacherTestsData(this.selectedTeacher.id)
    ]).then(([performanceData, testsData]) => {
      this.isLoading = false;

      // Apply change detection first to update DOM
      this.cdr.detectChanges();

      // Then initialize charts with a small delay
      setTimeout(() => {
        // Extract data appropriately whether it comes with keys or directly as arrays
        const students = Array.isArray(performanceData) ? performanceData : performanceData?.students || [];
        const testGroups = Array.isArray(testsData) ? testsData : testsData?.testGroups || [];

        this.initTeacherPerformanceChart({ students });
        this.initTeacherTestsChart({ testGroups });
      }, 100);
    }).catch(error => {
      console.error('Error loading teacher reports:', error);
      this.isLoading = false;
    });
  }

  loadTestReports(): void {
    if (!this.selectedTest) return;

    this.isLoading = true;

    Promise.all([
      this.reportService.getTestPerformanceData(this.selectedTest.id),
      this.reportService.getTestScoreDistribution(this.selectedTest.id)
    ]).then(([performanceData, scoreDistribution]) => {
      this.isLoading = false;

      // Apply change detection first to update DOM
      this.cdr.detectChanges();

      // Then initialize charts with a small delay
      setTimeout(() => {
        // Extract data appropriately whether it comes with keys or directly as arrays
        const questions = Array.isArray(performanceData) ? performanceData : performanceData?.questions || [];
        const ranges = Array.isArray(scoreDistribution) ? scoreDistribution : scoreDistribution?.ranges || [];

        this.initTestScoreDistributionChart({ ranges });
      }, 100);
    }).catch(error => {
      console.error('Error loading test reports:', error);
      this.isLoading = false;
    });
  }

  loadStudentReports(): void {
    if (!this.selectedStudent) return;

    this.isLoading = true;

    Promise.all([
      this.reportService.getStudentProgressData(this.selectedStudent.id),
      this.reportService.getStudentSubjectData(this.selectedStudent.id)
    ]).then(([progressData, subjectData]) => {
      this.isLoading = false;

      // Apply change detection first to update DOM
      this.cdr.detectChanges();

      // Then initialize charts with a small delay
      setTimeout(() => {
        // Extract data appropriately whether it comes with keys or directly as arrays
        const tests = Array.isArray(progressData) ? progressData : progressData?.tests || [];
        const subjects = Array.isArray(subjectData) ? subjectData : subjectData?.subjects || [];

        this.initStudentProgressChart({ tests });
        this.initStudentSubjectChart({ subjects });
      }, 100);
    }).catch(error => {
      console.error('Error loading student reports:', error);
      this.isLoading = false;
    });
  }

  setLoading(context: string, message: string): void {
    this.isLoading = true;
    this.loadingMessages[context] = message;
  }

  clearLoading(context: string): void {
    this.isLoading = false;
    delete this.loadingMessages[context];
  }

  initChart(elementId: string): echarts.ECharts {
    // Dispose existing chart if it exists
    if (this.charts[elementId]) {
      this.charts[elementId].dispose();
    }

    const chartElement = document.getElementById(elementId);
    if (!chartElement) {
      throw new Error(`Chart element ${elementId} not found`);
    }

    const chart = echarts.init(chartElement);
    this.charts[elementId] = chart;
    return chart;
  }

  resizeAllCharts(): void {
    Object.values(this.charts).forEach(chart => {
      try {
        chart.resize();
      } catch (e) {
        console.error('Error resizing chart:', e);
      }
    });
  }

  disposeAllCharts(): void {
    Object.values(this.charts).forEach(chart => {
      try {
        chart.dispose();
      } catch (e) {
        console.error('Error disposing chart:', e);
      }
    });
    this.charts = {};
  }

  // Chart initialization methods
  initTeacherPerformanceChart(data: any): void {
    try {
      const chart = this.initChart('teacherPerformanceChart');
      const students = data?.students || [];
      const studentData = this.processStudentPerformanceData(students);

      const option = {
        title: {
          text: 'Student Performance Distribution',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          },
          top: '5%'  // Added padding from top
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} students'
        },
        grid: {
          left: '10%',  // Increased left margin for y-axis labels
          right: '5%',
          top: '20%',   // Increased top margin
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: 'Number of Students',
          nameLocation: 'middle',
          nameGap: 30,  // Added gap for y-axis title
          axisLabel: {
            margin: 10  // Added margin for y-axis labels
          }
        },
        series: [
          {
            name: 'Score Distribution',
            type: 'bar',
            barWidth: '60%',
            data: studentData.map((value, index) => ({
              value,
              itemStyle: {
                color: this.getPerformanceColor(index)
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing teacher performance chart:', error);
    }
  }

  initTeacherTestsChart(data: any): void {
    try {
      const chart = this.initChart('teacherTestsChart');
      const testGroups = data?.testGroups || [];

      const option = {
        title: {
          text: 'Tests Created & Performance',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          },
          top: '5%'  // Added padding from top
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Number of Tests', 'Average Test Score'],
          bottom: 0
        },
        grid: {
          left: '10%',  // Increased left margin for y-axis labels
          right: '5%',
          top: '20%',   // Increased top margin
          bottom: '15%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: testGroups.map((g: any) => g.month)
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Tests Count',
            nameLocation: 'middle',
            nameGap: 30,  // Added gap for y-axis title
            min: 0,
            max: Math.max(...testGroups.map((g: any) => g.count)) + 2,
            interval: 1,
            axisLabel: {
              margin: 10  // Added margin for y-axis labels
            }
          },
          {
            type: 'value',
            name: 'Avg Score',
            nameLocation: 'middle',
            nameGap: 30,  // Added gap for y-axis title
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: {
              formatter: '{value}',
              margin: 10  // Added margin for y-axis labels
            }
          }
        ],
        series: [
          {
            name: 'Number of Tests',
            type: 'bar',
            data: testGroups.map((g: any) => ({
              value: g.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#3451b5' }
                ])
              }
            }))
          },
          {
            name: 'Average Test Score',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              width: 3
            },
            data: testGroups.map((g: any) => g.averageScore),
            itemStyle: {
              color: '#ee6666'
            }
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing teacher tests chart:', error);
    }
  }

  initTestScoreDistributionChart(data: any): void {
    try {
      const chart = this.initChart('testScoreDistributionChart');
      const ranges = data?.ranges || [];

      const option = {
        title: {
          text: 'Test Score Distribution',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} students ({d}%)'
        },
        visualMap: {
          show: false,
          min: 0,
          max: Math.max(...ranges.map((r: any) => r.count)),
          inRange: {
            colorLightness: [0.2, 0.9]
          }
        },
        series: [
          {
            name: 'Score Range',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: ranges.map((r: any, index: number) => ({
              value: r.count,
              name: r.range,
              itemStyle: {
                color: this.getPerformanceColor(index)
              }
            })).sort((a: any, b: any) => a.value - b.value),
            roseType: 'radius',
            label: {
              formatter: '{b}: {c}'
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: () => Math.random() * 200
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing test score distribution chart:', error);
    }
  }

  initStudentProgressChart(data: any): void {
    try {
      const chart = this.initChart('studentProgressChart');
      const tests = data?.tests || [];

      const option = {
        title: {
          text: 'Student Progress Over Time',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['Score', 'Class Average'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: tests.map((t: any) => t.date)
        },
        yAxis: {
          type: 'value',
          name: 'Score',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [
          {
            name: 'Score',
            type: 'line',
            stack: 'Total',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(84, 112, 198, 0.8)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
              ])
            },
            emphasis: { focus: 'series' },
            data: tests.map((t: any) => t.score),
            lineStyle: { width: 3 },
            symbolSize: 8
          },
          {
            name: 'Class Average',
            type: 'line',
            stack: 'Total2',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(145, 204, 117, 0.8)' },
                { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
              ])
            },
            emphasis: { focus: 'series' },
            data: tests.map((t: any) => t.classAverage),
            lineStyle: { width: 3, type: 'dashed' },
            symbolSize: 8
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing student progress chart:', error);
    }
  }

  initStudentSubjectChart(data: any): void {
    try {
      const chart = this.initChart('studentSubjectChart');
      const subjects = data?.subjects || [];

      const option = {
        title: {
          text: 'Subject-wise Performance',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        radar: {
          indicator: subjects.map((s: any) => ({
            name: s.name,
            max: 100
          })),
          shape: 'circle',
          splitNumber: 5,
          axisName: {
            formatter: '{value}',
            color: '#428BD4'
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.2)'],
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(211, 253, 250, 0.8)'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(211, 253, 250, 0.8)'
            }
          }
        },
        series: [
          {
            name: 'Subject Scores',
            type: 'radar',
            emphasis: {
              lineStyle: {
                width: 4
              }
            },
            data: [
              {
                value: subjects.map((s: any) => s.score),
                name: 'Student Score',
                areaStyle: {
                  color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                    { color: 'rgba(84, 112, 198, 0.8)', offset: 0 },
                    { color: 'rgba(84, 112, 198, 0.3)', offset: 1 }
                  ])
                },
                lineStyle: {
                  color: '#5470c6',
                  width: 2
                },
                symbolSize: 6
              },
              {
                value: subjects.map((s: any) => s.classAverage),
                name: 'Class Average',
                areaStyle: {
                  color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.8, [
                    { color: 'rgba(145, 204, 117, 0.8)', offset: 0 },
                    { color: 'rgba(145, 204, 117, 0.3)', offset: 1 }
                  ])
                },
                lineStyle: {
                  color: '#91cc75',
                  width: 2
                },
                symbolSize: 6
              }
            ]
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing student subject chart:', error);
    }
  }

  initOverviewCharts(): void {
    setTimeout(() => {
      try {
        this.initTeacherOverviewChart();
        this.initTestOverviewChart();
        this.initStudentOverviewChart();
      } catch (error) {
        console.error('Error initializing overview charts:', error);
      }
    }, 100);
  }

  initTeacherOverviewChart(): void {
    try {
      const chart = this.initChart('teacherOverviewChart');

      const performanceRanges = [
        { range: '90-100%', count: 0 },
        { range: '80-89%', count: 0 },
        { range: '70-79%', count: 0 },
        { range: '60-69%', count: 0 },
        { range: 'Below 60%', count: 0 }
      ];

      this.teachers.forEach(teacher => {
        const score = teacher.avgScore || 0;
        if (score >= 90) performanceRanges[0].count++;
        else if (score >= 80) performanceRanges[1].count++;
        else if (score >= 70) performanceRanges[2].count++;
        else if (score >= 60) performanceRanges[3].count++;
        else performanceRanges[4].count++;
      });

      const option = {
        title: {
          text: 'Teacher Performance Distribution',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: performanceRanges.map(item => item.range)
        },
        series: [
          {
            name: 'Teacher Performance',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: performanceRanges.map(item => ({
              value: item.count,
              name: item.range
            })),
            color: ['#3366cc', '#5470c6', '#91cc75', '#fac858', '#ee6666']
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing teacher overview chart:', error);
    }
  }

  initTestOverviewChart(): void {
    try {
      const chart = this.initChart('testOverviewChart');

      const monthlyTests = [
        { month: 'Jan', count: 5 },
        { month: 'Feb', count: 8 },
        { month: 'Mar', count: 12 },
        { month: 'Apr', count: 6 },
        { month: 'May', count: 9 },
        { month: 'Jun', count: 4 }
      ];

      const option = {
        title: {
          text: 'Monthly Test Activity',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: monthlyTests.map(item => item.month),
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Tests Created',
            type: 'bar',
            barWidth: '60%',
            data: monthlyTests.map(item => ({
              value: item.count,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#3451b5' }
                ])
              }
            }))
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing test overview chart:', error);
    }
  }

  initStudentOverviewChart(): void {
    try {
      const chart = this.initChart('studentOverviewChart');

      const topPerformers = {
        avgScore: this.students.slice().sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0)).slice(0, 5),
        highestScore: this.students.slice().sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0)).slice(0, 5)
      };

      const option = {
        title: {
          text: 'Top Student Performers',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Average Score', 'Highest Score'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        dataset: {
          source: [
            ['student', 'Average Score', 'Highest Score'],
            ...topPerformers.avgScore.map((student, index) => [
              student.name,
              student.avgScore || 0,
              topPerformers.highestScore[index]?.highestScore || 0
            ])
          ]
        },
        xAxis: { type: 'category' },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [
          {
            type: 'bar',
            itemStyle: { color: '#5470c6' },
          },
          {
            type: 'bar',
            itemStyle: { color: '#91cc75' },
          }
        ]
      };

      chart.setOption(option);
    } catch (error) {
      console.error('Error initializing student overview chart:', error);
    }
  }

  getPerformanceColor(index: number): string {
    const colors = ['#ee6666', '#fac858', '#91cc75', '#5470c6', '#3366cc'];
    return colors[index] || '#5470c6';
  }

  processStudentPerformanceData(students: any[]): number[] {
    const ranges = [0, 0, 0, 0, 0];

    students.forEach(student => {
      const score = student.averageScore || 0;
      if (score <= 20) ranges[0]++;
      else if (score <= 40) ranges[1]++;
      else if (score <= 60) ranges[2]++;
      else if (score <= 80) ranges[3]++;
      else ranges[4]++;
    });

    return ranges;
  }

  displayTopStudents(students: any[]): any[] {
    return students
      .slice()
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 5);
  }
  // Add all other chart initialization methods here...
  // Make sure to include initTeacherTestsChart, initTestPerformanceChart, etc.
  // with proper error handling as shown above
}
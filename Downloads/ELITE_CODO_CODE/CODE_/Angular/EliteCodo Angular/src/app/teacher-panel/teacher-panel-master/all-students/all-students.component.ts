import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
type MonthKey = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' |
  'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
interface StudentResult {
  id: any;
  subject: string;
  marks: number;
  total: number;
  grade: string;
  date: string;
  improvement: number;
}

interface Student {
  id: any,
  rollNo: string;
  name: string;
  class: string;
  average: number;
  status: string;
  attendance: number;
  expand: boolean;
  results: StudentResult[];
  trend: { month: string; score: number }[];
}

interface ChartData {
  month: string;
  average: number;
  attendance: number;
}
@Component({
  selector: 'app-all-students',
  templateUrl: './all-students.component.html',
  styleUrls: ['./all-students.component.scss']
})
export class AllStudentsComponent {
  searchText = '';
  loading = false;
  selectedClass = 'all';
  activateROut = inject(ActivatedRoute);

  boardName = this.activateROut.snapshot.paramMap.get('name');



  // Chart data with monthly performance averages
  // chartData = [
  //   { month: 'Jan', average: 82, attendance: 94 },
  //   { month: 'Feb', average: 85, attendance: 92 },
  //   { month: 'Mar', average: 88, attendance: 95 },
  //   { month: 'Apr', average: 84, attendance: 91 },
  //   { month: 'May', average: 89, attendance: 93 },
  //   { month: 'Jun', average: 86, attendance: 90 },
  //   { month: 'Jul', average: 90, attendance: 96 },
  //   { month: 'Aug', average: 87, attendance: 94 },
  //   { month: 'Sep', average: 91, attendance: 97 }, // Added September
  //   { month: 'Oct', average: 88, attendance: 95 }, // Added October
  //   { month: 'Nov', average: 85, attendance: 93 }, // Added November
  //   { month: 'Dec', average: 92, attendance: 98 }  // Added December
  // ];
  // Chart options for the main performance chart
  // Enhanced chart options with multiple series and better styling
  currentYear: number = new Date().getFullYear();
  // Extended students data
  students: any
  //  Student[] = [
  //   {
  //     id: 45,
  //     rollNo: '001',
  //     name: 'John Doe',
  //     class: 'X-A',
  //     average: 85,
  //     status: 'Excellent',
  //     attendance: 95,
  //     expand: false,
  //     trend: [
  //       { month: 'Jan', score: 82 },
  //       { month: 'Feb', score: 85 },
  //       { month: 'Mar', score: 88 },
  //       { month: 'Apr', score: 84 },
  //       { month: 'May', score: 89 }
  //     ],
  //     results: [
  //       {
  //         id: 5,
  //         subject: 'Mathematics',
  //         marks: 85,
  //         total: 100,
  //         grade: 'A',
  //         date: '2025-01-15',
  //         improvement: 5,
  //       },
  //       {
  //         id: 5,
  //         subject: 'Science',
  //         marks: 92,
  //         total: 100,
  //         grade: 'A+',
  //         date: '2025-01-16',
  //         improvement: 8,
  //       },
  //       {
  //         id: 5,
  //         subject: 'English',
  //         marks: 78,
  //         total: 100,
  //         grade: 'B+',
  //         date: '2025-01-17',
  //         improvement: 3,
  //       }
  //     ]
  //   },
  //   {
  //     id: 45,
  //     rollNo: '002',
  //     name: 'Emma Wilson',
  //     class: 'X-A',
  //     average: 92,
  //     status: 'Excellent',
  //     attendance: 98,
  //     expand: false,
  //     trend: [
  //       { month: 'Jan', score: 90 },
  //       { month: 'Feb', score: 92 },
  //       { month: 'Mar', score: 94 },
  //       { month: 'Apr', score: 91 },
  //       { month: 'May', score: 93 }
  //     ],
  //     results: [
  //       {
  //         id: 5,
  //         subject: 'Mathematics',
  //         marks: 95,
  //         total: 100,
  //         grade: 'A+',
  //         date: '2025-01-15',
  //         improvement: 7,
  //       },
  //       {
  //         id: 5,
  //         subject: 'Science',
  //         marks: 94,
  //         total: 100,
  //         grade: 'A+',
  //         date: '2025-01-16',
  //         improvement: 6,
  //       },
  //       {
  //         id: 5,
  //         subject: 'English',
  //         marks: 88,
  //         total: 100,
  //         grade: 'A',
  //         date: '2025-01-17',
  //         improvement: 4,
  //       }
  //     ]
  //   },
  //   {
  //     id: 45,
  //     rollNo: '003',
  //     name: 'Michael Chen',
  //     class: 'X-B',
  //     average: 78,
  //     status: 'Good',
  //     attendance: 88,
  //     expand: false,
  //     trend: [
  //       { month: 'Jan', score: 75 },
  //       { month: 'Feb', score: 77 },
  //       { month: 'Mar', score: 80 },
  //       { month: 'Apr', score: 79 },
  //       { month: 'May', score: 81 }
  //     ],
  //     results: [
  //       {
  //         id: 5,
  //         subject: 'Mathematics',
  //         marks: 82,
  //         total: 100,
  //         grade: 'B+',
  //         date: '2025-01-15',
  //         improvement: 4,
  //       },
  //       {
  //         id: 5,
  //         subject: 'Science',
  //         marks: 79,
  //         total: 100,
  //         grade: 'B',
  //         date: '2025-01-16',
  //         improvement: 3,
  //       },
  //       {
  //         id: 5,
  //         subject: 'English',
  //         marks: 85,
  //         total: 100,
  //         grade: 'A',
  //         date: '2025-01-17',
  //         improvement: 6,
  //       }
  //     ]
  //   },
  //   {
  //     id: 45,
  //     rollNo: '004',
  //     name: 'Sarah Johnson',
  //     class: 'X-B',
  //     average: 88,
  //     status: 'Excellent',
  //     attendance: 92,
  //     expand: false,
  //     trend: [
  //       { month: 'Jan', score: 86 },
  //       { month: 'Feb', score: 88 },
  //       { month: 'Mar', score: 89 },
  //       { month: 'Apr', score: 87 },
  //       { month: 'May', score: 90 }
  //     ],
  //     results: [
  //       {
  //         id: 5,
  //         subject: 'Mathematics',
  //         marks: 88,
  //         total: 100,
  //         grade: 'A',
  //         date: '2025-01-15',
  //         improvement: 5,
  //       },
  //       {
  //         id: 5,
  //         subject: 'Science',
  //         marks: 90,
  //         total: 100,
  //         grade: 'A+',
  //         date: '2025-01-16',
  //         improvement: 7,
  //       },
  //       {
  //         id: 5,
  //         subject: 'English',
  //         marks: 92,
  //         total: 100,
  //         grade: 'A+',
  //         date: '2025-01-17',
  //         improvement: 8,
  //       }
  //     ]
  //   },
  //   {
  //     id: 45,
  //     rollNo: '005',
  //     name: 'Alex Turner',
  //     class: 'X-A',
  //     average: 76,
  //     status: 'Average',
  //     attendance: 85,
  //     expand: false,
  //     trend: [
  //       { month: 'Jan', score: 73 },
  //       { month: 'Feb', score: 75 },
  //       { month: 'Mar', score: 78 },
  //       { month: 'Apr', score: 77 },
  //       { month: 'May', score: 79 }
  //     ],
  //     results: [
  //       {
  //         id: 4,
  //         subject: 'Mathematics',
  //         marks: 75,
  //         total: 100,
  //         grade: 'B',
  //         date: '2025-01-15',
  //         improvement: 3,
  //       },
  //       {
  //         id: 4,
  //         subject: 'Science',
  //         marks: 78,
  //         total: 100,
  //         grade: 'B',
  //         date: '2025-01-16',
  //         improvement: 4,
  //       },
  //       {
  //         id: 4,
  //         subject: 'English',
  //         marks: 80,
  //         total: 100,
  //         grade: 'B+',
  //         date: '2025-01-17',
  //         improvement: 5,
  //       }
  //     ]
  //   }
  // ];
  chartData = [
    { month: 'Jan', average: 0, attendance: 0 },
    { month: 'Feb', average: 0, attendance: 0 },
    { month: 'Mar', average: 0, attendance: 0 },
    { month: 'Apr', average: 0, attendance: 0 },
    { month: 'May', average: 0, attendance: 0 },
    { month: 'Jun', average: 0, attendance: 0 },
    { month: 'Jul', average: 0, attendance: 0 },
    { month: 'Aug', average: 0, attendance: 0 },
    { month: 'Sep', average: 0, attendance: 0 },
    { month: 'Oct', average: 0, attendance: 0 },
    { month: 'Nov', average: 0, attendance: 0 },
    { month: 'Dec', average: 0, attendance: 0 }
  ];

  // Initialize chartOption with the default configuration
  chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Class Average', 'Attendance Rate'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: this.chartData.map(item => item.month),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: [{
      type: 'value',
      name: 'Score',
      min: 0,
      max: 100,
      position: 'left',
      axisLabel: {
        formatter: '{value}%'
      }
    }],
    series: [{
      name: 'Class Average',
      type: 'line',
      data: this.chartData.map(item => item.average),
      smooth: true
    }, {
      name: 'Attendance Rate',
      type: 'bar',
      data: this.chartData.map(item => item.attendance)
    }]
  };

  isLoading = false;
  hasError = false;
  constructor(public http: HttpmethodsService, private router: Router) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.getAllChartData()
  }
  // bind year
  getAllChartData() {
    this.isLoading = true;
    this.hasError = false;

    this.http.getRequest(`api/teacherReport/monthly/${Number(sessionStorage.getItem('teacherId'))}?year=${this.currentYear}`).subscribe(
      (res: any) => {
        this.chartData = res;
        this.isLoading = false;

        // Regenerate chart options
        this.chartOption = {
          ...this.chartOption,
          xAxis: {
            ...this.chartOption.xAxis,
            data: this.chartData.map(item => item.month)
          },
          series: [{
            ...this.chartOption.series[0],
            data: this.chartData.map(item => item.average)
          }, {
            ...this.chartOption.series[1],
            data: this.chartData.map(item => item.attendance)
          }]
        };
      },
      (error) => {
        console.error('Error fetching chart data:', error);
        this.hasError = true;
        this.isLoading = false;
        this.chartData = [];
      }
    );
  }

  getStudentsData() {
    this.http.getRequest(`api/teacherReport/all-students?teacherId=${Number(sessionStorage.getItem('teacherId'))}`).subscribe(
      (response) => {
        console.log({ getStudentsData: response });
        this.students = response;
      })
  }

  // Computed properties to check data availability
  get hasChartData(): boolean {
    return this.chartData.length > 0 && this.chartData.some(item => item.average > 0 || item.attendance > 0);
  }


  loadDashboardData(): void {
    this.loading = true;
    this.getAllChartData();
    this.getStudentsData();
    this.loading = false;
  }

  get totalStudents(): number {
    return this.students.length;
  }


  get classAverage(): number {
    const total = this.chartData.reduce((sum, data) => sum + data.average, 0);
    return total / this.chartData.length;
  }

  get attendanceRate(): number {
    const total = this.chartData.reduce((sum, data) => sum + data.attendance, 0);
    return total / this.chartData.length;
  }


  // Format the values as strings (optional, if you want to display them as strings)
  get formattedClassAverage(): string {
    return this.classAverage.toFixed(0);
  }

  get formattedAttendanceRate(): string {
    return this.attendanceRate.toFixed(0);
  }

  getProgressStatus(value: number): 'success' | 'normal' | 'exception' {
    if (value >= 80) return 'success';
    if (value >= 60) return 'normal';
    return 'exception';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Excellent': 'green',
      'Good': 'blue',
      'Average': 'gold',
      'Poor': 'red'
    };
    return colors[status] || 'default';
  }

  getScoreColor(marks: number): string {
    if (marks >= 90) return 'success';
    if (marks >= 80) return 'processing';
    if (marks >= 60) return 'warning';
    return 'error';
  }

  getGradeColor(grade: string): string {
    const colors: { [key: string]: string } = {
      'A+': 'magenta',
      'A': 'green',
      'B+': 'cyan',
      'B': 'blue',
      'C': 'orange',
      'D': 'red'
    };
    return colors[grade] || 'default';
  }

  getSubjectIcon(subject: string): string {
    const icons: { [key: string]: string } = {
      'Mathematics': 'calculator',
      'Science': 'experiment',
      'English': 'read',
      'History': 'clock-circle',
      'Geography': 'global'
    };
    return icons[subject] || 'book';
  }

  refresh(): void {
    this.loadDashboardData();
  }

  getStudentChartOptions(student: Student): any {
    return {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: student.trend.map(t => t.month)
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: student.trend.map(t => t.score),
        type: 'line',
        smooth: true
      }]
    };
  }
  viewExamDetails(studentId: any): void {
    console.log({ studentId });


    this.router.navigate([`/teacher/${this.boardName}/student-wise-performance`, studentId]);
  }

  getTopSubjectScore(student: Student): number {
    return Math.max(...student.results.map(r => r.marks));
  }

  getAverageImprovement(student: Student): number {
    const improvements = student.results.map(r => r.improvement);
    return Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length);
  }


}

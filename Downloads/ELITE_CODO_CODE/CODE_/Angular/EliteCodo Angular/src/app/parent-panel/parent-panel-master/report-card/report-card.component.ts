// student-report-card.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import type { EChartsOption } from 'echarts';
interface Subject {
  name: string;
  marks: number;
  grade: string;
  teacher: string;
  remarks: string;
}

interface ReportCard {
  studentName: string;
  class: string;
  rollNumber: string;
  term: string;
  academicYear: string;
  subjects: Subject[];
  attendance: number;
  totalMarks: number;
  percentage: number;
  rank: number;
}

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss'],
})
export class ReportCardComponent implements OnInit {
  http = inject(HttpmethodsService);
  selectedTerm: string = 'First Term';
  Report: any = {
    studentName: '',
    class: '',
    rollNumber: '',
    term: '',
    academicYear: '',
    subjects: [],
    attendance: 0,
    totalMarks: 0,
    percentage: 0,
    rank: 0
  };
  // Chart options variables
  subjectChartOption!: EChartsOption;
  termChartOption!: EChartsOption;
  // Sample data for multiple terms
  termsList = ['First Term', 'Second Term', 'Third Term', 'Fourth Term'];

  allTermsData: { [key: string]: ReportCard } = {
    'First Term': {
      studentName: 'John Doe',
      class: 'X-A',
      rollNumber: '2024001',
      term: 'First Term',
      academicYear: '2023-2024',
      subjects: [
        {
          name: 'Mathematics',
          marks: 45,
          grade: 'A+',
          teacher: 'Mr. Smith',
          remarks: 'Excellent performance',
        },
        {
          name: 'Science',
          marks: 54,
          grade: 'A',
          teacher: 'Mrs. Johnson',
          remarks: 'Very good understanding',
        },
        {
          name: 'English',
          marks: 32,
          grade: 'A',
          teacher: 'Ms. Williams',
          remarks: 'Good communication skills',
        },
        {
          name: 'History',
          marks: 13,
          grade: 'B+',
          teacher: 'Mr. Davis',
          remarks: 'Shows improvement',
        },
        {
          name: 'Computer Science',
          marks: 52,
          grade: 'A+',
          teacher: 'Mrs. Brown',
          remarks: 'Outstanding performance',
        },
      ],
      attendance: 58,
      totalMarks: 196,
      percentage: 39.2,
      rank: 3,
    },
  };

  reportCard!: ReportCard;
  // Add loading state
  isLoading: boolean = false;
  // Chart data
  subjectWiseChartData!: any[];
  termWiseChartData!: any[];

  constructor() {
    this.reportCard = this.allTermsData[this.selectedTerm];
    this.updateChartData();
  }

  ngOnInit(): void {
    this.updateChartData();
    this.initializeCharts();
    this.GetSubjectWiseReport();
  }

  // Add animation options for charts
  chartAnimationDuration: number = 1000;

  onTermChange(term: string): void {
    this.isLoading = true;
    this.selectedTerm = term;
    this.reportCard = this.allTermsData[term];

    // Update data and reinitialize charts
    this.updateChartData();
    this.initializeCharts();

    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  updateChartData(): void {
    // Prepare subject-wise performance chart data
    this.subjectWiseChartData = this.reportCard.subjects.map((subject) => ({
      name: subject.name,
      value: subject.marks,
    }));

    // Prepare term-wise performance chart data
    // If we only have current term data, use that alone
    if (Object.keys(this.allTermsData).length === 1) {
      const termData = this.allTermsData[Object.keys(this.allTermsData)[0]];
      this.termWiseChartData = [{
        name: termData.term,
        percentage: termData.percentage,
        attendance: termData.attendance
      }];
    } else {
      this.termWiseChartData = Object.entries(this.allTermsData).map(
        ([term, data]) => ({
          name: term,
          percentage: data.percentage,
          attendance: data.attendance,
        })
      );
    }
  }

  initializeCharts(): void {
    // Initialize subject chart
    this.subjectChartOption = {
      animationDuration: 1000,
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
        data: this.subjectWiseChartData.map((item) => item.name),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          data: this.subjectWiseChartData.map((item) => item.value),
          type: 'bar',
          color: '#1890ff',
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              color: '#40a9ff',
            },
          },
        },
      ],
    };

    // Initialize term chart
    this.termChartOption = {
      animationDuration: 1000,
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Percentage', 'Attendance'],
        top: '0',
      },
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.termWiseChartData.map((item) => item.name),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Percentage',
          type: 'line',
          data: this.termWiseChartData.map((item) => item.percentage),
          color: '#52c41a',
          smooth: true,
          symbolSize: 8,
        },
        {
          name: 'Attendance',
          type: 'line',
          data: this.termWiseChartData.map((item) => item.attendance),
          color: '#1890ff',
          smooth: true,
          symbolSize: 8,
        },
      ],
    };
  }

  getGradeColor(grade: string): string {
    const gradeColors = {
      'A+': '#52c41a',
      A: '#73d13d',
      'B+': '#36cfc9',
      B: '#40a9ff',
      C: '#ffa940',
      D: '#ff4d4f',
    } as { [key: string]: string };
    return gradeColors[grade] || '#000000';
  }

  downloadReportCard(): void {
    console.log('Downloading report card...');
  }



  GetSubjectWiseReport() {
    let parentId = sessionStorage.getItem('parentId');
    this.isLoading = true;

    this.http.getRequest(`parent/getSubjectWiseReport/${parentId}`).subscribe(
      (res: any) => {
        this.Report = res; // Store the raw response

        // Transform the response to match your ReportCard interface
        const reportData: ReportCard = {
          studentName: res.studentName,
          class: res.studentClass,
          rollNumber: res.rollNumber,
          term: res.term || 'Current Term',
          academicYear: res.academicYear || '2023-2024',
          subjects: res.subjects,
          attendance: res.attendance,
          totalMarks: res.totalMarks,
          percentage: res.percentage,
          rank: res.rank
        };

        // Update the allTermsData
        this.allTermsData = {
          [reportData.term]: reportData
        };

        // Update current term and report cardfh
        this.selectedTerm = reportData.term;
        this.reportCard = reportData;

        // Update charts
        this.updateChartData();
        this.initializeCharts();

        this.isLoading = false;
      },
      (err) => {
        console.error('Error fetching report:', err);
        this.Report = null; // Clear previous data on error
        this.isLoading = false;
      }
    );
  }
}
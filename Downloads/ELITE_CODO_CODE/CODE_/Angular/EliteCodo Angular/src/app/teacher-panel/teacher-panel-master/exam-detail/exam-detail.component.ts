import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import * as echarts from 'echarts';
interface StudentResult {
  id: number;
  name: string;
  score: number;
  grade: string;
  status: 'Pass' | 'Fail';
  submissionTime: string;
  answers: {
    correct: number;
    incorrect: number;
    skipped: number;
  };
}

interface ExamDetail {
  duration: string;
  totalQuestions: number;
  passingScore: number;
  sections: {
    name: string;
    averageScore: number;
    questions: number;
  }[];
  studentResults: StudentResult[];
}

@Component({
  selector: 'app-exam-detail',
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('0.4s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ transform: 'translateY(20px)', opacity: 0 }),
          stagger(50, [
            animate('0.3s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ExamDetailComponent {
  http = inject(HttpmethodsService);
  examId: number = 0;
  examDetail: any = null;
  // Add to your component class
  selectedTab: 'overview' | 'students' | 'analysis' = 'overview';
  chartView: 'scores' | 'sections' | 'grades' | 'answers' = 'scores';

  // Add a class property for the timeout
  chartInitTimeout: any = null;

  constructor(private route: ActivatedRoute) {
    this.examId = this.route.snapshot.params['id'];
    // this.loadExamDetail();
  }
  ngOnInit() {
    this.loadExamDetail();
  }

  loadExamDetail() {
    // Mock data - replace with API call
    // this.examDetail = {
    //   "id": 123,
    //   "examName": "Mid-Term Mathematics",
    //   "subject": "Mathematics",
    //   "date": "2024-01-15",
    //   "duration": "2 hours",
    //   "totalStudents": 45,
    //   "passPercentage": 85,
    //   "averageScore": 72,
    //   "highestScore": 98,
    //   "status": "Completed",
    //   "totalQuestions": 50,
    //   "passingScore": 60,
    //   "sections": [
    //     {
    //       "name": "Algebra",
    //       "averageScore": 75,
    //       "questions": 20
    //     },
    //     {
    //       "name": "Geometry",
    //       "averageScore": 68,
    //       "questions": 15
    //     },
    //     {
    //       "name": "Trigonometry",
    //       "averageScore": 70,
    //       "questions": 15
    //     }
    //   ],
    //   "studentResults": [
    //     {
    //       "id": 1,
    //       "name": "John Doe 1",
    //       "score": 78,
    //       "grade": "C",
    //       "status": "Pass",
    //       "submissionTime": "2024-01-15 10:30 AM",
    //       "answers": {
    //         "correct": 39,
    //         "incorrect": 11,
    //         "skipped": 5
    //       }
    //     },
    //     {
    //       "id": 2,
    //       "name": "Jane Smith 2",
    //       "score": 85,
    //       "grade": "B",
    //       "status": "Pass",
    //       "submissionTime": "2024-01-15 10:30 AM",
    //       "answers": {
    //         "correct": 42,
    //         "incorrect": 7,
    //         "skipped": 3
    //       }
    //     }
    //   ]
    // }
    this.http.getRequest(`api/teacherReport/testReportByTeacherId/${this.examId}`).subscribe(
      (response: any) => {
        console.log({ response });
        this.examDetail = response;
        console.log('Success')
      },
      (error) => {
        // this.handleError(error);
      }
    );
  }


  // Add this method to watch for chartView changes
  onChartViewChange(view: 'scores' | 'sections' | 'grades' | 'answers') {
    this.chartView = view;

    // Clear any previous timeout to prevent multiple initializations
    if (this.chartInitTimeout) {
      clearTimeout(this.chartInitTimeout);
    }

    // Initialize the selected chart after a short delay
    this.chartInitTimeout = setTimeout(() => {
      switch (view) {
        case 'scores':
          this.initScoreDistributionChart();
          break;
        case 'grades':
          this.initGradeDistributionChart();
          break;
        case 'sections':
          this.initSectionComparisonChart();
          break;
        case 'answers':
          this.initAnswerAnalysisChart();
          break;
      }
    }, 100);
  }


  private calculateGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  ngAfterViewInit() {
    if (this.selectedTab === 'overview') {
      this.initSectionsChart();
    }
  }

  initSectionsChart() {
    if (!this.examDetail?.sections) return;

    setTimeout(() => {
      const chartDom = document.getElementById('sectionsChart');
      if (!chartDom) return;

      const myChart = echarts.init(chartDom);
      const option = {
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
          data: this.examDetail.sections.map((s: any) => s.name)
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          name: 'Average Score (%)'
        },
        series: [
          {
            name: 'Average Score',
            type: 'bar',
            data: this.examDetail.sections.map((s: any) => s.averageScore),
            itemStyle: {
              color: function (params: any) {
                const colorList = ['#6c5ce7', '#20bf6b', '#45aaf2'];
                return colorList[params.dataIndex % colorList.length];
              }
            }
          }
        ]
      };

      myChart.setOption(option);

      // Handle resize
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    }, 100);
  }

  // Add a watcher to initialize the chart when tab changes
  // Modify the onTabChange method
  onTabChange(tab: 'overview' | 'students' | 'analysis') {
    this.selectedTab = tab;

    if (tab === 'overview') {
      setTimeout(() => this.initSectionsChart(), 100);
    } else if (tab === 'analysis') {
      // When switching to analysis, only initialize the currently visible chart
      setTimeout(() => {
        this.onChartViewChange(this.chartView);
      }, 100);
    }
  }

  // In ngOnDestroy, clear any pending timeouts
  ngOnDestroy() {
    if (this.chartInitTimeout) {
      clearTimeout(this.chartInitTimeout);
    }
  }
  // Method to get data for answer analysis
  getAnswerAnalysisData() {
    if (!this.examDetail?.studentResults) return { labels: [], correctData: [], incorrectData: [], skippedData: [] };

    // Calculate the average number of correct, incorrect, and skipped answers
    const totalStudents = this.examDetail.studentResults.length;
    const correctSum = this.examDetail.studentResults.reduce((sum: number, student: any) =>
      sum + student.answers.correct, 0);
    const incorrectSum = this.examDetail.studentResults.reduce((sum: number, student: any) =>
      sum + student.answers.incorrect, 0);
    const skippedSum = this.examDetail.studentResults.reduce((sum: number, student: any) =>
      sum + student.answers.skipped, 0);

    return {
      correct: Math.round(correctSum / totalStudents),
      incorrect: Math.round(incorrectSum / totalStudents),
      skipped: Math.round(skippedSum / totalStudents)
    };
  }

  // Charts initialization methods
  initScoreDistributionChart() {
    const chartDom = document.getElementById('scoreDistributionChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const distribution = this.getScoreDistribution();

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100']
      },
      yAxis: {
        type: 'value',
        name: 'Number of Students'
      },
      series: [{
        name: 'Students',
        type: 'bar',
        data: distribution,
        itemStyle: {
          color: function (params: any) {
            // Color gradient from red to green based on score range
            const value = params.dataIndex;
            if (value < 5) return '#ef4444'; // Red for low scores
            if (value < 6) return '#f97316'; // Orange for borderline
            if (value < 8) return '#22c55e'; // Light green for passing
            return '#15803d'; // Dark green for high scores
          }
        }
      }]
    };

    myChart.setOption(option);
  }

  initGradeDistributionChart() {
    const chartDom = document.getElementById('gradeDistributionChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const gradeData = this.getGradeDistribution();

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: gradeData.map(item => item.grade)
      },
      series: [
        {
          name: 'Grade Distribution',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: gradeData.map(item => ({
            value: item.count,
            name: item.grade,
            itemStyle: {
              color: this.getGradeColor(item.grade)
            }
          }))
        }
      ]
    };

    myChart.setOption(option);
  }

  initSectionComparisonChart() {
    const chartDom = document.getElementById('sectionComparisonChart');
    if (!chartDom || !this.examDetail?.sections) return;

    const myChart = echarts.init(chartDom);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        name: 'Average Score (%)'
      },
      yAxis: {
        type: 'category',
        data: this.examDetail.sections.map((s: any) => s.name)
      },
      series: [
        {
          name: 'Average Score',
          type: 'bar',
          data: this.examDetail.sections.map((s: any) => s.averageScore),
          itemStyle: {
            color: function (params: any) {
              const colorList = ['#6c5ce7', '#20bf6b', '#45aaf2'];
              return colorList[params.dataIndex % colorList.length];
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%'
          }
        }
      ]
    };

    myChart.setOption(option);
  }

  initAnswerAnalysisChart() {
    const chartDom = document.getElementById('answerAnalysisChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const answerData = this.getAnswerAnalysisData();

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: ['Correct', 'Incorrect', 'Skipped']
      },
      series: [
        {
          name: 'Answer Analysis',
          type: 'pie',
          radius: '60%',
          center: ['50%', '45%'],
          data: [
            { value: answerData.correct, name: 'Correct', itemStyle: { color: '#20bf6b' } },
            { value: answerData.incorrect, name: 'Incorrect', itemStyle: { color: '#ef4444' } },
            { value: answerData.skipped, name: 'Skipped', itemStyle: { color: '#7f8c8d' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    };

    myChart.setOption(option);
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return '#20bf6b';
      case 'B': return '#45aaf2';
      case 'C': return '#fa8231';
      case 'D': return '#ef4444';
      case 'F': return '#be123c';
      default: return '#7f8c8d';
    }
  }





  getBestPerformingSection() {
    if (!this.examDetail?.sections || this.examDetail.sections.length === 0)
      return { name: 'N/A', averageScore: 0 };

    return this.examDetail.sections.reduce((best: any, current: any) =>
      current.averageScore > best.averageScore ? current : best,
      this.examDetail.sections[0]);
  }

  getWorstPerformingSection() {
    if (!this.examDetail?.sections || this.examDetail.sections.length === 0)
      return { name: 'N/A', averageScore: 0 };

    return this.examDetail.sections.reduce((worst: any, current: any) =>
      current.averageScore < worst.averageScore ? current : worst,
      this.examDetail.sections[0]);
  }

  getFailedStudentCount(): number {
    return this.getGradeDistribution().find(g => g.grade === 'F')?.count ?? 0;
  }






  getScoreDistribution(): number[] {
    if (!this.examDetail?.studentResults) return [];
    const distribution = Array(10).fill(0);
    this.examDetail.studentResults.forEach((result: any) => {
      const index = Math.min(Math.floor(result.score / 10), 9);
      distribution[index]++;
    });
    return distribution;
  }

  getGradeDistribution(): { grade: string; count: number }[] {
    if (!this.examDetail?.studentResults) return [];

    const grades = ['A', 'B', 'C', 'D', 'F'];
    const gradeCountMap = this.examDetail.studentResults.reduce((acc: Record<string, number>, r: any) => {
      if (grades.includes(r.grade)) {
        acc[r.grade] = (acc[r.grade] || 0) + 1;
      }
      return acc;
    }, {});

    return grades.map(grade => ({ grade, count: gradeCountMap[grade] || 0 }));
  }


  downloadReport() {
    console.log('Downloading report...');
  }

  exportResults() {
    console.log('Exporting results...');
  }
}
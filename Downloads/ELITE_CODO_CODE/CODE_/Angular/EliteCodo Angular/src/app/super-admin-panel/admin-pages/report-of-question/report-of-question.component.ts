// reports.component.ts
import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { trigger, transition, style, animate } from '@angular/animations';
import { ExamService } from 'src/app/share-services/ExamServices/exam.service';

@Component({
  selector: 'app-report-of-question',
  templateUrl: './report-of-question.component.html',
  styleUrls: ['./report-of-question.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])]
})
export class ReportOfQuestionComponent implements OnInit {
  // Active tab tracking
  activeTab: 'exam' | 'subject' | 'chapter' = 'exam';

  // Data for all charts
  examData: any[] = [];
  subjectData: any[] = [];
  chapterData: any[] = [];

  // Search terms for filtering
  examSearchTerm: string = '';
  subjectSearchTerm: string = '';
  chapterSearchTerm: string = '';

  // Chart types
  examChartType: 'bar' | 'pie' = 'bar';
  subjectChartType: 'bar' | 'pie' = 'pie';
  chapterChartType: 'bar' | 'pie' = 'bar';

  // ECharts options
  examChartOption: EChartsOption = {};
  subjectChartOption: EChartsOption = {};
  chapterChartOption: EChartsOption = {};

  // Colors for charts - enhanced color palette
  colorScheme = [
    '#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
    '#84cc16', '#3b82f6', '#eab308', '#22d3ee', '#a855f7'
  ];

  // Loading states
  loading = {
    exam: true,
    subject: true,
    chapter: true
  };

  // Selected filters
  selectedExam: string | null = null;
  selectedSubject: string | null = null;
  selectedExamName: string | null = null;
  selectedSubjectName: string | null = null;

  // Chart initialization options
  chartInitOpts = {
    renderer: 'canvas',
    width: 'auto',
    height: 'auto'
  };

  constructor(private examService: ExamService) { }

  ngOnInit(): void {
    this.loadExamData();
  }

  // Computed properties for filtered data
  get filteredExamData(): any[] {
    if (!this.examSearchTerm) return this.examData;
    return this.examData.filter(exam =>
      exam.name.toLowerCase().includes(this.examSearchTerm.toLowerCase())
    );
  }

  get filteredSubjectData(): any[] {
    if (!this.subjectSearchTerm) return this.subjectData;
    return this.subjectData.filter(subject =>
      subject.name.toLowerCase().includes(this.subjectSearchTerm.toLowerCase())
    );
  }

  get filteredChapterData(): any[] {
    if (!this.chapterSearchTerm) return this.chapterData;
    return this.chapterData.filter(chapter =>
      chapter.name.toLowerCase().includes(this.chapterSearchTerm.toLowerCase())
    );
  }

  loadExamData(): void {
    this.loading.exam = true;
    this.examService.getQuestionCountByExam().subscribe(data => {
      this.examData = data;
      this.updateExamChart();
      this.loading.exam = false;
    });
  }

  loadSubjectData(examId?: string): void {
    console.log({ examId });
    
    this.loading.subject = true;
    this.examService.getQuestionCountBySubject(examId).subscribe(data => {
      this.subjectData = data;
      this.updateSubjectChart();
      this.loading.subject = false;
    });
  }

  loadChapterData(subjectId?: string): void {
    console.log({ subjectId });

    this.loading.chapter = true;
    this.examService.getQuestionCountByChapter(subjectId).subscribe(data => {
      this.chapterData = data;
      this.updateChapterChart();
      this.loading.chapter = false;
    });
  }

  updateExamChart(): void {
    if (this.examChartType === 'bar') {
      this.updateExamBarChart();
    } else {
      this.updateExamPieChart();
    }
  }

  updateExamBarChart(): void {
    const names = this.examData.map(item => item.name);
    const values = this.examData.map(item => item.questionCount);

    this.examChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c} Questions'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          interval: 0,
          rotate: names.length > 5 ? 30 : 0,
          fontSize: 12,
          color: '#64748b'
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Questions',
        nameTextStyle: {
          color: '#64748b',
          fontSize: 12
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Questions',
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params) => {
              return this.colorScheme[params.dataIndex % this.colorScheme.length];
            },
            borderRadius: [5, 5, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            color: '#64748b'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.1)'
            }
          },
          animationDuration: 1500,
          animationEasing: 'elasticOut'
        }
      ]
    };
  }

  updateExamPieChart(): void {
    const data = this.examData.map(item => ({
      name: item.name,
      value: item.questionCount
    }));

    this.examChartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} Questions ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom',
        data: data.map(item => item.name),
        textStyle: {
          color: '#64748b',
          fontSize: 12
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
            fontSize: 12,
            color: '#64748b'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          data: data,
          color: this.colorScheme
        }
      ],
      animationDuration: 1500,
      animationEasing: 'cubicInOut'
    };
  }

  updateSubjectChart(): void {
    if (this.subjectChartType === 'pie') {
      this.updateSubjectPieChart();
    } else {
      this.updateSubjectBarChart();
    }
  }

  updateSubjectPieChart(): void {
    const data = this.subjectData.map(item => ({
      name: item.name,
      value: item.questionCount
    }));

    this.subjectChartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} Questions ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom',
        data: data.map(item => item.name),
        textStyle: {
          color: '#64748b',
          fontSize: 12
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
            fontSize: 12,
            color: '#64748b'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          data: data,
          color: this.colorScheme
        }
      ],
      animationDuration: 1500,
      animationEasing: 'cubicInOut'
    };
  }

  updateSubjectBarChart(): void {
    const names = this.subjectData.map(item => item.name);
    const values = this.subjectData.map(item => item.questionCount);

    this.subjectChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c} Questions'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          interval: 0,
          rotate: names.length > 5 ? 30 : 0,
          fontSize: 12,
          color: '#64748b'
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Questions',
        nameTextStyle: {
          color: '#64748b',
          fontSize: 12
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Questions',
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params) => {
              return this.colorScheme[params.dataIndex % this.colorScheme.length];
            },
            borderRadius: [5, 5, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            color: '#64748b'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.1)'
            }
          },
          animationDuration: 1500,
          animationEasing: 'elasticOut'
        }
      ]
    };
  }

  updateChapterChart(): void {
    if (this.chapterChartType === 'bar') {
      this.updateChapterBarChart();
    } else {
      this.updateChapterPieChart();
    }
  }

  updateChapterBarChart(): void {
    const names = this.chapterData.map(item => item.name);
    const values = this.chapterData.map(item => item.questionCount);

    this.chapterChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c} Questions'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          interval: 0,
          rotate: names.length > 5 ? 30 : 0,
          fontSize: 12,
          color: '#64748b'
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Questions',
        nameTextStyle: {
          color: '#64748b',
          fontSize: 12
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Questions',
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params) => {
              return this.colorScheme[params.dataIndex % this.colorScheme.length];
            },
            borderRadius: [5, 5, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            color: '#64748b'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.1)'
            }
          },
          animationDuration: 1500,
          animationEasing: 'elasticOut'
        }
      ]
    };
  }

  updateChapterPieChart(): void {
    const data = this.chapterData.map(item => ({
      name: item.name,
      value: item.questionCount
    }));

    this.chapterChartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} Questions ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom',
        data: data.map(item => item.name),
        textStyle: {
          color: '#64748b',
          fontSize: 12
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
            fontSize: 12,
            color: '#64748b'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          data: data,
          color: this.colorScheme
        }
      ],
      animationDuration: 1500,
      animationEasing: 'cubicInOut'
    };
  }

  // Navigation methods
  setActiveTab(tab: 'exam' | 'subject' | 'chapter'): void {
    this.activeTab = tab;
  }

  onExamSelect(examId: string, examName: string): void {
    this.selectedExam = examId;
    this.selectedExamName = examName;
    this.loadSubjectData(examId);
    this.setActiveTab('subject');
  }

  onSubjectSelect(subjectId: string, subjectName: string): void {
    this.selectedSubject = subjectId;
    this.selectedSubjectName = subjectName;
    this.loadChapterData(subjectId);
    this.setActiveTab('chapter');
  }

  // Toggle chart type
  toggleChartType(chartName: 'exam' | 'subject' | 'chapter'): void {
    if (chartName === 'exam') {
      this.examChartType = this.examChartType === 'bar' ? 'pie' : 'bar';
      this.updateExamChart();
    } else if (chartName === 'subject') {
      this.subjectChartType = this.subjectChartType === 'pie' ? 'bar' : 'pie';
      this.updateSubjectChart();
    } else {
      this.chapterChartType = this.chapterChartType === 'bar' ? 'pie' : 'bar';
      this.updateChapterChart();
    }
  }

  // Utility methods
  getTotalQuestions(data: any[]): number {
    return data.reduce((total, item) => total + item.questionCount, 0);
  }

  getTotalTopics(data: any[]): number {
    return data.reduce((total, item) => total + (item.topicCount || 0), 0);
  }

  getAverageQuestions(data: any[]): number {
    if (data.length === 0) return 0;
    const total = this.getTotalQuestions(data);
    return Math.round(total / data.length);
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getColorForIndex(index: number): string {
    return this.colorScheme[index % this.colorScheme.length];
  }
}
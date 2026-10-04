// exam-results.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { NzTableSortFn, NzTableFilterFn, NzTableFilterList } from 'ng-zorro-antd/table';
import { NzProgressStatusType } from 'ng-zorro-antd/progress';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface ExamResult {
  examId: string;
  examName: string;
  date: string;
  totalStudents: number;
  passPercentage: number;
  subjects: SubjectResult[];
}

interface SubjectResult {
  subjectName: string;
  passPercentage: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
}

@Component({
  selector: 'app-exam-wise',
  templateUrl: './exam-wise.component.html',
  styleUrls: ['./exam-wise.component.css']
})
export class ExamWiseComponent implements OnInit {
  http = inject(HttpmethodsService)
  examResults: ExamResult[] = [];
  selectedExam: ExamResult | null = null;
  isSubjectModalVisible = false;

  // Column definitions for the main exam table
  examListColumns = [
    {
      title: 'Exam Name',
      compare: (a: ExamResult, b: ExamResult) => a.examName.localeCompare(b.examName)
    },
    {
      title: 'Date',
      compare: (a: ExamResult, b: ExamResult) => a.date.localeCompare(b.date)
    },
    {
      title: 'Total Students',
      compare: (a: ExamResult, b: ExamResult) => a.totalStudents - b.totalStudents
    },
    {
      title: 'Pass %',
      compare: (a: ExamResult, b: ExamResult) => a.passPercentage - b.passPercentage
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Simulated data - replace with actual API call
    this.getExamWiseData();
  }

  getExamWiseData() {
    // Simulated API call - replace with actual API call
    this.http.getRequest(`api/teacherReport/getTeacherWiseTest/${sessionStorage.getItem('teacherId')}`).subscribe(
      (data: any) => {
        this.examResults = data;
      });
    // Simulated delay for demonstration purposes
    setTimeout(() => {
      this.examResults = this.examResults.map(exam => ({ ...exam }));
    }, 1000); // 1 second delay
  }



  showSubjectResults(exam: ExamResult): void {
    this.selectedExam = exam;
    this.isSubjectModalVisible = true;
  }

  handleModalCancel(): void {
    this.isSubjectModalVisible = false;
  }

  // Updated method to return the correct type
  getStatusColor(percentage: number): NzProgressStatusType {
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'normal';
    return 'exception';
  }
}
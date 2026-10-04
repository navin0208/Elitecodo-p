import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
export interface SubjectResult {
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'fail';
}

export interface ExamResult {
  id: string;
  name: string;
  date: string;
  semester: string;
  subjectResults: SubjectResult[];
  totalMarks: number;  // Sum of all subjects
  obtainedMarks: number;  // Sum of all subjects
  percentage: number;  // Overall percentage
  grade: string;  // Overall grade
  status: 'Pass' | 'fail';  // Overall status
}


@Component({
  selector: 'app-exam-result',
  templateUrl: './exam-result.component.html',
  styleUrls: ['./exam-result.component.scss']
})
export class ExamResultComponent implements OnInit {
  examResults: ExamResult[] = [];
  loading = true;
  selectedResult: ExamResult | null = null;
  isResultModalVisible = false;
  activateROut = inject(ActivatedRoute);
  route = inject(Router);
  constructor(
    public http: HttpmethodsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.fetchExamResults();
  }

  fetchExamResults(): void {

    // Replace with your actual API endpoint
    this.http.getRequest(`api/test/getAllTestResult/${sessionStorage.getItem('studentId')}`)
      .subscribe({
        next: (results: any) => {
          this.examResults = results;

          this.loading = false;
        },
        error: (error) => {
          this.message.error('Failed to load exam results. Please try again later.');
          this.loading = false;
          console.error('Error fetching exam results:', error);
        }
      });
  }

  viewResult(result: ExamResult): void {
    console.log({ result });
    this.selectedResult = result;

    this.isResultModalVisible = true;

    const boardName = this.activateROut.snapshot.paramMap.get('name');
  }

  handleModalCancel(): void {
    this.isResultModalVisible = false;
  }

  getStatusColor(status: 'Pass' | 'fail'): string {
    return status === 'Pass' ? 'green' : 'red';
  }
  routTOOverlookofExam(result: ExamResult) {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigate(
      [`/student/${boardName}/exam-overlook`], { queryParams: { testID: `${result.id}` } }
    );
  }

  seeImportantQuestions(result: any) {
    console.log('Important questions for:', result);
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.route.navigate(
      [`/student/${boardName}/important-questions`], { queryParams: { testID: `${result.id}` } }
    );
  }


}

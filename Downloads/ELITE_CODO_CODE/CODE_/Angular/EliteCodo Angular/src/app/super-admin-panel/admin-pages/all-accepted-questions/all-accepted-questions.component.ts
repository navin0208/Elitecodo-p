import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { TYPE } from 'src/app/shared/AllModel';

@Component({
  selector: 'app-all-accepted-questions',
  templateUrl: './all-accepted-questions.component.html',
  styleUrls: ['./all-accepted-questions.component.scss', '../../../../assets/css/loading.css']
})
export class AllAcceptedQuestionsComponent implements OnInit {
  http = inject(HttpmethodsService)
  loading: boolean = false; // Loading state
  errorMsg: boolean = false;
  noQuestions!: boolean;

  order!: string;
  teacherId: any;
  typeIcon = TYPE.SUCCESS;
  questions: any;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;

  get paginatedQuestions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.questions.slice(startIndex, endIndex);
  }

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getTeacherQuestions();
  }

  getTeacherQuestions() {
    this.loading = true; // Start loading
    this.http.getRequest(`api/question/getAllByStatus/Accepted`).subscribe(
      (res) => {
        this.questions = res;
        this.errorMsg = false;
        this.loading = false; // Data loaded
        this.noQuestions = this.questions.length === 0;
        if (this.questions.length === 0) {
          this.noQuestions = true; // No questions found
        } else {
          this.noQuestions = false; // Questions found
        }
        console.log({ getTeacherQuestions: res });
      },
      (error) => {
        this.errorMsg = true;
        this.loading = false;
      })
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(itemsCount: number): void {
    this.itemsPerPage = itemsCount;
    this.currentPage = 1; // Reset to first page when changing items per page
  }
  isCorrectAnswer(multiAnswers: string[], optionNumber: number): boolean {
    return multiAnswers.some(answer => {
      // Handle both "Option X" format and "optionX" format
      if (answer.startsWith('Option ')) {
        return parseInt(answer.replace('Option ', '')) === optionNumber;
      }
      return answer === `option${optionNumber}`;
    });
  }

}

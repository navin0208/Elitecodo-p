import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { TYPE } from 'src/app/shared/AllModel';
import {
  deleteQuestion,
  getQuestionBygetByUserId,
} from 'src/app/shared/allURL';
import swal from 'sweetalert2';
@Component({
  selector: 'app-status-wise-questions',
  templateUrl: './status-wise-questions.component.html',
  styleUrls: [
    './status-wise-questions.component.css',
    '../../../../assets/css/loading.css',
  ],
})
export class StatusWiseQuestionsComponent implements OnInit {
  http = inject(HttpmethodsService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  teacherId: any;
  loading: boolean = false; // Loading state
  errorMsg: boolean = false;
  noQuestions!: boolean;
  questionStatus: any;
  questions: any;
  typeIcon = TYPE.SUCCESS;
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  get paginatedQuestions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.questions.slice(startIndex, endIndex);
  }
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.teacherId = params['teacherId'];
      this.questionStatus = params['status'];
      console.log({ teacherIdFromQueryParams: this.teacherId });
      if (this.teacherId) {
        this.getTeacherQuestions(this.teacherId, this.questionStatus);
      }
    });
  }
  getTeacherQuestions(teacherId: string, questionStatus: String) {
    this.loading = true; // Start loading
    this.http
      .getRequest(`${getQuestionBygetByUserId}/${teacherId}/${questionStatus}`)
      .subscribe(
        (res) => {
          console.log({ getTeacherQuestions: res });
          this.questions = res;
          this.errorMsg = false;
          this.loading = false; // Data loaded
          this.noQuestions = this.questions.length === 0;
          if (this.questions.length === 0) {
            this.noQuestions = true; // No questions found
          } else {
            this.noQuestions = false; // Questions found
          }
        },
        (error) => {
          this.errorMsg = true;
          this.loading = false; // Error occurred, stop loading
        }
      );
  }
  onPageChange(page: number): void {
    this.currentPage = page;
  }
  onItemsPerPageChange(itemsCount: number): void {
    this.itemsPerPage = itemsCount;
    this.currentPage = 1; // Reset to first page when changing items per page
  }
  isCorrectAnswer(multiAnswers: string[], optionNumber: number): boolean {
    return multiAnswers.some((answer) => {
      // Handle both "Option X" format and "optionX" format
      if (answer.startsWith('Option ')) {
        return parseInt(answer.replace('Option ', '')) === optionNumber;
      }
      return answer === `option${optionNumber}`;
    });
  }
  deleteQuestion(questionId: any) {
    swal
      .fire({
        title: 'Are you sure you want to delete this Question.?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085D6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          console.log({ questionId });
          this.http.deleteRequest(deleteQuestion, questionId).subscribe(
            (res) => {
              console.log({ res });
              this.getTeacherQuestions(this.teacherId, this.questionStatus);
              swal.fire({
                title: 'Deleted!',
                text: `"Your file has been deleted."`,
                icon: 'success',
              });
            },
            (err: any) => {
              swal.fire({
                text: 'Something went wrong !!!',
                icon: 'warning',
              });
            }
          );
        }
      });
  }
}

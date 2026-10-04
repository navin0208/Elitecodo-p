// import { Component, inject, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
// import { TYPE } from 'src/app/shared/AllModel';
// import {
//   acceptorrejectquestionURL,
//   deleteQuestion,
//   getQuestionBygetByUserId,
// } from 'src/app/shared/allURL';
// import swal from 'sweetalert2';
// import { MainURL } from 'src/app/ConfigUrl/config';

// @Component({
//   selector: 'app-question-status',
//   templateUrl: './question-status.component.html',
//   styleUrls: [
//     './question-status.component.css',
//     '../../../../assets/css/loading.css',
//   ],
// })
// export class QuestionStatusComponent implements OnInit {
//   http = inject(HttpmethodsService);
//   loading: boolean = false;
//   errorMsg: boolean = false;
//   noQuestions!: boolean;

//   teacherId: any;
//   questions: any;
//   currentPage = 1;
//   itemsPerPage = 5;

//   get paginatedQuestions() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     return this.questions.slice(startIndex, endIndex);
//   }

//   constructor(private route: ActivatedRoute) { }

//   ngOnInit(): void {
//     this.route.queryParams.subscribe((params) => {
//       this.teacherId = params['teacherId'];
//       if (this.teacherId) {
//         this.getTeacherQuestions(this.teacherId);
//       }
//     });
//   }

//   getTeacherQuestions(teacherId: string) {
//     this.loading = true;
//     this.http
//       .getRequest(`${getQuestionBygetByUserId}/${teacherId}/pending`)
//       .subscribe(
//         (res: any) => {
//           // ✅ check if data exists and is an array
//           const questions = Array.isArray(res.data) ? res.data : res;

//           this.questions = questions.map((q: any) => ({
//             ...q,
//             yearOfAppearance: q.yearOfAppearance || 'NA',
//             chapterName: q.chapterName || 'NA',
//             questionLevel: q.questionLevel || 'NA',
//             questionType: q.questionType || 'NA',
//             patternName: q.patternName || 'NA',
//             topicName: q.topicName || 'NA',
//             subTopicName: q.subTopicName || 'NA',
//             standardName: q.standardName || 'NA',
//             solution: q.solution || 'NA'
//           }));

//           this.errorMsg = false;
//           this.loading = false;
//           this.noQuestions = this.questions.length === 0;
//         },
//         (error) => {
//           this.errorMsg = true;
//           this.loading = false;
//         }
//       );
//   }

//   onPageChange(page: number): void {
//     this.currentPage = page;
//   }

//   onItemsPerPageChange(itemsCount: number): void {
//     this.itemsPerPage = itemsCount;
//     this.currentPage = 1;
//   }

//   isCorrectAnswer(multiAnswers: string[], optionNumber: number): boolean {
//     if (!multiAnswers || !Array.isArray(multiAnswers)) return false;

//     return multiAnswers.some((answer) => {
//       if (answer.startsWith('Option ')) {
//         return parseInt(answer.replace('Option ', '')) === optionNumber;
//       }
//       return answer === `option${optionNumber}`;
//     });
//   }

//   getCorrectAnswers(multiAnswers: string[]): string {
//     if (!multiAnswers || !Array.isArray(multiAnswers) || multiAnswers.length === 0) {
//       return 'Not specified';
//     }

//     const answers = multiAnswers.map(answer => {
//       if (answer.startsWith('option')) {
//         const num = answer.replace('option', '');
//         return String.fromCharCode(64 + parseInt(num)); // Convert 1->A, 2->B, etc.
//       } else if (answer.startsWith('Option ')) {
//         const num = answer.replace('Option ', '');
//         return String.fromCharCode(64 + parseInt(num));
//       }
//       return answer;
//     });

//     return answers.join(', ');
//   }

//   rejecteQuestion(questionId: any) {
//     swal
//       .fire({
//         title: 'Are you sure you want to reject this Question?',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, reject it!',
//       })
//       .then((result) => {
//         if (result.isConfirmed) {
//           this.http
//             .getRequest(`${acceptorrejectquestionURL}/${questionId}/Reject`)
//             .subscribe(
//               (res) => {
//                 this.getTeacherQuestions(this.teacherId);
//                 swal.fire({
//                   title: 'Rejected!',
//                   text: 'The question has been rejected.',
//                   icon: 'success',
//                 });
//               },
//               () => {
//                 swal.fire({
//                   text: 'Something went wrong !!!',
//                   icon: 'warning',
//                 });
//               }
//             );
//         }
//       });
//   }

//   deleteQuestion(questionId: any) {
//     swal
//       .fire({
//         title: 'Are you sure you want to delete this Question?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!',
//       })
//       .then((result) => {
//         if (result.isConfirmed) {
//           this.http.deleteRequest(deleteQuestion, questionId).subscribe(
//             () => {
//               this.getTeacherQuestions(this.teacherId);
//               swal.fire({
//                 title: 'Deleted!',
//                 text: 'The question has been deleted.',
//                 icon: 'success',
//               });
//             },
//             () => {
//               swal.fire({
//                 text: 'Something went wrong !!!',
//                 icon: 'warning',
//               });
//             }
//           );
//         }
//       });
//   }

//   acceptQuestion(questionId: number): void {
//     this.http
//       .getRequest(`${acceptorrejectquestionURL}/${questionId}/Accept`)
//       .subscribe(
//         () => {
//           this.getTeacherQuestions(this.teacherId);
//           swal.fire({
//             title: 'Success!',
//             text: 'Question successfully approved.',
//             icon: 'success',
//           });
//         },
//         () => {
//           swal.fire({
//             text: 'Something went wrong !!!',
//             icon: 'warning',
//           });
//         }
//       );
//   }

//   editQuestion(questionId: number): void {
//     window.location.href = `${MainURL.ReactWeb}/view-question?questionId=${questionId}`;
//   }
// }

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpmethodsService } from
  'src/app/share-services/httpMethodService/httpmethods.service';
import {
  acceptorrejectquestionURL,
  deleteQuestion,
  getQuestionBygetByUserId,
} from 'src/app/shared/allURL';
import swal from 'sweetalert2';
import { MainURL } from
  'src/app/ConfigUrl/config';
@Component({
  selector: 'app-question-status',
  templateUrl:
    './question-status.component.html',
  styleUrls: [
    './question-status.component.css',
    '../../../../assets/css/loading.css',
  ],
})
export class QuestionStatusComponent
  implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================
  http = inject(HttpmethodsService);
  // =========================================================
  // VARIABLES
  // =========================================================
  loading: boolean = false;
  errorMsg: boolean = false;
  noQuestions: boolean = false;
  teacherId: string | null = null;
  questions: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  // =========================================================
  // CONSTRUCTOR
  // =========================================================
  constructor(
    private route: ActivatedRoute
  ) {}
  // =========================================================
  // PAGINATION
  // =========================================================
  get paginatedQuestions(): any[] {
    const startIndex =
      (this.currentPage - 1) *
      this.itemsPerPage;
    const endIndex =
      startIndex +
      this.itemsPerPage;
    return this.questions.slice(
      startIndex,
      endIndex
    );
  }
  // =========================================================
  // ON INIT
  // =========================================================
  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params) => {
        const teacherId =
          params['teacherId'];
        console.log(
          'Teacher ID from Angular URL:',
          teacherId
        );
        if (teacherId) {
          this.teacherId =
            String(teacherId);
          this.getTeacherQuestions(
            this.teacherId
          );
        } else {
          console.error(
            'Teacher ID not found in URL'
          );
          this.teacherId = null;
          this.questions = [];
          this.noQuestions = true;
          this.errorMsg = true;
        }
      }
    );
  }
  // =========================================================
  // GET TEACHER PENDING QUESTIONS
  // =========================================================
  getTeacherQuestions(
    teacherId: string
  ): void {
    if (!teacherId) {
      return;
    }
    this.loading = true;
    this.errorMsg = false;
    this.noQuestions = false;
    this.http
      .getRequest(
        `${getQuestionBygetByUserId}/${teacherId}/pending`
      )
      .subscribe({
        next: (res: any) => {
          console.log(
            'Teacher Questions Response:',
            res
          );
          /*
           * Backend may return:
           *
           * [...]
           *
           * OR
           *
           * {
           *   data: [...]
           * }
           */
          const questionData =
            Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
              ? res
              : [];
          this.questions =
            questionData.map(
              (q: any) => ({
                ...q,
                yearOfAppearance:
                  q.yearOfAppearance ||
                  'NA',
                chapterName:
                  q.chapterName ||
                  'NA',
                questionLevel:
                  q.questionLevel ||
                  'NA',
                questionType:
                  q.questionType ||
                  'NA',
                patternName:
                  q.patternName ||
                  'NA',
                topicName:
                  q.topicName ||
                  'NA',
                subTopicName:
                  q.subTopicName ||
                  'NA',
                standardName:
                  q.standardName ||
                  'NA',
                solution:
                  q.solution ||
                  'NA',
              })
            );
          this.currentPage = 1;
          this.errorMsg = false;
          this.noQuestions =
            this.questions.length === 0;
          this.loading = false;
        },
        error: (error: any) => {
          console.error(
            'Get Teacher Questions Error:',
            error
          );
          this.questions = [];
          this.errorMsg = true;
          this.noQuestions = true;
          this.loading = false;
        },
      });
  }
  // =========================================================
  // PAGE CHANGE
  // =========================================================
  onPageChange(
    page: number
  ): void {
    if (page < 1) {
      return;
    }
    this.currentPage = page;
  }
  // =========================================================
  // ITEMS PER PAGE
  // =========================================================
  onItemsPerPageChange(
    itemsCount: number
  ): void {
    if (!itemsCount) {
      return;
    }
    this.itemsPerPage =
      Number(itemsCount);
    this.currentPage = 1;
  }
  // =========================================================
  // CHECK CORRECT ANSWER
  // =========================================================
  isCorrectAnswer(
    multiAnswers: string[],
    optionNumber: number
  ): boolean {
    if (
      !multiAnswers ||
      !Array.isArray(multiAnswers)
    ) {
      return false;
    }
    return multiAnswers.some(
      (answer: string) => {
        if (!answer) {
          return false;
        }
        /*
         * Supports:
         *
         * Option 1
         * Option 2
         *
         * AND
         *
         * option1
         * option2
         */
        if (
          answer.startsWith(
            'Option '
          )
        ) {
          const number =
            parseInt(
              answer.replace(
                'Option ',
                ''
              ),
              10
            );
          return (
            number === optionNumber
          );
        }
        return (
          answer.toLowerCase() ===
          `option${optionNumber}`
        );
      }
    );
  }
  // =========================================================
  // GET CORRECT ANSWERS
  // =========================================================
  getCorrectAnswers(
    multiAnswers: string[]
  ): string {
    if (
      !multiAnswers ||
      !Array.isArray(multiAnswers) ||
      multiAnswers.length === 0
    ) {
      return 'Not specified';
    }
    const answers =
      multiAnswers.map(
        (answer: string) => {
          if (!answer) {
            return '';
          }
          /*
           * option1 -> A
           * option2 -> B
           * option3 -> C
           * option4 -> D
           */
          if (
            answer
              .toLowerCase()
              .startsWith('option') &&
            !answer.includes(' ')
          ) {
            const num =
              answer
                .toLowerCase()
                .replace(
                  'option',
                  ''
                );
            const parsedNumber =
              parseInt(num, 10);
            if (
              !isNaN(
                parsedNumber
              )
            ) {
              return String.fromCharCode(
                64 +
                parsedNumber
              );
            }
          }
          /*
           * Option 1 -> A
           */
          if (
            answer.startsWith(
              'Option '
            )
          ) {
            const num =
              answer.replace(
                'Option ',
                ''
              );
            const parsedNumber =
              parseInt(num, 10);
            if (
              !isNaN(
                parsedNumber
              )
            ) {
              return String.fromCharCode(
                64 +
                parsedNumber
              );
            }
          }
          return answer;
        }
      );
    return answers
      .filter(Boolean)
      .join(', ');
  }
  // =========================================================
  // REJECT QUESTION
  // =========================================================
  rejecteQuestion(
    questionId: number
  ): void {
    if (!questionId) {
      return;
    }
    swal
      .fire({
        title:
          'Are you sure you want to reject this Question?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor:
          '#3085d6',
        cancelButtonColor:
          '#d33',
        confirmButtonText:
          'Yes, reject it!',
      })
      .then((result) => {
        if (
          !result.isConfirmed
        ) {
          return;
        }
        this.http
          .getRequest(
            `${acceptorrejectquestionURL}/${questionId}/Reject`
          )
          .subscribe({
            next: () => {
              if (
                this.teacherId
              ) {
                this.getTeacherQuestions(
                  this.teacherId
                );
              }
              swal.fire({
                title:
                  'Rejected!',
                text:
                  'The question has been rejected.',
                icon:
                  'success',
              });
            },
            error: (
              error: any
            ) => {
              console.error(
                'Reject Question Error:',
                error
              );
              swal.fire({
                text:
                  'Something went wrong !!!',
                icon:
                  'warning',
              });
            },
          });
      });
  }
  // =========================================================
  // DELETE QUESTION
  // =========================================================
  deleteQuestion(
    questionId: number
  ): void {
    if (!questionId) {
      return;
    }
    swal
      .fire({
        title:
          'Are you sure you want to delete this Question?',
        text:
          "You won't be able to revert this!",
        icon:
          'warning',
        showCancelButton:
          true,
        confirmButtonColor:
          '#3085d6',
        cancelButtonColor:
          '#d33',
        confirmButtonText:
          'Yes, delete it!',
      })
      .then((result) => {
        if (
          !result.isConfirmed
        ) {
          return;
        }
        this.http
          .deleteRequest(
            deleteQuestion,
            questionId
          )
          .subscribe({
            next: () => {
              if (
                this.teacherId
              ) {
                this.getTeacherQuestions(
                  this.teacherId
                );
              }
              swal.fire({
                title:
                  'Deleted!',
                text:
                  'The question has been deleted.',
                icon:
                  'success',
              });
            },
            error: (
              error: any
            ) => {
              console.error(
                'Delete Question Error:',
                error
              );
              swal.fire({
                text:
                  'Something went wrong !!!',
                icon:
                  'warning',
              });
            },
          });
      });
  }
  // =========================================================
  // ACCEPT QUESTION
  // =========================================================
  acceptQuestion(
    questionId: number
  ): void {
    if (!questionId) {
      return;
    }
    this.http
      .getRequest(
        `${acceptorrejectquestionURL}/${questionId}/Accept`
      )
      .subscribe({
        next: () => {
          if (
            this.teacherId
          ) {
            this.getTeacherQuestions(
              this.teacherId
            );
          }
          swal.fire({
            title:
              'Success!',
            text:
              'Question successfully approved.',
            icon:
              'success',
          });
        },
        error: (
          error: any
        ) => {
          console.error(
            'Accept Question Error:',
            error
          );
          swal.fire({
            text:
              'Something went wrong !!!',
            icon:
              'warning',
          });
        },
      });
  }
  // =========================================================
  // EDIT QUESTION
  // =========================================================
  editQuestion(
    questionId: number
  ): void {
    console.log(
      'Edit Question ID:',
      questionId
    );
    console.log(
      'Teacher ID:',
      this.teacherId
    );
    if (!questionId) {
      console.error(
        'Question ID is missing'
      );
      swal.fire({
        text:
          'Question ID is missing.',
        icon:
          'warning',
      });
      return;
    }
    if (!this.teacherId) {
      console.error(
        'Teacher ID is missing'
      );
      swal.fire({
        text:
          'Teacher ID is missing.',
        icon:
          'warning',
      });
      return;
    }
    /*
     * IMPORTANT
     *
     * Example:
     *
     * Angular:
     * teacherId = 71
     * questionId = 923
     *
     * Opens React:
     *
     * http://localhost:3000/
     * edit-question/923?teacherId=71
     */
    const reactUrl =
      `${MainURL.ReactWeb}` +
      `/edit-question/${questionId}` +
      `?teacherId=${encodeURIComponent(
        this.teacherId
      )}`;
    console.log(
      'Opening React URL:',
      reactUrl
    );
    window.location.href =
      reactUrl;
  }
}
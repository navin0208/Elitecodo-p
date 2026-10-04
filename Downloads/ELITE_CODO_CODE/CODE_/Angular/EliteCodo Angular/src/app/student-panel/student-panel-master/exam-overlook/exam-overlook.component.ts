import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
interface ExamQuestion {
  questionNumber: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  timeSpentSeconds: string;
  marks: number;
  [key: string]: any; // Add this if you expect more dynamic keys
  answered: boolean;
  multiAnswers: string[];  // Correct answers
  userSelectedOptions?: string[];  // User's selected answers
  explanation?: string;
}
@Component({
  selector: 'app-exam-overlook',
  templateUrl: './exam-overlook.component.html',
  styleUrls: ['./exam-overlook.component.scss']
})
export class ExamOverlookComponent implements OnInit {

  loading: boolean = false; // Loading state
  errorMsg: boolean = false;
  http = inject(HttpmethodsService)
  questions: ExamQuestion[] = [];
  paginatedQuestions: ExamQuestion[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  testID: any;
  // data = {
  //   "testId": 59,
  //   "testName": "shubham",
  //   "testDate": "2025-02-17T00:00:00.000+00:00",
  //   "startTime": "21:00:00",
  //   "endTime": "23:25:00",
  //   "marks": null,
  //   "questionResponses": [
  //     {
  //       "questionNumber": 63,
  //       "question": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Which of the following is obtained as product when ethylene reacts with oxygen in presence of&nbsp;&nbsp;<img alt=\"\" height=\"15\" src=\"http://res.cloudinary.com/dyc6cau0j/image/upload/v1732966107/ghkykn9yau5hjf7jknwk.png\" width=\"52\" />&nbsp;?&nbsp;</p>\n",
  //       "option1": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Acetaldehyde</p>\n",
  //       "option2": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Methane</p>\n",
  //       "option3": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Methyl alcohol</p>\n",
  //       "option4": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Acetic acid</p>\n",
  //       "marks": 3,
  //       "answered": false,
  //       "multiAnswers": [
  //         "option4",
  //       ],
  //       "userSelectedOptions": [
  //         "option2"
  //       ],
  //     },
  //     {
  //       "questionNumber": 65,
  //       "question": "<p>Animals which lack any specialized organs of excretion are .</p>\n",
  //       "option1": "<p>crustaceans</p>\n",
  //       "option2": "<p>annelids</p>\n",
  //       "option3": "<p>molluscs</p>\n",
  //       "option4": "<p>echinoderms</p>\n",
  //       "marks": 4,
  //       "answered": false,
  //       "multiAnswers": [
  //         "option4"
  //       ],
  //       "userSelectedOptions": [
  //         "option2"
  //       ],
  //     },
  //     {
  //       "questionNumber": 66,
  //       "question": "<p>Match lipids given in Column I with their occurance in Column II</p>\n\n<table cellspacing=\"0\" style=\"border-collapse:collapse; width:341px\">\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:1px solid black; height:20px; text-align:left; vertical-align:middle; white-space:nowrap; width:106px\">Column I</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:1px solid black; text-align:left; vertical-align:middle; white-space:nowrap; width:29px\">&nbsp;</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:1px solid black; text-align:center; vertical-align:middle; white-space:nowrap; width:206px\">Column II</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; height:20px; text-align:left; vertical-align:middle; white-space:nowrap\">Cerebrosides</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">a.</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Most of the cells in animal body</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; height:20px; text-align:left; vertical-align:middle; white-space:nowrap\">Waxes</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">b.</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Dioscores</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; height:20px; text-align:left; vertical-align:middle; white-space:nowrap\">Diosgenin</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">c.</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Myelin sheath</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; height:20px; text-align:left; vertical-align:middle; white-space:nowrap\">Cholesterol</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">d.</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Sebaceous glands of the skin</td>\n\t\t</tr>\n\t</tbody>\n</table>\n",
  //       "option1": "<p>i - c, ii - d, iii - a, iv - b</p>\n",
  //       "option2": "<p>i - b, ii - c, iii - d, iv - a</p>\n",
  //       "option3": "<p>i - d, ii - c, iii - a, iv - b</p>\n",
  //       "option4": "<p>i - c, ii - d, iii - b, iv a</p>\n",
  //       "marks": 4,
  //       "answered": false,
  //       "multiAnswers": [
  //         "option4"
  //       ],
  //       "userSelectedOptions": [
  //         "option3"
  //       ],
  //     },
  //     {
  //       "questionNumber": 67,
  //       "question": "<p>Match types of enzymes in Column I with examples in Column II and select the correct option.</p>\n\n<p>Column I&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Column II</p>\n\n<p>A. Purely proteinaceous enzymeI.&nbsp; &nbsp;I glucokinase</p>\n\n<p>B. Organic co-enzyme&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; II. epimerase</p>\n\n<p>C. Transferase enzyme&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; III. protease</p>\n\n<p>D. Isomerase enzyme&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; IV. FMN</p>\n",
  //       "option1": "<p>A - I, B - II, C - III, D - IV</p>\n",
  //       "option2": "<p>A - III, B - IV, C - I, D - II</p>\n",
  //       "option3": "<p>A - II, B - I, C - III, D - IV</p>\n",
  //       "option4": "<p>A - III, B - IV, C - II, D - I</p>\n",
  //       "marks": 4,
  //       "answered": false,
  //       "multiAnswers": [
  //         "option2"
  //       ],
  //       "userSelectedOptions": [
  //         "option2"
  //       ],
  //     },
  //     {
  //       "questionNumber": 68,
  //       "question": "<p>In the following diagram of T.S. of pancreas, identify &#39; A &#39; and &#39; <em>B</em>&nbsp;&#39;.</p>\n\n<p><img alt=\"\" height=\"119\" src=\"http://res.cloudinary.com/dyc6cau0j/image/upload/v1732969753/r5fbku1zx8o8yjlfwvwq.jpg\" width=\"200\" / style=\"display:inline;\"></p>\n\n<table cellspacing=\"0\" style=\"border-collapse:collapse; width:292px\">\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:1px solid black; border-right:1px solid black; border-top:1px solid black; height:20px; text-align:left; vertical-align:middle; white-space:nowrap; width:64px\">&nbsp;</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:1px solid black; text-align:center; vertical-align:middle; white-space:nowrap; width:106px\">A</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:1px solid black; text-align:center; vertical-align:middle; white-space:nowrap; width:121px\">B</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td rowspan=\"2\" style=\"border-bottom:1px solid black; border-left:1px solid black; border-right:1px solid black; border-top:none; height:40px; text-align:left; vertical-align:middle; white-space:nowrap\">(A)</td>\n\t\t\t<td rowspan=\"2\" style=\"border-bottom:1px solid black; border-left:1px solid black; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Acinar cells</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; vertical-align:top; white-space:nowrap\">Cells of Islets of</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; height:20px; vertical-align:top; white-space:nowrap\">Langerhans</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:1px solid black; border-right:1px solid black; border-top:none; height:20px; text-align:left; vertical-align:middle; white-space:nowrap\">(B)</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Goblet cells</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; vertical-align:top; white-space:nowrap\">C-cells</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:1px solid black; border-right:1px solid black; border-top:none; height:20px; text-align:left; vertical-align:middle; white-space:nowrap\">(C)</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Kupffer cells</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; vertical-align:top; white-space:nowrap\">Leydig cells</td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:1px solid black; border-right:1px solid black; border-top:none; height:19px; text-align:left; vertical-align:middle; white-space:nowrap\">(D)</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; text-align:left; vertical-align:middle; white-space:nowrap\">Hepatic cells</td>\n\t\t\t<td style=\"border-bottom:1px solid black; border-left:none; border-right:1px solid black; border-top:none; vertical-align:top; white-space:nowrap\">JG cells</td>\n\t\t</tr>\n\t</tbody>\n</table>\n",
  //       "option1": "<p>A</p>\n",
  //       "option2": "<p>C</p>\n",
  //       "option3": "<p>D</p>\n",
  //       "option4": "<p>B</p>\n",
  //       "marks": 4,
  //       "answered": false,
  //       "multiAnswers": [
  //         "option1"
  //       ]
  //     }
  //   ],
  //   "createdBy": 115
  // }
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadQuestions();
  }


  getUnattemptedQuestionsCount(): number {
    return this.questions.filter(q => !q.userSelectedOptions || q.userSelectedOptions.length === 0).length;
  }

  getWrongAnswersCount(): number {
    return this.questions.filter(q =>
      q.userSelectedOptions &&
      q.userSelectedOptions.length > 0 &&
      !this.isAnswerCorrect(q.userSelectedOptions, q.multiAnswers)
    ).length;
  }
  getPercentage(): string {
    if (this.getTotalPossibleScore() === 0) return '0.0';
    return (this.getTotalScore() / this.getTotalPossibleScore() * 100).toFixed(1);
  }

  // New method for percentile calculation
  // Note: In a real implementation, this would require comparison with other students' scores
  getPercentile(): string {
    // This is a placeholder calculation. In a real app, you would:
    // 1. Get this student's score
    // 2. Compare against all other students who took this exam
    // 3. Calculate what percentage of students scored lower than this student

    // For demo purposes, we'll use a formula that converts percentage to an 
    // approximate percentile assuming a normal distribution of scores
    const percentage = parseFloat(this.getPercentage());
    let percentile = 0;

    if (percentage >= 90) {
      percentile = 95 + (percentage - 90) / 2; // 95th-100th
    } else if (percentage >= 80) {
      percentile = 85 + (percentage - 80); // 85th-95th
    } else if (percentage >= 70) {
      percentile = 70 + 1.5 * (percentage - 70); // 70th-85th
    } else if (percentage >= 60) {
      percentile = 50 + 2 * (percentage - 60); // 50th-70th
    } else if (percentage >= 50) {
      percentile = 30 + 2 * (percentage - 50); // 30th-50th
    } else if (percentage >= 40) {
      percentile = 15 + 1.5 * (percentage - 40); // 15th-30th
    } else if (percentage >= 30) {
      percentile = 5 + (percentage - 30); // 5th-15th
    } else {
      percentile = percentage / 6; // 0-5th
    }

    return percentile.toFixed(0) + 'th';
  }
  loadQuestions(): void {

    // this.questions = this.data.questionResponses;
    this.loading = false; // Data loaded
    this.errorMsg = false;
    console.log('questions', this.questions);
    this.testID = this.route.snapshot.queryParamMap.get('testID'); // url parameters
    console.log('testID', this.testID);

    this.http.getRequest(`api/test/getSubmittedTest?id=${sessionStorage.getItem('studentId')}&testId=${this.testID}`).subscribe(
      (data: any) => {
        this.questions = data.questionResponses;

        this.updatePaginatedQuestions();
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  retryLoading() {
    this.loadQuestions()
  }

  updatePaginatedQuestions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedQuestions = this.questions.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedQuestions();
  }

  onItemsPerPageChange(items: number): void {
    this.itemsPerPage = items;
    this.currentPage = 1;
    this.updatePaginatedQuestions();
  }

  isCorrectAnswer(correctAnswers: string[], option: string): boolean {
    return correctAnswers.includes(option);
  }

  isUserSelected(userAnswers: string[] | undefined, option: string): boolean {
    if (!userAnswers) return false;
    return userAnswers.includes(option);
  }

  isIncorrectSelection(userAnswers: string[] | undefined, correctAnswers: string[], option: string): boolean {
    if (!userAnswers) return false;
    return userAnswers.includes(option) && !correctAnswers.includes(option);
  }

  isAnswerCorrect(userAnswers: string[] | undefined, correctAnswers: string[]): boolean {
    if (!userAnswers || userAnswers.length === 0) return false;
    if (userAnswers.length !== correctAnswers.length) return false;

    // Check if all user selections are in correct answers
    return userAnswers.every(answer => correctAnswers.includes(answer));
  }

  getAttemptedQuestions(): number {
    return this.questions.filter(q => q.userSelectedOptions && q.userSelectedOptions.length > 0).length;
  }

  getCorrectAnswersCount(): number {
    return this.questions.filter(q =>
      q.userSelectedOptions &&
      this.isAnswerCorrect(q.userSelectedOptions, q.multiAnswers)
    ).length;
  }

  getTotalScore(): number {
    return this.questions.reduce((total, q) => {
      if (q.userSelectedOptions && this.isAnswerCorrect(q.userSelectedOptions, q.multiAnswers)) {
        return total + q.marks;
      }
      return total;
    }, 0);
  }

  getTotalPossibleScore(): number {
    return this.questions.reduce((total, q) => total + q.marks, 0);
  }

}

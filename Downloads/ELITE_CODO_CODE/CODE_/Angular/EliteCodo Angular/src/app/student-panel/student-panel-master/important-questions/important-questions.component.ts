import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

interface QuestionResponse {
  questionId: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  multiAnswers: string[];
  marks: number;
  questionCategory: string;
  testName?: string; // Optional for student-wise responses
  standardName?: string;
  chapterName?: string;
  yearOfAppearance?: string;
  date?: string;
  status?: string;
  explanation?: string;
  solution?: string;
}

interface TestResponse {
  testId: number;
  testName: string;
  testDate: string;
  startTime: string;
  endTime: string;
  marks: number | null;
  questionResponses: QuestionResponse[];
  createdBy: number;
}

@Component({
  selector: 'app-important-questions',
  templateUrl: './important-questions.component.html',
  styleUrls: ['./important-questions.component.scss']
})
export class ImportantQuestionsComponent implements OnInit {
  activateROut = inject(ActivatedRoute);
  fetchImportantQuestions: any;
  isTestWise: boolean = false; // Flag to determine which data structure we have
  questions: any[] = []; // Normalized questions array

  constructor(
    public http: HttpmethodsService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.checkQueryParamsAndFetchData();
  }

  checkQueryParamsAndFetchData() {
    const testID = this.activateROut.snapshot.queryParamMap.get('testID');
    const studentId = Number(this.activateROut.snapshot.queryParamMap.get('studentId'))
    let studentIdFromSession = Number(sessionStorage.getItem('studentId'))
    console.log({ studentId });

    if (testID) {
      this.isTestWise = true;
      this.fetchImportantQuestionsByTestIDandStudentIdWise(testID, studentIdFromSession);
    } else if (studentId) {
      this.isTestWise = false;
      this.fetchImportantQuestionsBystudentId(studentId);
    } else {
      this.message.error('No valid identifier found in URL');
    }
  }

  fetchImportantQuestionsByTestIDandStudentIdWise(testID: string, studentId: Number) {
    this.http.getRequest(`api/test/getImportantQuestions/${testID}/${studentId}`).subscribe(
      (response: any) => {
        console.log(response);
        this.fetchImportantQuestions = response;
        this.questions = response.questionResponses;
      },
      (error) => {
        this.message.error('Failed to fetch important questions by test ID');
        console.error(error);
      }
    );
  }

  fetchImportantQuestionsBystudentId(studentId: Number) {
    this.http.getRequest(`api/test/important-questions/${studentId}`).subscribe(
      (response: any) => {
        console.log({fetchImportantQuestionsBystudentId: response});
        this.questions = response;
        
        // Create a mock test object for student-wise view
        this.fetchImportantQuestions = {
          testId: null,
          testName: 'Important Questions Collection',
          testDate: new Date().toISOString(),
          startTime: null, // Set to null instead of '00:00:00'
          endTime: null,   // Set to null instead of '00:00:00'
          marks: null,
          questionResponses: response,
          createdBy: null
        };
      },
      (error) => {
        this.questions = this.mockData().questionResponses;
        this.fetchImportantQuestions = this.mockData();
        this.message.error('Failed to fetch important questions by Student ID');
        console.error(error);
      }
    );
  }

  getFormattedTime(time: string): Date | null {
    if (!time) {
      return null;
    }
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date;
  }

  isCorrectAnswer(correctAnswers: string[], option: string): boolean {
    return correctAnswers.includes(option);
  }

  mockData() {
    return {
      "testId": 51, 
      "testName": "tESTtEACHER2sTUDENT", 
      "testDate": "2025-04-14T00:00:00.000+00:00", 
      "startTime": "16:18:00", 
      "endTime": "16:20:00", 
      "marks": 50.0, 
      "questionResponses": [
        { "questionId": 5, "standardName": null, "chapterName": null, "marks": 5, "question": "<p>Test question</p>\n", "option1": "<p>option1 answer</p>\n", "option2": "<p>option2&nbsp; answer</p>\n", "option3": "<p>option3 answer</p>\n", "option4": "<p>option4&nbsp; answer</p>\n", "yearOfAppearance": null, "date": "2025-03-09", "status": "Accepted", "multiAnswers": ["option1"], "explanation": "<p>explanation of question solution is given by ashish</p>\n", "solution": "", "questionCategory": "Numerical" },
        { "questionId": 6, "standardName": null, "chapterName": null, "marks": 5, "question": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Test MCQ</p>\n", "option1": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">o1</p>\n", "option2": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">o2</p>\n", "option3": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">o3</p>\n", "option4": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">o4</p>\n", "yearOfAppearance": null, "date": "2025-03-09", "status": "Accepted", "multiAnswers": ["option3"], "explanation": "<p style=\"display: flex; flex-wrap: wrap; white-space: nowrap;\">Explanation3 answer is correct answer</p>\n", "solution": "<p>modified</p>\n", "questionCategory": null },
        { "questionId": 8, "standardName": null, "chapterName": null, "marks": 5, "question": "<p>test6</p>\n", "option1": "<p>test6</p>\n", "option2": "<p>test6</p>\n", "option3": "<p>test6</p>\n", "option4": "<p>test6</p>\n", "yearOfAppearance": null, "date": "2025-03-09", "status": "Accepted", "multiAnswers": ["option3"], "explanation": "<p>test6 explanation.</p>\n", "solution": "", "questionCategory": "Numerical" }
      ],
      "createdBy": 24
    }
  }
}
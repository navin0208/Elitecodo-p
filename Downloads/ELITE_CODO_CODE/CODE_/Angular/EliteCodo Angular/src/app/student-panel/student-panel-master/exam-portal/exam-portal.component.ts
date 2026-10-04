import { Component, HostListener, inject } from '@angular/core';
// ExamPortalComponent,
import { NzMessageService } from 'ng-zorro-antd/message';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
interface ExamQuestion {
  questionNumber: number;
  marks: number;
  question: string;
  answered: boolean;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  multiAnswers: string[];
}
interface QuestionTiming {
  questionId: number;
  accumulatedTime: number; // Stores total accumulated time
  currentSessionStart: number | null; // Tracks current session
  visits: number;
}
interface TestResponse {
  testId: number;
  testName: string;
  testDate: string;
  startTime: string;
  endTime: string;
  marks: number | null;
  questionResponses: ExamQuestion[];
  createdBy: number;
}
interface QuestionSubmission {
  questionId: number;
  selectedAnswers: any;
  timeSpent: number;
  visits: number;
}
interface ExamSubmissionRequest {
  studentId: number;
  testId: number;
  answers: {
    questionId: number;
    selectedAnswers: string[];
    timeSpent: number;
    visits: number;
  }[];
  importantQuestions: number[]; // Add this to store important question numbers
  securityData?: {
    // Add optional security data
    tabSwitchCount: number;
    totalTimeSpent: number;
    browserInfo: string;
    submissionTime: string;
  };
}

@Component({
  selector: 'app-exam-portal',
  templateUrl: './exam-portal.component.html',
  styleUrls: ['./exam-portal.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '400ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class ExamPortalComponent {
  http = inject(HttpmethodsService);
  activateROut = inject(ActivatedRoute);
  route = inject(Router);
  location = inject(Location);
  param: any;
  questions: ExamQuestion[] = [
    {
      questionNumber: 2,
      answered: false,
      marks: 2,
      question:
        '<p>The irreversible reactions of glycolysis are mediated by enzyme</p>\n',
      option1: '<p>hydrolases</p>\n',
      option2: '<p>hydrolases</p>\n',
      option3: '<p>hydrolases</p>\n',
      option4: '<p>hydrolases</p>\n',
      multiAnswers: ['option1', 'option2'],
    },
    {
      questionNumber: 2,
      answered: false,
      marks: 3,
      question: `<p>Let PQR be a right angled isosceles triangle, right angled at P(2,1). If the equation of the line QR is <img style="display:inline;" alt="" height="17" src="http://res.cloudinary.com/dyc6cau0j/image/upload/v1733743259/jifir4x6elwmr0tzbmxe.png" width="70" />, then the equation representing the pair of lines PQ and PR is</p>`,
      option1: `<p><img style="display:inline;" alt="" height="18" src="http://res.cloudinary.com/dyc6cau0j/image/upload/v1733743286/e0kzfwptzjhlnaedqlru.png" width="252" /></p>`,
      option2: `<p><img style="display:inline;" alt="" height="18" src="http://res.cloudinary.com/dyc6cau0j/image/upload/v1733743299/azjg4niqxuq0pgtklxbd.png" width="252" /></p>`,
      option3: `<p><img style="display:inline;" alt="" height="18" src="http://res.cloudinary.com/dyc6cau0j/image/upload/v1733743311/mhe2inpbzj2tgiqwijri.png" width="252" /></p>`,
      option4: `<p><img style="display:inline;" alt="" height="18" src="http://res.cloudinary.com/dyc6cau0j/image/upload/v1733743323/h8f94elbypbwako4keir.png" width="252" /></p>`,
      multiAnswers: ['option2'],
    },
  ];
  testData: TestResponse | null = null;

  importantQuestionNumbers: number[] = []; // New array to store important question numbers
  answeredQuestions: { [key: number]: boolean } = {};
  selectedMultiAnswers: { [key: number]: boolean[] } = {};
  selectedAnswers: { [key: number]: number | boolean[] | null } = {}; // Track selected answers for all questions

  importantQuestions: { [key: number]: boolean } = {};

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  remainingTime = 3600; // 1 hour in seconds
  private timer: any;
  private lastTick: number = Date.now();
  // visitedQuestions: Set<number> = new Set();

  timeTrackingInterval: any;

  questionTimings: { [key: number]: QuestionTiming } = {};
  visitedQuestions: { [key: number]: boolean } = {};

  // Add this property to your component class
  private popStateListener: () => void;

  // Add these security-related properties
  private isExamSubmitted = false;
  private tabSwitchCount = 0;
  private maxTabSwitches = 3; // Allow maximum 3 tab switches

  // Add these properties to store event listener references
  private securityListeners: { [key: string]: (event: any) => void } = {};
  private isExamActive = true; // Add flag to track exam state

  // New method to toggle question importance
  // Fixed important question handling
  toggleImportantQuestion() {
    if (!this.importantQuestions[this.currentQuestionIndex]) {
      // Mark current question as important
      this.importantQuestions[this.currentQuestionIndex] = true;

      // Add current question number to array if not present
      const questionNumber =
        this.questions[this.currentQuestionIndex].questionNumber;
      if (!this.importantQuestionNumbers.includes(questionNumber)) {
        this.importantQuestionNumbers.push(questionNumber);
      }
    } else {
      // Remove importance from current question
      this.importantQuestions[this.currentQuestionIndex] = false;

      // Remove question number from array
      const questionNumber =
        this.questions[this.currentQuestionIndex].questionNumber;
      const index = this.importantQuestionNumbers.indexOf(questionNumber);
      if (index > -1) {
        this.importantQuestionNumbers.splice(index, 1);
      }
    }

    // Sort the array to maintain order
    this.importantQuestionNumbers.sort((a, b) => a - b);
  }

  getTestName() {
    return sessionStorage.getItem('testName');
  }

  get currentQuestion(): any {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // In ExamPortalComponent
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any): void {
  //   if (this.remainingTime > 0) {
  //     $event.returnValue =
  //       'Are you sure you want to leave? Your exam progress may be lost.';
  //     $event.preventDefault();
  //   }
  // }
  constructor(
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {
    // Prevent back button
    history.pushState(null, '', location.href);

    // Store the listener reference so we can remove it later
    this.popStateListener = () => {
      history.pushState(null, '', location.href);
      this.message.warning('You cannot go back during the exam');
    };

    window.addEventListener('popstate', this.popStateListener);

    // Add security event listeners
    this.setupSecurityListeners();

    // Initialize the arrays
    this.selectedMultiAnswers = {};
    this.selectedAnswers = {};
    this.answeredQuestions = {};

    // Initialize timing for all questions
    this.questions.forEach((_, index) => {
      this.questionTimings[index] = {
        questionId: index,
        accumulatedTime: 0,
        currentSessionStart: null,
        visits: 0,
      };
    });
  }

  ngOnInit() {
    this.param = this.activateROut.snapshot.queryParamMap.get('test'); // route parameters
    this.getTestIdWiseData();

    // Start timing for first question
    this.startQuestionSession(this.currentQuestionIndex);

    // Add security checks
    this.performSecurityChecks();
  }

  // Security

  // Replace your existing setupSecurityListeners method:
  private setupSecurityListeners() {
    // Store references to the event handlers for proper cleanup
    // Store references to the event handlers for proper cleanup
    this.securityListeners['visibilityChange'] = () => {
      if (document.hidden && this.isExamActive) {
        this.handleTabSwitch();
      }
    };

    this.securityListeners['contextMenu'] = (e: Event) => {
      if (this.isExamActive) {
        e.preventDefault();
        this.message.warning('Right-click is disabled during exam');
      }
    };

    this.securityListeners['keyDown'] = (e: KeyboardEvent) => {
      if (!this.isExamActive) return;

      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault();
        this.message.warning('Developer tools are disabled during exam');
        this.logSecurityViolation('Attempted to open developer tools');
      }
    };

    this.securityListeners['copy'] = (e: Event) => {
      if (this.isExamActive) {
        e.preventDefault();
        this.message.warning('Copy is disabled during exam');
      }
    };

    this.securityListeners['paste'] = (e: Event) => {
      if (this.isExamActive) {
        e.preventDefault();
        this.message.warning('Paste is disabled during exam');
      }
    };

    // Attach the event listeners
    document.addEventListener(
      'visibilitychange',
      this.securityListeners['visibilityChange']
    );
    document.addEventListener(
      'contextmenu',
      this.securityListeners['contextMenu']
    );
    document.addEventListener('keydown', this.securityListeners['keyDown']);
    document.addEventListener('copy', this.securityListeners['copy']);
    document.addEventListener('paste', this.securityListeners['paste']);
  }

  private handleTabSwitch() {
    this.tabSwitchCount++;
    this.message.warning(
      `Tab switch detected! (${this.tabSwitchCount}/${this.maxTabSwitches})`
    );

    if (this.tabSwitchCount >= this.maxTabSwitches) {
      this.message.error(
        'Maximum tab switches exceeded. Exam will be auto-submitted.'
      );
      this.logSecurityViolation('Exceeded maximum tab switches');
      setTimeout(() => {
        this.submitExam();
      }, 2000);
    }
  }

  private performSecurityChecks() {
    // Check if required session data exists
    const requiredKeys = ['studentId', 'testId', 'testName'];
    const missingKeys = requiredKeys.filter(
      (key) => !sessionStorage.getItem(key)
    );

    if (missingKeys.length > 0) {
      this.message.error('Invalid exam session. Redirecting...');
      const boardName = this.activateROut.snapshot.paramMap.get('name');
      setTimeout(() => {
        this.route.navigate([`/student/${boardName}/join-test`]);
      }, 2000);
      return;
    }

    // Check if exam was already submitted
    if (sessionStorage.getItem('examSubmitted') === 'true') {
      this.message.warning('Exam already submitted');
      const boardName = this.activateROut.snapshot.paramMap.get('name');
      this.route.navigate([`/student/${boardName}/exam-completion`]);
      return;
    }
  }

  private logSecurityViolation(violation: string) {
    const logData = {
      studentId: sessionStorage.getItem('studentId'),
      testId: sessionStorage.getItem('testId'),
      violation: violation,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Send security log to backend
    this.http.postRequest('api/security/log-violation', logData).subscribe(
      (response) => {
        console.log('Security violation logged');
      },
      (error) => {
        console.error('Failed to log security violation:', error);
      }
    );
  }

  // Security

  // Start timing a question session
  private startQuestionSession(questionIndex: number) {
    const timing = this.questionTimings[questionIndex];
    timing.currentSessionStart = Date.now();
    timing.visits++;
  }

  // End timing a question session and accumulate the time
  private endQuestionSession(questionIndex: number) {
    const timing = this.questionTimings[questionIndex];
    if (timing.currentSessionStart) {
      const sessionDuration = Math.floor(
        (Date.now() - timing.currentSessionStart) / 1000
      );
      timing.accumulatedTime += sessionDuration;
      timing.currentSessionStart = null;
      return sessionDuration;
    }
    return 0;
  }

  getTestIdWiseData() {
    const userId = sessionStorage.getItem('studentId');
    const testId = sessionStorage.getItem('testId');
    if (this.param == 'Mock') {
      console.log('Schedule loaded');
      this.http
        .getRequest(
          `api/test/getTestQuestionsForStudent?userId=${userId}&testId=${testId}`
        )
        .subscribe(
          (res: any) => {
            this.testData = res;
            this.questions = res.questionResponses;

            // Initialize timing for all questions
            this.questions.forEach((_, index) => {
              this.questionTimings[index] = {
                questionId: index,
                accumulatedTime: 0,
                currentSessionStart: null,
                visits: 0,
              };
            });

            // Calculate remaining time based on start and end time
            this.calculateRemainingTime(res.startTime, res.endTime);

            // Start timer and question session after data is loaded
            this.startTimer();
            this.startQuestionSession(this.currentQuestionIndex);
          },
          (error) => {
            this.message.error('Failed to load test questions');
            console.error('Error loading test:', error);
          }
        );
    } else {
      this.http
        .getRequest(`api/test/getTestQuestionsFromTeacher?testId=${testId}`)
        .subscribe(
          (res: any) => {
            this.testData = res;
            this.questions = res.questionResponses;

            // Initialize timing for all questions
            this.questions.forEach((_, index) => {
              this.questionTimings[index] = {
                questionId: index,
                accumulatedTime: 0,
                currentSessionStart: null,
                visits: 0,
              };
            });

            // Calculate remaining time based on start and end time
            this.calculateRemainingTime(res.startTime, res.endTime);

            // Start timer and question session after data is loaded
            this.startTimer();
            this.startQuestionSession(this.currentQuestionIndex);
          },
          (error) => {
            this.message.error('Failed to load test questions');
            console.error('Error loading test:', error);
          }
        );
      console.log('Schedule loaded');
    }
  }

  private calculateRemainingTime(startTime: string, endTime: string) {
    const start = new Date();
    start.setHours(parseInt(startTime.split(':')[0]));
    start.setMinutes(parseInt(startTime.split(':')[1]));
    start.setSeconds(0);

    const end = new Date();
    end.setHours(parseInt(endTime.split(':')[0]));
    end.setMinutes(parseInt(endTime.split(':')[1]));
    end.setSeconds(0);

    const now = new Date();
    if (now > end) {
      this.remainingTime = 0;
    } else if (now < start) {
      this.message.warning('Test has not started yet');
      this.remainingTime = Math.floor((end.getTime() - start.getTime()) / 1000);
    } else {
      this.remainingTime = Math.floor((end.getTime() - now.getTime()) / 1000);
    }
  }

  startTimer() {
    // Clear any existing timer first
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.lastTick = Date.now();

    this.timer = setInterval(() => {
      const now = Date.now();
      const deltaTime = Math.floor((now - this.lastTick) / 1000);

      if (deltaTime >= 1) {
        this.remainingTime = Math.max(0, this.remainingTime - deltaTime);
        this.lastTick = now;

        if (this.remainingTime <= 0) {
          this.submitExam();
        }
      }
    }, 1000);
  }

  // Get total time spent on a question (accumulated + current session if active)
  getTotalTimeSpent(questionIndex: number): number {
    const timing = this.questionTimings[questionIndex];
    if (!timing) return 0;

    let totalTime = timing.accumulatedTime;
    if (timing.currentSessionStart) {
      const currentSessionTime = Math.floor(
        (Date.now() - timing.currentSessionStart) / 1000
      );
      totalTime += currentSessionTime;
    }
    return totalTime;
  }

  answerQuestion(index: number) {
    this.questions[index].answered = true;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } // Handle question navigation
  private handleQuestionChange(fromIndex: number, toIndex: number) {
    // End timing for current question
    this.endQuestionSession(fromIndex);

    // Start timing for new question
    this.startQuestionSession(toIndex);

    // Log for verification
    console.log(
      `Question ${fromIndex + 1} total time: ${this.getTotalTimeSpent(
        fromIndex
      )}s`
    );
  }

  // You can then refactor your previous/next methods to use this helper:
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      // this.saveAndRestoreSelection(this.currentQuestionIndex - 1);

      const prevIndex = this.currentQuestionIndex - 1;
      this.handleQuestionChange(this.currentQuestionIndex, prevIndex);
      this.saveAndRestoreSelection(prevIndex);
      this.currentQuestionIndex = prevIndex;
    }
  }

  nextQuestion() {
    if (!this.isLastQuestion) {
      const nextIndex = this.currentQuestionIndex + 1;
      // this.switchQuestion(this.currentQuestionIndex, nextIndex);
      this.handleQuestionChange(this.currentQuestionIndex, nextIndex);
      this.saveAndRestoreSelection(nextIndex);
      this.currentQuestionIndex = nextIndex;
    } else {
      this.submitExam();
    }
  }

  submitExam() {
    if (this.isExamSubmitted) {
      this.message.warning('Exam already submitted');
      return;
    }

    this.isExamSubmitted = true;
    this.isExamActive = false; // Disable security listeners

    this.endQuestionSession(this.currentQuestionIndex);
    clearInterval(this.timer);

    const studentId = parseInt(sessionStorage.getItem('studentId') || '0');
    const testId = this.testData?.testId || 0;

    // Process answers as before
    const answers = this.questions.map((question, idx) => {
      let selectedAnswers: string[] = [];

      const currentAnswers = this.selectedAnswers[idx];
      if (currentAnswers !== undefined && currentAnswers !== null) {
        if (Array.isArray(currentAnswers)) {
          // Handle multi-select questions
          selectedAnswers = currentAnswers
            .map((selected, optionIndex) =>
              selected ? `option${optionIndex + 1}` : ''
            )
            .filter((option) => option);
        } else {
          // Handle single-select questions
          selectedAnswers = [`option${currentAnswers + 1}`];
        }
      }

      return {
        questionId: question.questionNumber,
        selectedAnswers: selectedAnswers,
        timeSpent: this.getTotalTimeSpent(idx),
        visits: this.questionTimings[idx].visits,
      };
    });

    // Create submission data including important questions
    const submissionData: ExamSubmissionRequest = {
      studentId,
      testId,
      answers,
      importantQuestions: this.importantQuestionNumbers, // Include the array of important question numbers
      securityData: {
        // Add security information
        tabSwitchCount: this.tabSwitchCount,
        totalTimeSpent: this.questions.reduce(
          (total, _, idx) => total + this.getTotalTimeSpent(idx),
          0
        ),
        browserInfo: navigator.userAgent,
        submissionTime: new Date().toISOString(),
      },
    };

    console.log('Submission Data with important questions:', submissionData);

    this.http.postRequest('api/test/submit', submissionData).subscribe(
      (response) => {
        sessionStorage.setItem('examSubmitted', 'true');

        this.message.success('Your exam has been submitted successfully!');
        const boardName = this.activateROut.snapshot.paramMap.get('name');
        this.route.navigateByUrl(`student/${boardName}/exam-completion`);
      },
      (error) => {
        this.isExamSubmitted = false; // Reset flag on error
        this.isExamActive = true; // Re-enable security on error

        this.message.error('Failed to submit exam. Please try again.');
        console.error('Error submitting exam:', error);
      }
    );
  }

  ngOnDestroy() {
    // Remove the popstate listener
    window.removeEventListener('popstate', this.popStateListener);

    if (this.timer) {
      clearInterval(this.timer);
    }
    this.endQuestionSession(this.currentQuestionIndex);

    // Properly remove security event listeners
    this.isExamActive = false;

    if (this.securityListeners['visibilityChange']) {
      document.removeEventListener(
        'visibilitychange',
        this.securityListeners['visibilityChange']
      );
    }
    if (this.securityListeners['contextMenu']) {
      document.removeEventListener(
        'contextmenu',
        this.securityListeners['contextMenu']
      );
    }
    if (this.securityListeners['keyDown']) {
      document.removeEventListener(
        'keydown',
        this.securityListeners['keyDown']
      );
    }
    if (this.securityListeners['copy']) {
      document.removeEventListener('copy', this.securityListeners['copy']);
    }
    if (this.securityListeners['paste']) {
      document.removeEventListener('paste', this.securityListeners['paste']);
    }

    // Clear the listeners object
    this.securityListeners = {};
  }

  // Modified selectAnswer method with proper initialization
  selectAnswer(index: number) {
    const isMultiSelect = this.currentQuestion.multiAnswers.length > 1;

    if (isMultiSelect) {
      // Initialize the arrays if they don't exist
      if (!this.selectedMultiAnswers[this.currentQuestionIndex]) {
        this.selectedMultiAnswers[this.currentQuestionIndex] = [
          false,
          false,
          false,
          false,
        ];
      }
      if (!this.selectedAnswers[this.currentQuestionIndex]) {
        this.selectedAnswers[this.currentQuestionIndex] = [
          false,
          false,
          false,
          false,
        ];
      }

      // Update both arrays simultaneously
      this.selectedMultiAnswers[this.currentQuestionIndex][index] =
        !this.selectedMultiAnswers[this.currentQuestionIndex][index];

      // Copy values to selectedAnswers array
      this.selectedAnswers[this.currentQuestionIndex] = [
        ...this.selectedMultiAnswers[this.currentQuestionIndex],
      ];

      // Mark as answered if any option is selected
      this.answeredQuestions[this.currentQuestionIndex] =
        this.selectedMultiAnswers[this.currentQuestionIndex].some((val) => val);
    } else {
      this.selectedAnswer = index;
      this.selectedAnswers[this.currentQuestionIndex] = index;
      this.answeredQuestions[this.currentQuestionIndex] = true;
    }
  }
  getAnsweredQuestionsCount(): number {
    return Object.values(this.answeredQuestions).filter((answered) => answered)
      .length;
  }
  // Updated question status method to properly handle important questions
  getQuestionStatus(index: number): string {
    if (this.answeredQuestions[index]) {
      return this.importantQuestions[index] ? 'answered important' : 'answered';
    }
    if (this.visitedQuestions[index] && !this.answeredQuestions[index]) {
      return this.importantQuestions[index]
        ? 'visited-not-answered important'
        : 'visited-not-answered';
    }
    if (this.importantQuestions[index]) {
      return 'important';
    }
    return 'not-answered';
  }

  // private switchQuestion(fromIndex: number, toIndex: number) {
  //   // Save current question's timing
  //   const currentTiming = this.questionTimings[fromIndex];
  //   if (currentTiming && currentTiming.startTime) {
  //     const timeSpent = Math.floor((Date.now() - currentTiming.startTime) / 1000);
  //     currentTiming.timeSpent += timeSpent;
  //     currentTiming.startTime = null;
  //     console.log(`Question ${fromIndex + 1} total time: ${currentTiming.timeSpent}s`);
  //   }

  //   // Start timing for new question
  //   this.startQuestionTimer(toIndex);
  // }
  goToQuestion(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.handleQuestionChange(this.currentQuestionIndex, index);
      this.saveAndRestoreSelection(index);
      this.visitedQuestions[this.currentQuestionIndex] = true;
      // Save current selection before moving
      if (this.isMultiSelectQuestion()) {
        this.selectedAnswers[this.currentQuestionIndex] = this.selectedAnswers[
          this.currentQuestionIndex
        ] || [false, false, false, false];
      } else {
        this.selectedAnswers[this.currentQuestionIndex] = this.selectedAnswer;
      }

      // Update current index
      this.currentQuestionIndex = index;
      this.visitedQuestions[index] = true;
      // Restore selection for the target question
      const savedSelection = this.selectedAnswers[this.currentQuestionIndex];
      if (this.isMultiSelectQuestion()) {
        this.selectedMultiAnswers[this.currentQuestionIndex] =
          (savedSelection as boolean[]) || [false, false, false, false];
      } else {
        this.selectedAnswer = savedSelection as number | null;
      }
    }
  }

  // Helper method to make the code more DRY
  // Modified saveAndRestoreSelection method
  private saveAndRestoreSelection(targetIndex: number) {
    // Save current selection
    if (this.isMultiSelectQuestion()) {
      // Ensure selectedMultiAnswers is initialized for current question
      if (!this.selectedMultiAnswers[this.currentQuestionIndex]) {
        this.selectedMultiAnswers[this.currentQuestionIndex] = [
          false,
          false,
          false,
          false,
        ];
      }
      // Save to both arrays
      this.selectedAnswers[this.currentQuestionIndex] = [
        ...this.selectedMultiAnswers[this.currentQuestionIndex],
      ];
    } else {
      this.selectedAnswers[this.currentQuestionIndex] = this.selectedAnswer;
    }

    // Mark current question as visited
    this.visitedQuestions[this.currentQuestionIndex] = true;

    // Update current index
    this.currentQuestionIndex = targetIndex;

    // Restore selection for the target question
    const savedSelection = this.selectedAnswers[this.currentQuestionIndex];
    if (this.isMultiSelectQuestion()) {
      // Initialize if undefined
      if (!this.selectedMultiAnswers[this.currentQuestionIndex]) {
        this.selectedMultiAnswers[this.currentQuestionIndex] = [
          false,
          false,
          false,
          false,
        ];
      }
      if (savedSelection) {
        // Restore from savedSelection to both arrays
        this.selectedMultiAnswers[this.currentQuestionIndex] = [
          ...(savedSelection as boolean[]),
        ];
      }
    } else {
      this.selectedAnswer = savedSelection as number | null;
    }
  }

  // Method to check if the current question allows multiple selections
  isMultiSelectQuestion(): boolean {
    return this.currentQuestion.multiAnswers.length > 1;
  }
}

// its working but what is happenig when i add imporatntt and go on next question that star selected is still showing active in next question and i want to add array of questionNumber when submit

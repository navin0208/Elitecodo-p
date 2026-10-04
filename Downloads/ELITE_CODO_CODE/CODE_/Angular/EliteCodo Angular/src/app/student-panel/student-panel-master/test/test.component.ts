import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
// Add these interfaces to your existing ones
interface Question {
  id: number;
  type: 'numerical' | 'theoretical';
  // other question properties
}

interface Chapter {
  id: number;
  name: string;
  topicCount: number;
  topics: Topic[];
  numericalCount?: number;    // Add these to track total numerical
  theoreticalCount?: number;  // and theoretical questions per chapter
}

interface Topic {
  id: number;
  name: string;
  questionCount: number;
  questions?: Question[];  // Add this to track question types
  numericalCount?: number;  // Add these to track question type counts
  theoreticalCount?: number;
}

interface Subject {
  id: number;
  name: string;
  chapters: Chapter[];
}
interface ChapterWeightage {
  chapterId: number;
  weightage: number;
}

interface SubjectWeightage {
  subjectId: number;
  chapters: ChapterWeightage[];
}

// Add these interfaces to your existing ones
interface LevelCounts {
  easy: number;
  medium: number;
  hard: number;
}

interface ChapterSelection {
  chapterId: number;
  chapterName: string;
  selected: boolean;
}
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  subjects: any
  uniformQuestionCount: number = 0;
  topicUniformQuestionCount: number = 0;
  minDate: string = '';

  activateROut = inject(ActivatedRoute);
  route = inject(Router);

  standards: any[] = [];

  testTypes = [
    'Create Chapter Wise Test',
    'Create Subject Wise Test',
    'Create Group Wise Test',
    'Create Topic Wise Test',
    'Create Weightage Wise Test',
    'Create PYQ Wise Test',
    'Create Numerical Wise Test',
    'Create Theoretical Wise Test',
    'Create Random Test',
    'Level Wise Test'
  ];
  // Add this to your existing interfaces and properties
  weightageConfigs: any;
  // = [
  //   {
  //     subjectId: 1, // Mathematics
  //     chapters: [
  //       { chapterId: 1, weightage: 60 }, // Algebra: 60%
  //       { chapterId: 2, weightage: 20 },  // Geometry: 40%
  //       { chapterId: 3, weightage: 20 },
  //       { chapterId: 4, weightage: 20 },
  //       { chapterId: 5, weightage: 60 },

  //     ]
  //   },
  //   {
  //     subjectId: 2, // Physics
  //     chapters: [
  //       { chapterId: 3, weightage: 55 }, // Mechanics: 55%
  //       { chapterId: 4, weightage: 45 }  // Thermodynamics: 45%
  //     ]
  //   },
  //   // Add weightages for other subjects...
  // ];
  // Add these properties

  // Add these properties
  levelCounts: LevelCounts = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  selectedChapters: ChapterSelection[] = [];
  remainingLevelCount: number = 100;
  getDataOFquestiontypeVar: any;
  getDataOFquestionlevelVar: any;
  selectedSubject: Subject | null = null;
  selectedChapter: Chapter | null = null;
  testForm: FormGroup;
  selectedTopics: Topic[] = [];
  totalQuestions: number = 100; // Default total questions
  remainingQuestions: number = 100;
  showRemainingQuestions: boolean = false;

  constructor(private fb: FormBuilder, private notification: NzNotificationService, private http: HttpmethodsService) {
    this.testForm = this.fb.group({
      standard: [null], // Add this line
      testName: ['', [Validators.required]],
      level: [''],
      type: [''],
      used: [''],
      asked: [''],
      testType: [null, [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      testDate: [null, [Validators.required]],
      duration: [''],
      subjectId: [null],
      chapterId: [null],
      topics: this.fb.array([]),
      totalQuestions: [100, [Validators.required, Validators.min(1), Validators.max(100)]],
      chapters: this.fb.array([]),
      groupSubjects: this.fb.array([]),
      remainingCount: [100],
      levelWise: this.fb.group({
        easy: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        medium: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        hard: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
      }),
      selectedChapterIds: [[]]
    });
  }
  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD


    this.getDataOFquestiontype();
    this.getDataOFquestionlevel();
    this.getSubjectsdata();
    this.chapterweightagebystudentdata();
  }

  getSubjectsdata() {
    this.http.getRequest(`api/auth/studentdata/${sessionStorage.getItem('entranceExamIdOfStudent')}/${sessionStorage.getItem('studentId')}`).subscribe(
      (response: any) => {
        console.log({ response });
        this.standards = response;



        this.subjects = this.standards.flatMap(standard => standard.subjects);
      })
  }

  getTotalQuestionsForSubject(subjectIndex: number): number {
    const subjectGroup = this.groupSubjectsArray.at(subjectIndex);
    if (!subjectGroup) return 0;

    const chapters = subjectGroup.get('chapters') as FormArray;
    return chapters.controls.reduce((total, chapter) => {
      return total + (chapter.get('questionCount')?.value || 0);
    }, 0);
  }

  getRemainingQuestionsForSubject(subjectIndex: number): number {
    const total = this.getTotalQuestionsForSubject(subjectIndex);
    return Math.max(0, 100 - total);
  }
  onsQuestionCountChange(subjectIndex: number): void {
    const subjectGroup = this.groupSubjectsArray.at(subjectIndex);
    if (!subjectGroup) return;

    const chapters = subjectGroup.get('chapters') as FormArray;
    const total = this.getTotalQuestionsForSubject(subjectIndex);

    // Update validation for each chapter
    chapters.controls.forEach(chapter => {
      const currentValue = chapter.get('questionCount')?.value || 0;
      const otherChaptersTotal = total - currentValue;

      chapter.get('questionCount')?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(100 - otherChaptersTotal)
      ]);

      chapter.get('questionCount')?.updateValueAndValidity();
    });
  }

  uniformCountMap: { [subjectIndex: number]: number } = {};

  // Add this method to apply uniform count for a specific subject
  applyUniformCount(): void {
    if (!this.uniformQuestionCount || this.uniformQuestionCount < 0 || this.uniformQuestionCount > 100) {
      this.notification.error('Error', 'Question count must be between 0 and 100');
      return;
    }

    const totalQuestions = this.uniformQuestionCount * this.chaptersArray.length;
    if (totalQuestions > 100) {
      this.notification.error('Error',
        `Total questions (${totalQuestions}) would exceed the limit of 100. Maximum ${Math.floor(100 / this.chaptersArray.length)} questions per chapter allowed.`
      );
      return;
    }

    this.chaptersArray.controls.forEach(control => {
      control.get('questionCount')?.setValue(this.uniformQuestionCount);
    });

    this.updateRemainingQuestions();
  }
  applyUniformCounts(subjectIndex: number): void {
    const uniformCount = this.uniformCountMap[subjectIndex];
    if (!uniformCount || uniformCount < 0 || uniformCount > 100) {
      this.notification.error('Error', 'Question count must be between 0 and 100');
      return;
    }

    const subjectGroup = this.groupSubjectsArray.at(subjectIndex);
    const chapters = subjectGroup.get('chapters') as FormArray;
    const totalChapters = chapters.length;

    const totalQuestions = uniformCount * totalChapters;
    if (totalQuestions > 100) {
      const maxPerChapter = Math.floor(100 / totalChapters);
      this.notification.error(
        'Error',
        `Total questions (${totalQuestions}) would exceed the limit of 100. Maximum ${maxPerChapter} questions per chapter allowed.`
      );
      return;
    }

    // Apply the uniform count to all chapters
    chapters.controls.forEach(chapter => {
      chapter.get('questionCount')?.setValue(uniformCount);
    });

    // Update remaining questions
    this.updateRemainingQuestionss(subjectIndex);
  }
  applyTopicUniformCount(): void {
    if (!this.topicUniformQuestionCount || this.topicUniformQuestionCount < 0 || this.topicUniformQuestionCount > 100) {
      this.notification.error('Error', 'Question count must be between 0 and 100');
      return;
    }

    const totalQuestions = this.topicUniformQuestionCount * this.topicsArray.length;
    if (totalQuestions > 100) {
      this.notification.error('Error',
        `Total questions (${totalQuestions}) would exceed the limit of 100. Maximum ${Math.floor(100 / this.topicsArray.length)} questions per topic allowed.`
      );
      return;
    }

    this.topicsArray.controls.forEach(control => {
      control.get('questionCount')?.setValue(this.topicUniformQuestionCount);
    });

    this.updateRemainingQuestions();
  }


  onStandardChange(standardId: number): void {
    while (this.groupSubjectsArray.length) {
      this.groupSubjectsArray.removeAt(0);
    }

    let subjectsToShow: any[] = [];

    if (standardId) {
      const selectedStandard = this.standards.find(standard => standard.id === standardId);
      if (selectedStandard) {
        subjectsToShow = selectedStandard.subjects;
      }
      this.subjects = selectedStandard ? selectedStandard.subjects : [];
    } else {
      this.subjects = this.standards.flatMap(standard => standard.subjects);
    }
    while (this.groupSubjectsArray.length) {
      this.groupSubjectsArray.removeAt(0);
    }
    this.testForm.patchValue({ subjectId: null }); // Reset subject selection
    this.chaptersArray.clear(); // Clear chapters array
    this.remainingQuestions = 100;
    this.updateRemainingQuestions();

    // Create form groups for the filtered subjects
    subjectsToShow.forEach((subject: any) => {
      const chaptersFormArray = this.fb.array(
        subject.chapters.map((chapter: any) => this.createChapterFormGroup(chapter))
      );

      const subjectGroup = this.fb.group({
        subjectId: [subject.id],
        subjectName: [subject.name],
        chapters: chaptersFormArray
      });

      this.groupSubjectsArray.push(subjectGroup);
      this.groupSubjectsArray.controls.forEach((_, index) => {
        this.onsQuestionCountChange(index);
      });
    });

  }

chapterweightagebystudentdata() {
    this.http.getRequest(`api/test/chapterweightagebystudent/${sessionStorage.getItem('studentId')}/${sessionStorage.getItem('entranceExamIdOfStudent')}`).subscribe(
      (response) => {
        console.log({ chapterweightagebystudentdata: response });
        this.weightageConfigs = response;
        console.log({ response })
      })
  }

  // Add these methods for level-wise test handling
  // Add these methods for level-wise test handling
  onLevelCountChange(level: 'easy' | 'medium' | 'hard', event: any): void {
    const newValue = parseInt(event.target.value, 10) || 0; // Ensure valid integer
    const levelWiseGroup = this.testForm.get('levelWise') as FormGroup;

    // Calculate the total count excluding the current level
    const totalExcludingCurrent = Object.entries(this.levelCounts)
      .filter(([key]) => key !== level)
      .reduce((sum, [_, value]) => sum + value, 0);

    // Check if the new value exceeds the 100-question limit
    if (totalExcludingCurrent + newValue > 100) {
      const maxAllowed = 100 - totalExcludingCurrent;
      // Update the form group with the capped value
      levelWiseGroup.patchValue({ [level]: maxAllowed }, { emitEvent: false });
      this.notification.warning(
        'Question Limit',
        `Maximum allowed questions for ${level} level: ${maxAllowed}`
      );
      // Set the capped value in levelCounts
      this.levelCounts[level] = maxAllowed;
    } else {
      // Update levelCounts and form group normally
      levelWiseGroup.patchValue({ [level]: newValue }, { emitEvent: false });
      this.levelCounts[level] = newValue;
    }

    this.updateRemainingLevelCount();
  }

  updateRemainingLevelCount(): void {
    const total = Object.values(this.levelCounts).reduce((sum, count) => sum + count, 0);
    this.remainingLevelCount = 100 - total;
  }

  getDataOFquestiontype() {
    this.http.getRequest(`api/questiontype/getallactive`).subscribe((res) => {
      console.log({ getDataOFquestiontype: res });
      this.getDataOFquestiontypeVar = res;
    })
  }
  getDataOFquestionlevel() {
    this.http.getRequest(`api/questionlevel/getallactive`).subscribe((res) => {
      console.log({ getDataOFquestionlevel: res });
      this.getDataOFquestionlevelVar = res;
    })
  }


  onLevelWiseSubjectChange(subjectId: number): void {
    const subject = this.subjects.find((sub: any) => sub.id === subjectId);
    if (subject) {
      this.selectedChapters = subject.chapters.map((chapter: any) => ({
        chapterId: chapter.id,
        chapterName: chapter.name,
        selected: false
      }));
    }
  }
  toggleChapterSelection(chapterId: number): void {
    console.log('toggleChapterSelection', chapterId);
    const chapter = this.selectedChapters.find(ch => ch.chapterId === chapterId);
    console.log({ chapter });

    if (chapter) {
      // chapter.selected = !chapter.selected;
      const selectedIds = this.selectedChapters
        .filter(ch => ch.selected)
        .map(ch => ch.chapterId);
      console.log({ selectedIds });

      this.testForm.patchValue({ selectedChapterIds: selectedIds });
    }
  }
  validateLevelWiseTest(): boolean {
    const totalQuestions = Object.values(this.levelCounts).reduce((sum, count) => sum + count, 0);

    if (totalQuestions === 0) {
      this.notification.error('Error', 'Please add questions for at least one difficulty level');
      return false;
    }

    if (totalQuestions !== 100) {
      this.notification.error('Error', 'Total questions must equal 100');
      return false;
    }

    const selectedChapters = this.selectedChapters.filter(ch => ch.selected);
    if (selectedChapters.length === 0) {
      this.notification.error('Error', 'Please select at least one chapter');
      return false;
    }

    return true;
  }

  // Add new methods for topic-wise test
  createTopicFormGroup(topic: Topic) {
    return this.fb.group({
      topicId: [topic.id],
      topicName: [topic.name],
      questionCount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        this.validateTopicQuestionCount.bind(this)
      ]]
    });
  }
  // Add validator for topic question count
  validateTopicQuestionCount(control: AbstractControl): { [key: string]: any } | null {
    if (!control.parent || !this.showRemainingQuestions) {
      return null;
    }

    const questionCount = control.value || 0;
    const currentTotal = this.calculateTotalTopicQuestionsExcludingCurrent(control.parent);

    if (currentTotal + questionCount > 100) {
      return { exceededTotal: true };
    }
    return null;
  }
  onChapterChange(chapterId: number): void {
    if (!this.selectedSubject) return;

    this.selectedChapter = this.selectedSubject.chapters.find(ch => ch.id === chapterId) || null;

    // Clear existing topics
    while (this.topicsArray.length) {
      this.topicsArray.removeAt(0);
    }

    // Add new topic form groups
    if (this.selectedChapter) {
      this.selectedChapter.topics.forEach(topic => {
        this.topicsArray.push(this.createTopicFormGroup(topic));
      });
    }
  }



  get topicsArray(): FormArray {
    return this.testForm.get('topics') as FormArray;
  }
  createChapterFormGroup(chapter: any) {
    return this.fb.group({
      chapterId: [chapter.id, Validators.required],
      chapterName: [chapter.name],
      questionCount: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  get chaptersArray(): FormArray {
    return this.testForm.get('chapters') as FormArray;
  }

  get groupSubjectsArray(): FormArray {
    return this.testForm.get('groupSubjects') as FormArray;
  }

  onTestTypeChange(testType: string): void {
    console.log({ testType });

    // Clear existing arrays
    while (this.chaptersArray.length) {
      this.chaptersArray.removeAt(0);
    }
    while (this.groupSubjectsArray.length) {
      this.groupSubjectsArray.removeAt(0);
    }
    while (this.topicsArray.length) {
      this.topicsArray.removeAt(0);
    }
    // Reset remaining questions
    this.remainingQuestions = 100;

    // IMPORTANT: Set showRemainingQuestions based on test type
    this.showRemainingQuestions = [
      'Create Topic Wise Test',
      'Create PYQ Wise Test',
      'Create Numerical Wise Test',
      'Create Theoretical Wise Test',
      'Create Chapter Wise Test',
      'Create Subject Wise Test',
      'Create Random Test'
    ].includes(testType);

    console.log('Set showRemainingQuestions to:', this.showRemainingQuestions);
    if (testType === 'Create Topic Wise Test') {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('chapterId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
      this.testForm.get('chapterId')?.updateValueAndValidity();
      // this.remainingQuestions = 100;
      // this.showRemainingQuestions = true;
      console.log('showRemainingQuestions', this.showRemainingQuestions)
    }

    if (testType === 'Create Group Wise Test') {
      this.testForm.get('subjectId')?.clearValidators();
      this.testForm.get('subjectId')?.updateValueAndValidity();
      const currentStandard = this.testForm.get('standard')?.value;
      this.onStandardChange(currentStandard);

      this.subjects.forEach((subject: any) => {
        const chaptersFormArray = this.fb.array(
          subject.chapters.map((chapter: any) => this.createChapterFormGroup(chapter))
        );

        const subjectGroup = this.fb.group({
          subjectId: [subject.id],
          subjectName: [subject.name],
          chapters: chaptersFormArray
        });

        this.groupSubjectsArray.push(subjectGroup);
      });
    } else {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
    }

    if (testType === 'Create Weightage Wise Test') {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
    }

    if (testType === 'Create PYQ Wise Test') {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
      this.remainingQuestions = 100;
      this.showRemainingQuestions = true;
    } else {
      this.showRemainingQuestions = false;
    }

    if (testType === 'Create Numerical Wise Test' || testType === 'Create Theoretical Wise Test' || testType === 'Create Chapter Wise Test' || testType === 'Create Subject Wise Test') {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
      this.remainingQuestions = 100;
      this.showRemainingQuestions = true;
    }

    if (testType === 'Create Random Test') {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
      this.remainingQuestions = 100;
      this.showRemainingQuestions = true;
    }

    if (testType === 'Level Wise Test') {
      this.testForm.get('subjectId')?.setValidators([Validators.required]);
      this.testForm.get('subjectId')?.updateValueAndValidity();
      this.resetLevelCounts();
    }
  }
  resetLevelCounts(): void {
    this.levelCounts = { easy: 0, medium: 0, hard: 0 };
    this.remainingLevelCount = 100;
    const levelWiseGroup = this.testForm.get('levelWise') as FormGroup;
    levelWiseGroup.patchValue({
      easy: 0,
      medium: 0,
      hard: 0
    });
  }
  onTopicQuestionCountChange(event: any, index: number): void {
    console.log('onTopicQuestionCountChange triggered', { event, index });

    const newValue = parseInt(event.target.value) || 0;
    const control = this.topicsArray.at(index);
    const currentTotal = this.calculateTotalTopicQuestionsExcludingCurrent(control);

    console.log({
      newValue,
      currentTotal,
      showRemainingQuestions: this.showRemainingQuestions,
      topicsArrayLength: this.topicsArray.length
    });

    if (currentTotal + newValue > 100) {
      const maxAllowed = 100 - currentTotal;
      control.patchValue({ questionCount: maxAllowed });
      this.notification.warning(
        'Question Limit',
        `Maximum allowed questions for this topic: ${maxAllowed}`
      );
    } else {
      control.patchValue({ questionCount: newValue });
    }

    // Force update remaining questions and form value
    setTimeout(() => {
      this.updateTopicRemainingQuestions();
      this.testForm.updateValueAndValidity();
    });
  }
  calculateTotalExcludingCurrentTopic(currentIndex: number): number {
    return this.topicsArray.controls.reduce((sum, control, index) => {
      if (index === currentIndex) return sum;
      return sum + (control.get('questionCount')?.value || 0);
    }, 0);
  }

  // / Add this helper method to calculate total questions excluding current topic
  calculateTotalTopicQuestionsExcludingCurrent(control: AbstractControl): number {
    if (!this.topicsArray) return 0;

    return this.topicsArray.controls.reduce((total, topicControl) => {
      if (topicControl === control) return total;
      return total + (topicControl.get('questionCount')?.value || 0);
    }, 0);
  }

  // Add this method to update remaining questions for topics
  updateTopicRemainingQuestions(): void {
    console.log('updateTopicRemainingQuestions called', {
      showRemainingQuestions: this.showRemainingQuestions
    });

    if (!this.showRemainingQuestions) {
      console.log('Exiting early - showRemainingQuestions is false');
      return;
    }

    const totalQuestions = this.topicsArray.controls.reduce(
      (sum, control) => {
        const value = control.get('questionCount')?.value || 0;
        console.log('Adding question count:', value);
        return sum + value;
      },
      0
    );

    console.log('Calculated totalQuestions:', totalQuestions);

    this.remainingQuestions = 100 - totalQuestions;
    console.log('Updated remainingQuestions:', this.remainingQuestions);

    // Force the form update
    this.testForm.patchValue({
      remainingCount: this.remainingQuestions
    }, { emitEvent: true });
  }



  // Update the validation for topic-wise test
  validateTopicWiseTest(): boolean {
    if (this.testForm.get('testType')?.value === 'Create Topic Wise Test') {
      const totalQuestions = this.topicsArray.controls.reduce(
        (sum, control) => sum + (control.get('questionCount')?.value || 0),
        0
      );

      if (totalQuestions === 0) {
        this.notification.error('Error', 'Please add at least one question');
        return false;
      }

      if (totalQuestions > 100) {
        this.notification.error('Error', 'Total questions cannot exceed 100');
        return false;
      }
    }
    return true;
  }

  createPYQChapterFormGroup(chapter: any) {
    return this.fb.group({
      chapterId: [chapter.id, Validators.required],
      chapterName: [chapter.name],
      questionCount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        this.validatePYQQuestionCount.bind(this)
      ]]
    });
  }
  createQuestionTypeChapterFormGroup(chapter: any) {
    return this.fb.group({
      chapterId: [chapter.id, Validators.required],
      chapterName: [chapter.name],
      questionCount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        this.validateQuestionCount.bind(this)
      ]],
      availableCount: [chapter.questionCount || 0], // Add this to track available questions
      selected: [false] // Add this to track if the chapter is selected
    });
  }

  createRandomTestChapterFormGroup(chapter: any) {
    return this.fb.group({
      chapterId: [chapter.id, Validators.required],
      chapterName: [chapter.name],
      questionCount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        this.validateRandomQuestionCount.bind(this)
      ]]
    });
  }

  validateRandomQuestionCount(control: AbstractControl): { [key: string]: any } | null {
    if (!control.parent || !this.showRemainingQuestions) {
      return null;
    }

    const questionCount = control.value || 0;
    const currentTotal = this.calculateTotalExcludingCurrent(control.parent);

    if (currentTotal + questionCount > 100) {
      return { exceededTotal: true };
    }
    return null;
  }

  onRandomTestSubjectChange(subjectId: number): void {
    while (this.chaptersArray.length) {
      this.chaptersArray.removeAt(0);
    }

    const subject = this.subjects.find((sub: any) => sub.id === subjectId);
    if (subject) {
      subject.chapters.forEach((chapter: any) => {
        this.chaptersArray.push(this.createRandomTestChapterFormGroup(chapter));
      });
    }

    this.remainingQuestions = 100;
    this.updateRemainingQuestions();
  }

  onRandomQuestionCountChange(event: any, index: number): void {
    const newValue = parseInt(event.target.value) || 0;
    const control = this.chaptersArray.at(index);
    const currentTotal = this.calculateTotalExcludingCurrent(control);

    if (currentTotal + newValue > 100) {
      const maxAllowed = 100 - currentTotal;
      control.patchValue({ questionCount: maxAllowed });
      this.notification.warning(
        'Question Limit',
        `Maximum allowed questions for this chapter: ${maxAllowed}`
      );
    }

    this.updateRemainingQuestions();
  }

  validateRandomTest(): boolean {
    if (this.testForm.get('testType')?.value === 'Create Random Test') {
      const totalQuestions = this.chaptersArray.controls.reduce(
        (sum, control) => sum + (control.get('questionCount')?.value || 0),
        0
      );

      if (totalQuestions === 0) {
        this.notification.error('Error', 'Please add at least one question');
        return false;
      }

      if (totalQuestions > 100) {
        this.notification.error('Error', 'Total questions cannot exceed 100');
        return false;
      }
    }
    return true;
  }


  validateQuestionCount(control: AbstractControl): { [key: string]: any } | null {
    if (!control.parent || !this.showRemainingQuestions) {
      return null;
    }

    const questionCount = control.value || 0;
    const currentTotal = this.calculateTotalExcludingCurrent(control.parent);

    if (currentTotal + questionCount > 100) {
      return { exceededTotal: true };
    }
    return null;
  }
  onQuestionTypeSubjectChange(subjectId: number): void {
    this.chaptersArray.clear(); // Clear existing chapters

    while (this.chaptersArray.length) {
      this.chaptersArray.removeAt(0);
    }

    const subject = this.subjects.find((sub: any) => sub.id === subjectId);
    if (subject) {
      subject.chapters.forEach((chapter: any) => {
        this.chaptersArray.push(this.createQuestionTypeChapterFormGroup(chapter));
      });
    }

    this.remainingQuestions = 100;
    this.updateRemainingQuestions();
  }
  remainingQuestionsMap: { [subjectIndex: number]: number } = {};

  onQuestionCountChange(event: any, index: number): void {
    const newValue = parseInt(event.target.value) || 0;
    const control = this.chaptersArray.at(index);
    const currentTotal = this.calculateTotalExcludingCurrent(control);

    if (currentTotal + newValue > 100) {
      const maxAllowed = 100 - currentTotal;
      control.patchValue({ questionCount: maxAllowed });
      this.notification.warning(
        'Question Limit',
        `Maximum allowed questions for this chapter: ${maxAllowed}`
      );
    }

    this.updateRemainingQuestions();
  }

  onQuestionCountChangs(subjectIndex: number, chapterIndex: number, event: any): void {
    const newValue = parseInt(event.target.value) || 0;
    const subjectGroup = this.groupSubjectsArray.at(subjectIndex);
    const chapters = subjectGroup.get('chapters') as FormArray;
    const currentChapter = chapters.at(chapterIndex);

    // Calculate total excluding current chapter
    const totalExcludingCurrent = chapters.controls.reduce((total, chapter, idx) => {
      if (idx === chapterIndex) return total;
      return total + (chapter.get('questionCount')?.value || 0);
    }, 0);

    // Check if new total would exceed 100
    if (totalExcludingCurrent + newValue > 100) {
      const maxAllowed = 100 - totalExcludingCurrent;
      currentChapter.patchValue({ questionCount: maxAllowed }, { emitEvent: false });

      this.notification.warning(
        'Question Limit',
        `Maximum allowed questions for this chapter: ${maxAllowed}`
      );
    }

    // Update remaining questions for this subject
    this.updateRemainingQuestionss(subjectIndex);
  }
  updateRemainingQuestionss(subjectIndex: number): void {
    const total = this.getTotalQuestionsForSubjects(subjectIndex);
    this.remainingQuestionsMap[subjectIndex] = Math.max(0, 100 - total);
  }
  getTotalQuestionsForSubjects(subjectIndex: number): number {
    const subjectGroup = this.groupSubjectsArray.at(subjectIndex);
    if (!subjectGroup) return 0;

    const chapters = subjectGroup.get('chapters') as FormArray;
    return chapters.controls.reduce((total, chapter) => {
      return total + (chapter.get('questionCount')?.value || 0);
    }, 0);
  }


  validateQuestionTypeTest(): boolean {
    if (this.testForm.get('testType')?.value === 'Create Numerical Wise Test' ||
      this.testForm.get('testType')?.value === 'Create Theoretical Wise Test' ||
      this.testForm.get('testType')?.value === 'Create Chapter Wise Test' ||
      this.testForm.get('testType')?.value === 'Create Subject Wise Test') {
      const totalQuestions = this.chaptersArray.controls.reduce(
        (sum, control) => sum + (control.get('questionCount')?.value || 0),
        0
      );

      if (totalQuestions === 0) {
        this.notification.error('Error', 'Please add at least one question');
        return false;
      }

      if (totalQuestions > 100) {
        this.notification.error('Error', 'Total questions cannot exceed 100');
        return false;
      }
    }
    return true;
  }


  validatePYQQuestionCount(control: AbstractControl): { [key: string]: any } | null {
    if (!control.parent || !this.showRemainingQuestions) {
      return null;
    }

    const questionCount = control.value || 0;
    const currentTotal = this.calculateTotalExcludingCurrent(control.parent);

    if (currentTotal + questionCount > 100) {
      return { exceededTotal: true };
    }
    return null;
  }

  calculateTotalExcludingCurrent(group: AbstractControl): number {
    if (!this.chaptersArray) return 0;

    return this.chaptersArray.controls.reduce((total, control) => {
      if (control === group) return total;
      return total + (control.get('questionCount')?.value || 0);
    }, 0);
  }
  onPYQSubjectChange(subjectId: number): void {
    // Clear existing chapters
    while (this.chaptersArray.length) {
      this.chaptersArray.removeAt(0);
    }

    const subject = this.subjects.find((sub: any) => sub.id === subjectId);
    if (subject) {
      subject.chapters.forEach((chapter: any) => {
        this.chaptersArray.push(this.createPYQChapterFormGroup(chapter));
      });
    }

    this.remainingQuestions = 100;
    this.updateRemainingQuestions();
  }
  updateRemainingQuestions(): void {
    if (!this.showRemainingQuestions) return;

    const totalQuestions = this.chaptersArray.controls.reduce(
      (sum, control) => sum + (control.get('questionCount')?.value || 0),
      0
    );

    this.remainingQuestions = 100 - totalQuestions;
    console.log({ remainingQuestions: this.remainingQuestions });

    this.testForm.patchValue({ remainingCount: this.remainingQuestions });
  }
  onPYQQuestionCountChange(event: any, index: number): void {
    const newValue = parseInt(event.target.value) || 0;
    const control = this.chaptersArray.at(index);
    const currentTotal = this.calculateTotalExcludingCurrent(control);

    if (currentTotal + newValue > 100) {
      const maxAllowed = 100 - currentTotal;
      control.patchValue({ questionCount: maxAllowed });
      this.notification.warning(
        'Question Limit',
        `Maximum allowed questions for this chapter: ${maxAllowed}`
      );
    }

    this.updateRemainingQuestions();
  }

  validatePYQTest(): boolean {
    if (this.testForm.get('testType')?.value === 'Create PYQ Wise Test') {
      const totalQuestions = this.chaptersArray.controls.reduce(
        (sum, control) => sum + (control.get('questionCount')?.value || 0),
        0
      );

      if (totalQuestions === 0) {
        this.notification.error('Error', 'Please add at least one question');
        return false;
      }

      if (totalQuestions > 100) {
        this.notification.error('Error', 'Total questions cannot exceed 100');
        return false;
      }
    }
    return true;
  }

  getSubjectWeightage(subjectId: number): SubjectWeightage | undefined {
    return this.weightageConfigs.find((config: any) => config.subjectId === subjectId);
  }

  calculateChapterQuestions(weightage: number, totalQuestions: number): number {
    return Math.round((weightage / 100) * totalQuestions);
  }
  distributeRemainingQuestions(chapters: AbstractControl[], remainingQuestions: number): void {
    // Distribute remaining questions to maintain total
    for (let i = 0; i < Math.abs(remainingQuestions); i++) {
      const idx = i % chapters.length;
      const currentCount = chapters[idx].get('questionCount')?.value || 0;
      chapters[idx].get('questionCount')?.setValue(
        remainingQuestions > 0 ? currentCount + 1 : currentCount - 1
      );
    }
  }

  onWeightageSubjectChange(subjectId: number): void {
    // Clear existing chapters
    while (this.chaptersArray.length) {
      this.chaptersArray.removeAt(0);
    }

    const subject = this.subjects.find((sub: any) => sub.id === subjectId);
    const weightageConfig = this.getSubjectWeightage(subjectId);

    if (subject && weightageConfig) {
      const totalQuestions = this.testForm.get('totalQuestions')?.value || 100;
      let totalWeightage = 0;

      // First calculate total weightage for the subject
      weightageConfig.chapters.forEach(chapterWeightage => {
        totalWeightage += chapterWeightage.weightage;
      });

      let assignedQuestions = 0;

      // Create chapter form groups with weighted question counts
      subject.chapters.forEach((chapter: any) => {
        const chapterWeightage = weightageConfig.chapters.find(
          config => config.chapterId === chapter.id
        );

        if (chapterWeightage) {
          // Calculate questions based on chapter's proportion of total weightage
          let questionCount = 0;
          if (totalWeightage > 0) {
            questionCount = Math.floor((chapterWeightage.weightage / totalWeightage) * totalQuestions);
          }
          assignedQuestions += questionCount;

          const chapterGroup = this.createChapterFormGroup(chapter);
          chapterGroup.patchValue({ questionCount });
          this.chaptersArray.push(chapterGroup);
          console.log({ weightageConfig })
        } else {
          // Handle chapters with no weightage configuration
          const chapterGroup = this.createChapterFormGroup(chapter);
          chapterGroup.patchValue({ questionCount: 0 });
          this.chaptersArray.push(chapterGroup);
        }
      });

      // Distribute any remaining questions due to rounding
      const remainingQuestions = totalQuestions - assignedQuestions;
      if (remainingQuestions > 0) {
        // Distribute remaining questions to chapters with highest weightage first
        const sortedChapters = [...this.chaptersArray.controls].sort((a, b) => {
          const aWeightage = weightageConfig.chapters.find(
            c => c.chapterId === a.get('chapterId')?.value
          )?.weightage || 0;
          const bWeightage = weightageConfig.chapters.find(
            c => c.chapterId === b.get('chapterId')?.value
          )?.weightage || 0;
          return bWeightage - aWeightage;
        });

        for (let i = 0; i < remainingQuestions; i++) {
          const chapter = sortedChapters[i % sortedChapters.length];
          const currentCount = chapter.get('questionCount')?.value || 0;
          chapter.get('questionCount')?.setValue(currentCount + 1);
        }
      }
    }
  }
  // Helper function to get total weightage for a subject
  getTotalWeightage(weightageConfig: any): number {
    return weightageConfig.chapters.reduce((total: number, chapter: any) => {
      return total + (chapter.weightage || 0);
    }, 0);
  }
  onTotalQuestionsChange(totalQuestions: number): void {
    if (this.testForm.get('testType')?.value === 'Create Weightage Wise Test') {
      const subjectId = this.testForm.get('subjectId')?.value;
      if (subjectId) {
        this.onWeightageSubjectChange(subjectId);
      }
    }
  }

  onSubjectChange(subjectId: number): void {

    this.selectedSubject = this.subjects.find((sub: any) => sub.id === subjectId) || null;
    this.selectedChapter = null;
    this.testForm.get('chapterId')?.reset();
    const testType = this.testForm.get('testType')?.value;

    // Ensure showRemainingQuestions is set correctly based on test type
    this.showRemainingQuestions = [
      'Create Topic Wise Test',
      'Create PYQ Wise Test',
      'Create Numerical Wise Test',
      'Create Theoretical Wise Test',
      'Create Chapter Wise Test',
      'Create Subject Wise Test',
      'Create Random Test'
    ].includes(testType);
    // Clear existing arrays based on test type
    if (this.testForm.get('testType')?.value === 'Create Topic Wise Test') {
      while (this.topicsArray.length) {
        this.topicsArray.removeAt(0);
      }
      this.remainingQuestions = 100;
    } else {
      // ... existing chapter-wise logic ...
      // Clear existing chapters
      while (this.chaptersArray.length) {
        this.chaptersArray.removeAt(0);
      }

      const subject = this.subjects.find((sub: any) => sub.id === subjectId);
      if (subject) {
        subject.chapters.forEach((chapter: any) => {
          this.chaptersArray.push(this.createChapterFormGroup(chapter));
        });
      }
    }



    console.log('Set showRemainingQuestions to:', this.showRemainingQuestions);
    if (testType === 'Create Numerical Wise Test' || testType === 'Create Theoretical Wise Test' || testType === 'Create Chapter Wise Test' || testType === 'Create Subject Wise Test') {
      this.onQuestionTypeSubjectChange(subjectId);
    }
    if (testType === 'Create Random Test') {
      this.onRandomTestSubjectChange(subjectId);
    }
  }

  getChapters(group: AbstractControl): AbstractControl[] {
    const chaptersFormArray = group.get('chapters') as FormArray;
    return chaptersFormArray.controls;
  }

  validateTotalQuestions(): boolean {
    const totalQuestions = this.chaptersArray.controls.reduce((sum, control) => sum + control.value.questionCount, 0);
    if (totalQuestions > 100) {
      this.notification.error('Error', 'Total questions cannot exceed 100. Please adjust the counts.');
      return false;
    }

    const groupTotalQuestions = this.groupSubjectsArray.controls.reduce((sum, groupControl) => {
      const chapters = (groupControl.get('chapters') as FormArray).controls;
      return sum + chapters.reduce((chapterSum, chapterControl) => chapterSum + chapterControl.value.questionCount, 0);
    }, 0);

    if (this.testForm.get('testType')?.value === 'Create Topic Wise Test') {
      const totalQuestions = this.topicsArray.controls.reduce(
        (sum, control) => sum + control.get('questionCount')?.value || 0,
        0
      );

      if (totalQuestions > 100) {
        this.notification.error('Error', 'Total questions in topics cannot exceed 100. Please adjust the counts.');
        return false;
      }
    }

    if (this.testForm.get('testType')?.value === 'Create Weightage Wise Test') {
      const totalQuestions = this.chaptersArray.controls.reduce(
        (sum, control) => sum + (control.get('questionCount')?.value || 0),
        0
      );

      if (totalQuestions !== this.testForm.get('totalQuestions')?.value) {
        this.notification.error(
          'Error',
          'Question distribution does not match the total questions required'
        );
        return false;
      }
    }

    if (groupTotalQuestions > 100) {
      // this.notification.error('Error', 'Total questions in group subjects cannot exceed 100. Please adjust the counts.');
      // return false;
    }

    return true;
  }


  saveTest(): void {
    if (this.testForm.valid) {
      if (!this.validateTotalQuestions()) {
        return;
      }

      const totalQuestions = this.chaptersArray.controls.reduce(
        (sum, control) => sum + control.value.questionCount,
        0
      );

      if (totalQuestions > 100) {
        this.notification.error('Error', 'Total questions should not exceed 100');
        return;
      }

      const reqObj = {
        ...this.testForm.value,
        id: Number(sessionStorage.getItem('studentId'))
      };

      this.http.postRequest(`api/test/createstudenttest`, reqObj).subscribe({
        next: (response) => {
          console.log({ response });
          this.notification.success('Success', 'Test saved successfully!');
          const boardName = this.activateROut.snapshot.paramMap.get('name');
          this.route.navigateByUrl(`student/${boardName}/dashboard`)
        },
        error: (err) => {
          console.error('Test creation error:', err);

          const errorMessage = err?.error?.message || 'Something went wrong!!!';

          if (
            err?.status === 400 &&
            errorMessage.includes('Requested questions exceed available questions')
          ) {
            this.notification.error('Validation Error', errorMessage);
          } else {
            this.notification.error('Error', errorMessage);
          }
        }
      });
    } else {
      this.notification.error('Error', 'Please fill out all required fields');
    }
  }

}

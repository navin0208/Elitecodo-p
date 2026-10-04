import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { testMaster, testCreationMaster } from 'src/app/shared/AllModel';

interface SelectedSubject {
  subjectId: number;
  subjectName: string;
}

interface SelectedChapter {
  chapterId: number;
  chapterName: string;
  subjectId: number;
  subjectName: string;
}

@Component({
  selector: 'app-test-creation',
  templateUrl: './test-creation.component.html',
  styleUrls: ['./test-creation.component.scss'],
})
export class TestCreationComponent {
  subjectList: any;
  type: any;

  standardIds: any;
  subjectIds: any;
  selectedSubjectsList: SelectedSubject[] = [];
  selectedChaptersList: SelectedChapter[] = [];

  selectedQuestionList: any = [];
  testMasterModel = new testMaster();

  testCreateMasterModel = new testCreationMaster();
  entranceExamId: any;

  teacherId: any;
  QuestionLevelsList: any;
  firstBoxValue: number | null = null;
  secondBoxValue: number | null = null;

  firstBoxError: string | null = null;
  secondBoxError: string | null = null;

  buttons: any = [];

  questionObj = {
    index: 0,
    questionId: [],
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    multiAnswers: [],
    explanation: '',
    marks: 0,
  };

  marks: any = null;
  selectedQueArray: any = [];
  defaultQuestionList: any = [];
  tempQuestionReqArr: any = [];
  categorizeQuestionsList: any;
  paginationData: any;
  totalMarksShow: any;
  setsList: any = [];

  // Edit mode properties
  isEditMode: boolean = false;
  editTestId: number | null = null;
  isLoadingEdit: boolean = false;
  showEditConfig: boolean = false;

  // Available subjects and chapters for edit mode
  allAvailableSubjects: any[] = [];
  allAvailableChapters: any[] = [];
  selectedSubjectIdsForEdit: number[] = [];
  selectedChapterIdsForEdit: number[] = [];

  // Store original selected questions for comparison
  originalSelectedQuestions: any[] = [];

  constructor(
    public http: HttpmethodsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getQuestionLevels();

    this.route.queryParams.subscribe((queryParams) => {
      this.type = queryParams['type'];
      console.log('🔍 Query Params:', queryParams);
      
      if (queryParams['mode'] === 'edit' && queryParams['testId']) {
        this.isEditMode = true;
        this.editTestId = Number(queryParams['testId']);
        console.log('✏️ EDIT MODE detected for test ID:', this.editTestId);
        this.loadTestForEdit(this.editTestId);
        return;
      }

      console.log('🆕 CREATION MODE');
      this.initializeForCreation(queryParams);
    });
  }

  initializeForCreation(queryParams: any): void {
    this.getSubjectList()
      .then(() => {
        this.standardIds = JSON.parse(
          sessionStorage.getItem('selectedStandardIds') || '[]'
        );

        this.subjectIds = JSON.parse(
          sessionStorage.getItem('selectedSubjectIds') || '[]'
        );

        this.selectedSubjectsList = this.subjectIds.map((id: number) => ({
          subjectId: id,
          subjectName: this.getSubjectNameById(id),
        }));

        sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));

        this.teacherId = queryParams['createdBy'];

        this.testMasterModel = {
          ...this.testMasterModel,
          subjectIds: JSON.parse(
            sessionStorage.getItem('selectedSubjectIds') || '[]'
          ),
          standardIds: JSON.parse(
            sessionStorage.getItem('selectedStandardIds') || '[]'
          ),
          teacherId: Number(sessionStorage.getItem('teacherId')),
          chapterIds: JSON.parse(
            sessionStorage.getItem('selectedChapterIds') || '[]'
          ),
          topicIds: JSON.parse(
            sessionStorage.getItem('selectedTopicIds') || '[]'
          ),
          questionLevel: null,
          questionCategory: null,
          pyq: false,
          pageSize: 20,
          currentPage: 1,
          selectedSubjects: this.selectedSubjectsList,
        };

        if (this.type === 'numerical') {
          this.testMasterModel.questionCategory = 'Numerical';
        } else if (this.type === 'theoretical') {
          this.testMasterModel.questionCategory = 'Theoretical';
        } else {
          this.testMasterModel.questionCategory = null;
        }

        this.getQuestions();

        this.testCreateMasterModel = {
          ...this.testCreateMasterModel,
          testName: '',
          marks: 100,
          entranceExamId: Number(
            sessionStorage.getItem('entranceExamIdOfTeacher')
          ),
          standardId: JSON.parse(
            sessionStorage.getItem('selectedStandardIds') || '[]'
          ),
          subjectId: JSON.parse(
            sessionStorage.getItem('selectedSubjectIds') || '[]'
          ),
          chapterMasters: JSON.parse(
            sessionStorage.getItem('selectedChapterIds') || '[]'
          ),
          topicMasters: JSON.parse(
            sessionStorage.getItem('selectedTopicIds') || '[]'
          ),
          examSetRequests: [],
          createdBy: Number(sessionStorage.getItem('teacherId')),
          typeOfTest: queryParams['type'],
          status: 'Active',
          testDate: '',
          startTime: '',
          endTime: '',
          selectedSubjects: this.selectedSubjectsList,
        };

        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error loading subjects:', error);
        alert('Failed to load subjects. Please try again.');
      });
  }

  /**
   * Load test data for editing
   */
  loadTestForEdit(testId: number): void {
    this.isLoadingEdit = true;
    console.log('🔄 Loading test for edit, ID:', testId);
    
    // First, fetch all available subjects for the teacher
    this.getAllAvailableSubjects().then(() => {
      // Then load the test data
      this.http.getRequest(`api/test/getbyid/${testId}`).subscribe({
        next: (response: any) => {
          console.log('✅ Edit test data received:', response);
          this.processTestData(response);
        },
        error: (error: any) => {
          console.error('❌ Error response:', error);
          this.isLoadingEdit = false;
          alert('Failed to load test data. Please try again.');
        }
      });
    }).catch((error) => {
      console.error('Failed to load subjects:', error);
      this.isLoadingEdit = false;
    });
  }

  /**
   * Get all available subjects for the teacher
   */
  getAllAvailableSubjects(): Promise<any> {
    return new Promise((resolve, reject) => {
      let selectedStandardIds = JSON.parse(
        sessionStorage.getItem('selectedStandardIds') || '[]'
      );
      
      if (!selectedStandardIds || selectedStandardIds.length === 0) {
        const teacherId = sessionStorage.getItem('teacherId');
        const entranceExamId = sessionStorage.getItem('entranceExamIdOfTeacher');
        
        console.log('📚 No standards in sessionStorage, fetching from API...');
        
        this.http
          .getRequest(`api/auth/userandentrancewisestandards/${teacherId}/${entranceExamId}`)
          .subscribe({
            next: (standardsResponse: any) => {
              console.log('📚 Standards response:', standardsResponse);
              if (standardsResponse && standardsResponse.length > 0) {
                selectedStandardIds = standardsResponse.map((s: any) => s.standardId);
                sessionStorage.setItem('selectedStandardIds', JSON.stringify(selectedStandardIds));
                this.fetchSubjectsForStandards(selectedStandardIds, resolve, reject);
              } else {
                this.fetchAllSubjectsAsFallback(resolve, reject);
              }
            },
            error: (error) => {
              console.error('Error fetching standards:', error);
              this.fetchAllSubjectsAsFallback(resolve, reject);
            }
          });
      } else {
        this.fetchSubjectsForStandards(selectedStandardIds, resolve, reject);
      }
    });
  }

  /**
   * Fetch subjects for given standard IDs
   */
  fetchSubjectsForStandards(standardIds: any[], resolve: any, reject: any): void {
    if (!standardIds || standardIds.length === 0) {
      this.fetchAllSubjectsAsFallback(resolve, reject);
      return;
    }
    
    this.http
      .postRequest(`api/lookup/standards/subjects`, {
        standardIds: standardIds
      })
      .subscribe({
        next: (response: any) => {
          console.log('📚 Available subjects response:', response);
          
          let allSubjects: any[] = [];
          if (response && response.length > 0) {
            response.forEach((standard: any) => {
              if (standard.subjects && standard.subjects.length > 0) {
                standard.subjects.forEach((subject: any) => {
                  allSubjects.push({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    standardId: standard.standardId,
                    standardName: standard.standardName
                  });
                });
              }
            });
          }
          
          const uniqueSubjects = allSubjects.filter((subject, index, self) =>
            index === self.findIndex((s) => s.subjectId === subject.subjectId)
          );
          
          this.allAvailableSubjects = uniqueSubjects;
          console.log('📚 Unique subjects loaded:', this.allAvailableSubjects.length);
          
          resolve(this.allAvailableSubjects);
        },
        error: (error) => {
          console.error('Error fetching subjects:', error);
          this.fetchAllSubjectsAsFallback(resolve, reject);
        }
      });
  }

  /**
   * Fallback: Fetch all subjects directly
   */
  fetchAllSubjectsAsFallback(resolve: any, reject: any): void {
    console.log('📚 Using fallback: fetching all active subjects');
    this.http.getRequest(`api/subject/getallactive`).subscribe({
      next: (response: any) => {
        console.log('📚 All subjects (fallback):', response);
        if (response && response.length > 0) {
          this.allAvailableSubjects = response.map((s: any) => ({
            subjectId: s.subjectId,
            subjectName: s.subjectName
          }));
          console.log('📚 Subjects loaded via fallback:', this.allAvailableSubjects.length);
          resolve(this.allAvailableSubjects);
        } else {
          resolve([]);
        }
      },
      error: (error) => {
        console.error('Error fetching all subjects:', error);
        resolve([]);
      }
    });
  }

  /**
   * Fetch chapters for selected subjects in edit mode
   */
  fetchChaptersForEdit(subjectIds: number[]): void {
    if (!subjectIds || subjectIds.length === 0) {
      this.allAvailableChapters = [];
      this.selectedChapterIdsForEdit = [];
      this.cdr.detectChanges();
      return;
    }
    
    console.log('📚 Fetching chapters for subjects:', subjectIds);
    
    this.http
      .postRequest(`api/lookup/subjects/chapters`, {
        subjectIds: subjectIds
      })
      .subscribe({
        next: (response: any) => {
          console.log('📚 Chapters response:', response);
          
          let allChapters: any[] = [];
          if (response && response.length > 0) {
            response.forEach((subject: any) => {
              if (subject.chapters && subject.chapters.length > 0) {
                subject.chapters.forEach((chapter: any) => {
                  allChapters.push({
                    chapterId: chapter.chapterId,
                    chapterName: chapter.chapterName,
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName
                  });
                });
              }
            });
          }
          
          this.allAvailableChapters = allChapters;
          console.log('📚 Chapters loaded:', this.allAvailableChapters.length);
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching chapters:', error);
        }
      });
  }

  /**
   * Process the test data after successful retrieval
   */
  processTestData(testData: any): void {
    console.log('📊 Processing test data:', testData);
    this.isLoadingEdit = false;
    
    try {
      this.marks = testData.marks || 100;
      this.testCreateMasterModel.testName = testData.testName || '';
      this.testCreateMasterModel.marks = testData.marks || 100;
      this.testCreateMasterModel.typeOfTest = testData.typeOfTest || this.type;
      this.testCreateMasterModel.testDate = testData.testDate || '';
      this.testCreateMasterModel.startTime = testData.startTime || '';
      this.testCreateMasterModel.endTime = testData.endTime || '';
      
      console.log('📝 Test Name:', this.testCreateMasterModel.testName);

      if (testData.selectedSubjects && testData.selectedSubjects.length > 0) {
        this.selectedSubjectsList = testData.selectedSubjects;
        this.selectedSubjectIdsForEdit = testData.selectedSubjects.map((s: any) => s.subjectId);
        sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));
        this.testCreateMasterModel.selectedSubjects = this.selectedSubjectsList;
        console.log('📚 Subjects loaded:', this.selectedSubjectsList.length);
      }

      let allQuestions: any[] = [];
      let allChapters: SelectedChapter[] = [];
      
      if (testData.selectedChapters && testData.selectedChapters.length > 0) {
        console.log('📚 Number of chapters:', testData.selectedChapters.length);
        testData.selectedChapters.forEach((chapter: any) => {
          let subjectId = 0;
          let subjectName = '';
          
          for (const subject of this.selectedSubjectsList) {
            if (this.allAvailableChapters.some(c => 
              c.chapterId === chapter.chapterId && c.subjectId === subject.subjectId
            )) {
              subjectId = subject.subjectId;
              subjectName = subject.subjectName;
              break;
            }
          }
          
          allChapters.push({
            chapterId: chapter.chapterId,
            chapterName: chapter.chapterName,
            subjectId: subjectId,
            subjectName: subjectName || chapter.subjectName || ''
          });
          
          if (chapter.questions && chapter.questions.length > 0) {
            allQuestions = [...allQuestions, ...chapter.questions];
          }
        });
        
        this.selectedChaptersList = allChapters;
        this.selectedChapterIdsForEdit = allChapters.map(c => c.chapterId);
        console.log('📚 Chapters loaded:', this.selectedChaptersList.length);
      }

      console.log('📝 Total extracted questions:', allQuestions.length);

      this.selectedQueArray = [];
      this.defaultQuestionList = [];
      this.setsList = [];
      this.testCreateMasterModel.examSetRequests = [];
      this.totalMarksShow = 0;

      if (allQuestions.length > 0) {
        // Remove duplicates from extracted questions
        const uniqueQuestions = this.removeDuplicateQuestions(allQuestions);
        this.selectedQueArray = uniqueQuestions;
        this.defaultQuestionList = uniqueQuestions.map((q: any) => q.questionId);
        this.originalSelectedQuestions = [...uniqueQuestions];
        
        sessionStorage.setItem('testSelectedQuestions', JSON.stringify(this.selectedQueArray));
        
        const questionIds = uniqueQuestions.map((q: any) => q.questionId);
        const setObj = {
          examSetName: 'Set A',
          questionIds: questionIds
        };
        
        this.testCreateMasterModel.examSetRequests.push(setObj);
        this.setsList.push([...uniqueQuestions]);
        this.totalMarksShow = this.getTotalMarks();
        
        console.log('✅ Loaded', uniqueQuestions.length, 'questions into Set A (duplicates removed)');
      }

      this.testMasterModel = {
        ...this.testMasterModel,
        subjectIds: this.selectedSubjectsList.map(s => s.subjectId),
        teacherId: Number(sessionStorage.getItem('teacherId')),
        questionLevel: null,
        questionCategory: this.type === 'numerical' ? 'Numerical' : this.type === 'theoretical' ? 'Theoretical' : null,
        pyq: false,
        pageSize: 20,
        currentPage: 1,
        selectedSubjects: this.selectedSubjectsList,
        standardIds: testData.selectedStandards?.map((s: any) => s.standardId) || [],
        chapterIds: this.selectedChapterIdsForEdit,
      };

      this.getQuestions();
      this.cdr.detectChanges();
      
      console.log('✅ FINAL STATE:');
      console.log('  - selectedQueArray length:', this.selectedQueArray.length);
      console.log('  - defaultQuestionList length:', this.defaultQuestionList.length);
      console.log('  - totalMarksShow:', this.totalMarksShow);
      
      const msg = allQuestions.length > 0 
        ? `✅ Test loaded! ${allQuestions.length} questions found. You can add or remove questions.`
        : 'ℹ️ Test loaded. No questions found. Add questions from the available pool.';
      alert(msg);
      
    } catch (error) {
      console.error('❌ Error processing test data:', error);
      alert('Error processing test data. Please check console for details.');
    }
  }

  /**
   * Helper method to remove duplicate questions
   */
  removeDuplicateQuestions(questions: any[]): any[] {
    const seenIds = new Set();
    const uniqueQuestions = questions.filter((q: any) => {
      if (!q.questionId) return false;
      if (seenIds.has(q.questionId)) return false;
      seenIds.add(q.questionId);
      return true;
    });
    
    if (questions.length !== uniqueQuestions.length) {
      console.log(`🗑️ Removed ${questions.length - uniqueQuestions.length} duplicate questions`);
    }
    return uniqueQuestions;
  }

  /**
   * Helper method to add questions with duplicate prevention
   */
  addQuestionsWithDuplicateCheck(questionsToAdd: any[]): number {
    let addedCount = 0;
    const existingIds = new Set(this.defaultQuestionList);
    
    questionsToAdd.forEach((item: any) => {
      if (!existingIds.has(item.questionId)) {
        this.defaultQuestionList.push(item.questionId);
        this.selectedQueArray.push(item);
        existingIds.add(item.questionId);
        addedCount++;
      }
    });
    
    return addedCount;
  }

  /**
   * Toggle subject selection for edit mode - PRESERVE valid questions
   */
  toggleSubjectForEdit(subjectId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      if (!this.selectedSubjectIdsForEdit.includes(subjectId)) {
        this.selectedSubjectIdsForEdit.push(subjectId);
      }
    } else {
      this.selectedSubjectIdsForEdit = this.selectedSubjectIdsForEdit.filter(
        id => id !== subjectId
      );
      // Remove chapters of this subject
      const chaptersToRemove = this.allAvailableChapters
        .filter(c => c.subjectId === subjectId)
        .map(c => c.chapterId);
      this.selectedChapterIdsForEdit = this.selectedChapterIdsForEdit.filter(
        id => !chaptersToRemove.includes(id)
      );
      
      // Remove questions that belong to this subject
      const questionsToRemove = this.selectedQueArray.filter((q: any) => q.subjectId === subjectId);
      if (questionsToRemove.length > 0) {
        const removeIds = new Set(questionsToRemove.map((q: any) => q.questionId));
        this.selectedQueArray = this.selectedQueArray.filter((q: any) => !removeIds.has(q.questionId));
        this.defaultQuestionList = this.defaultQuestionList.filter((id: number) => !removeIds.has(id));
        
        // Update setsList and examSetRequests
        if (this.selectedQueArray.length > 0) {
          this.setsList = [this.selectedQueArray];
          this.testCreateMasterModel.examSetRequests = [{
            examSetName: 'Set A',
            questionIds: this.selectedQueArray.map((q: any) => q.questionId)
          }];
          this.totalMarksShow = this.getTotalMarks();
        } else {
          this.setsList = [];
          this.testCreateMasterModel.examSetRequests = [];
          this.totalMarksShow = 0;
        }
        
        console.log(`🗑️ Removed ${questionsToRemove.length} questions from subject ${subjectId}`);
      }
    }
    
    // Fetch chapters for selected subjects
    if (this.selectedSubjectIdsForEdit.length > 0) {
      this.fetchChaptersForEdit(this.selectedSubjectIdsForEdit);
    } else {
      this.allAvailableChapters = [];
      this.selectedChapterIdsForEdit = [];
      // Clear all questions if no subjects selected
      this.selectedQueArray = [];
      this.defaultQuestionList = [];
      this.setsList = [];
      this.testCreateMasterModel.examSetRequests = [];
      this.totalMarksShow = 0;
    }
    
    this.cdr.detectChanges();
  }

  /**
   * Toggle chapter selection for edit mode - PRESERVE valid questions
   */
  toggleChapterForEdit(chapterId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      if (!this.selectedChapterIdsForEdit.includes(chapterId)) {
        this.selectedChapterIdsForEdit.push(chapterId);
      }
    } else {
      this.selectedChapterIdsForEdit = this.selectedChapterIdsForEdit.filter(
        id => id !== chapterId
      );
      
      // Remove questions that belong to this chapter
      const questionsToRemove = this.selectedQueArray.filter((q: any) => q.chapterId === chapterId);
      if (questionsToRemove.length > 0) {
        const removeIds = new Set(questionsToRemove.map((q: any) => q.questionId));
        this.selectedQueArray = this.selectedQueArray.filter((q: any) => !removeIds.has(q.questionId));
        this.defaultQuestionList = this.defaultQuestionList.filter((id: number) => !removeIds.has(id));
        
        // Update setsList and examSetRequests
        if (this.selectedQueArray.length > 0) {
          this.setsList = [this.selectedQueArray];
          this.testCreateMasterModel.examSetRequests = [{
            examSetName: 'Set A',
            questionIds: this.selectedQueArray.map((q: any) => q.questionId)
          }];
          this.totalMarksShow = this.getTotalMarks();
        } else {
          this.setsList = [];
          this.testCreateMasterModel.examSetRequests = [];
          this.totalMarksShow = 0;
        }
        
        console.log(`🗑️ Removed ${questionsToRemove.length} questions from chapter ${chapterId}`);
      }
    }
    
    this.cdr.detectChanges();
  }

  /**
   * Check if a subject is selected for edit
   */
  isSubjectSelectedForEdit(subjectId: number): boolean {
    return this.selectedSubjectIdsForEdit.includes(subjectId);
  }

  /**
   * Check if a chapter is selected for edit
   */
  isChapterSelectedForEdit(chapterId: number): boolean {
    return this.selectedChapterIdsForEdit.includes(chapterId);
  }

  /**
   * Apply edit configuration changes - PRESERVE valid questions
   */
  applyEditConfigChanges(): void {
    console.log('🔄 Applying edit config changes...');
    console.log('Selected subjects:', this.selectedSubjectIdsForEdit);
    console.log('Selected chapters:', this.selectedChapterIdsForEdit);
    
    // Store current selected questions before clearing
    const currentSelectedQuestions = [...this.selectedQueArray];
    const currentQuestionIds = new Set(this.defaultQuestionList);
    
    // 1. Update selected subjects list
    this.selectedSubjectsList = this.allAvailableSubjects
      .filter(s => this.selectedSubjectIdsForEdit.includes(s.subjectId))
      .map(s => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName
      }));
    
    // 2. Update selected chapters list
    this.selectedChaptersList = this.allAvailableChapters
      .filter(c => this.selectedChapterIdsForEdit.includes(c.chapterId))
      .map(c => ({
        chapterId: c.chapterId,
        chapterName: c.chapterName,
        subjectId: c.subjectId,
        subjectName: c.subjectName
      }));
    
    // 3. Update test master model with new selections
    this.testMasterModel = {
      ...this.testMasterModel,
      subjectIds: this.selectedSubjectIdsForEdit,
      chapterIds: this.selectedChapterIdsForEdit,
      selectedSubjects: this.selectedSubjectsList,
    };
    
    // 4. Update test creation model
    this.testCreateMasterModel.selectedSubjects = this.selectedSubjectsList;
    this.testCreateMasterModel.subjectId = this.selectedSubjectIdsForEdit;
    this.testCreateMasterModel.chapterMasters = this.selectedChapterIdsForEdit;
    
    sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));
    sessionStorage.setItem('selectedSubjectIds', JSON.stringify(this.selectedSubjectIdsForEdit));
    sessionStorage.setItem('selectedChapterIds', JSON.stringify(this.selectedChapterIdsForEdit));
    
    // 5. CRITICAL: Filter existing questions - keep only those from selected chapters
    const validChapterIds = new Set(this.selectedChapterIdsForEdit);
    
    // Filter selected questions to only keep those from valid chapters
    const preservedQuestions = currentSelectedQuestions.filter((q: any) => {
      // Check if this question belongs to a valid chapter
      return this.allAvailableChapters.some(chapter => 
        chapter.chapterId === q.chapterId && 
        validChapterIds.has(chapter.chapterId)
      );
    });
    
    // Also keep questions that don't have chapterId (fallback) if they exist in the current selection
    const questionsWithoutChapterId = currentSelectedQuestions.filter((q: any) => !q.chapterId);
    
    // If there are questions without chapterId, we need to check if they belong to selected subjects
    const validSubjectIds = new Set(this.selectedSubjectIdsForEdit);
    const questionsToKeep = [...preservedQuestions];
    
    // Add questions without chapterId if their subject is still selected
    questionsWithoutChapterId.forEach((q: any) => {
      // Try to find which subject this question belongs to
      const subjectMatch = this.allAvailableSubjects.some(s => 
        s.subjectId === q.subjectId && validSubjectIds.has(s.subjectId)
      );
      if (subjectMatch || !q.subjectId) {
        questionsToKeep.push(q);
      }
    });
    
    // If no valid chapters selected, but we still have questions, only keep if subjects are selected
    let finalQuestions = questionsToKeep;
    if (this.selectedChapterIdsForEdit.length === 0 && this.selectedSubjectIdsForEdit.length > 0) {
      // If no chapters selected but subjects are selected, keep all questions (they belong to subjects)
      finalQuestions = currentSelectedQuestions.filter((q: any) => {
        return this.selectedSubjectsList.some(s => s.subjectId === q.subjectId);
      });
    }
    
    // Remove duplicates from preserved questions
    finalQuestions = this.removeDuplicateQuestions(finalQuestions);
    
    console.log('📊 Preserved questions count:', finalQuestions.length);
    console.log('📊 Removed questions count:', currentSelectedQuestions.length - finalQuestions.length);
    
    // 6. Update selected questions with preserved ones
    this.selectedQueArray = finalQuestions;
    this.defaultQuestionList = finalQuestions.map((q: any) => q.questionId);
    
    // 7. Rebuild setsList and examSetRequests from preserved questions
    if (finalQuestions.length > 0) {
      this.setsList = [finalQuestions];
      this.testCreateMasterModel.examSetRequests = [{
        examSetName: 'Set A',
        questionIds: finalQuestions.map((q: any) => q.questionId)
      }];
      this.totalMarksShow = this.getTotalMarks();
      sessionStorage.setItem('testSelectedQuestions', JSON.stringify(finalQuestions));
      sessionStorage.setItem('setsArr', JSON.stringify([finalQuestions]));
    } else {
      this.setsList = [];
      this.testCreateMasterModel.examSetRequests = [];
      this.totalMarksShow = 0;
      sessionStorage.removeItem('testSelectedQuestions');
      sessionStorage.removeItem('setsArr');
    }
    
    // 8. Force UI update
    this.cdr.detectChanges();
    
    // 9. Fetch new questions for the available pool
    this.getQuestions();
    
    const msg = finalQuestions.length > 0 
      ? `Configuration applied. ${finalQuestions.length} questions preserved. New questions available below.`
      : 'Configuration applied. Select questions from the new set.';
    alert(msg);
  }

  getSubjectList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.getRequest(`api/subject/getallactive`).subscribe({
        next: (res: any) => {
          this.subjectList = res;
          resolve(res);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  getSubjectNameById(subjectId: number): string {
    if (this.subjectList && Array.isArray(this.subjectList)) {
      const subject = this.subjectList.find(
        (s: any) => s.subjectId === subjectId
      );
      return subject ? subject.subjectName : '';
    }
    return '';
  }

  /**
   * Add a single question to the selected list - WITH DUPLICATE CHECK
   */
  addToQuestionList() {
    if (this.setsList.length > 1) {
      alert('Questions can only be added when the sets count is equal to 1');
      return;
    }

    const questionId = this.questionObj.questionId;
    if (this.isEditMode) {
      const isValidQuestion = this.buttons.some((b: any) => b.questionId === questionId);
      if (!isValidQuestion) {
        alert('This question is not available in the current selection. Please apply changes first.');
        return;
      }
    }

    // DUPLICATE CHECK
    let find = this.defaultQuestionList.find(
      (obj: any) => obj === this.questionObj.questionId
    );

    if (find) {
      alert('⚠️ This question is already added. Duplicate questions are not allowed.');
      return;
    } else {
      // Add question to selectedQueArray
      this.selectedQueArray = [...this.selectedQueArray, this.questionObj];
      this.defaultQuestionList = [
        ...this.defaultQuestionList,
        this.questionObj.questionId,
      ];

      if (this.setsList.length === 0) {
        this.setsList = [[this.questionObj]];
      } else if (this.setsList.length === 1) {
        this.setsList[0].push(this.questionObj);
      }

      if (this.testCreateMasterModel.examSetRequests.length === 0) {
        const questionIds = [this.questionObj.questionId];
        let obj = {
          examSetName: 'Set A',
          questionIds: questionIds,
        };
        this.testCreateMasterModel.examSetRequests.push(obj);
      } else if (this.testCreateMasterModel.examSetRequests.length === 1) {
        this.testCreateMasterModel.examSetRequests[0].questionIds.push(
          this.questionObj.questionId
        );
      }

      if (!(this.tempQuestionReqArr.length > 0)) {
        let obj = {
          questionsId: this.defaultQuestionList,
        };
        this.tempQuestionReqArr = [...this.tempQuestionReqArr, obj];
      }
    }
    this.totalMarksShow = this.getTotalMarks();
    this.cdr.detectChanges();
  }

  /**
   * Add all questions - WITH DUPLICATE PREVENTION
   */
  addAllQuestions(): void {
    if (this.setsList.length > 1) {
      alert('Questions can only be added when the sets count is equal to 1');
      return;
    }

    let questionsToAdd = this.buttons;
    if (this.isEditMode) {
      questionsToAdd = this.buttons.filter((item: any) => 
        !this.defaultQuestionList.includes(item.questionId)
      );
    }

    // Use the helper method to add with duplicate check
    const addedCount = this.addQuestionsWithDuplicateCheck(questionsToAdd);

    if (addedCount === 0) {
      alert('No new questions to add. All questions are already selected.');
      return;
    }

    // Update setsList and examSetRequests
    if (this.setsList.length === 0 && this.selectedQueArray.length > 0) {
      this.setsList = [this.selectedQueArray];
    } else if (this.setsList.length === 1 && this.selectedQueArray.length > 0) {
      this.setsList[0] = this.selectedQueArray;
    }

    if (this.testCreateMasterModel.examSetRequests.length === 0 && this.selectedQueArray.length > 0) {
      const questionIds = (this.selectedQueArray as { questionId: number }[]).map(
        (item) => item.questionId
      );

      let obj = {
        examSetName: 'Set A',
        questionIds: questionIds,
      };

      this.testCreateMasterModel.examSetRequests.push(obj);
    } else if (this.testCreateMasterModel.examSetRequests.length === 1 && this.selectedQueArray.length > 0) {
      const questionIds = (this.selectedQueArray as { questionId: number }[]).map(
        (item) => item.questionId
      );
      this.testCreateMasterModel.examSetRequests[0].questionIds = questionIds;
    }

    this.totalMarksShow = this.getTotalMarks();
    this.cdr.detectChanges();
  }

  /**
   * Add random questions - WITH DUPLICATE PREVENTION
   */
  addRandomQuestions(): void {
    if (this.setsList.length > 1) {
      alert('Questions can only be added when the sets count is equal to 1');
      return;
    }

    this.firstBoxError = null;
    this.secondBoxError = null;

    if (this.firstBoxValue === null || isNaN(this.firstBoxValue)) {
      this.firstBoxError = 'Please enter a valid number';
    }

    if (this.secondBoxValue === null || isNaN(this.secondBoxValue)) {
      this.secondBoxError = 'Please enter a valid number';
    }

    if (this.firstBoxError || this.secondBoxError) {
      return;
    }

    const start = Math.min(this.firstBoxValue!, this.secondBoxValue!) - 1;
    const end = Math.max(this.firstBoxValue!, this.secondBoxValue!);

    if (start < 0 || end > this.buttons.length) {
      alert('Please enter valid question numbers within range');
      return;
    }

    const buttonsToProcess = this.buttons.slice(start, end);

    let validButtons = buttonsToProcess;
    if (this.isEditMode) {
      validButtons = buttonsToProcess.filter((item: any) => 
        !this.defaultQuestionList.includes(item.questionId)
      );
    }

    // Use the helper method to add with duplicate check
    const addedCount = this.addQuestionsWithDuplicateCheck(validButtons);

    if (addedCount === 0) {
      alert('No new questions to add. All questions are already selected.');
      return;
    }

    // Update setsList and examSetRequests
    if (this.setsList.length === 0 && this.selectedQueArray.length > 0) {
      this.setsList = [this.selectedQueArray];
    } else if (this.setsList.length === 1 && this.selectedQueArray.length > 0) {
      this.setsList[0] = this.selectedQueArray;
    }

    if (this.testCreateMasterModel.examSetRequests.length === 0 && this.selectedQueArray.length > 0) {
      const questionIds = (this.selectedQueArray as { questionId: number }[]).map(
        (item) => item.questionId
      );

      let obj = {
        examSetName: 'Set A',
        questionIds: questionIds,
      };

      this.testCreateMasterModel.examSetRequests.push(obj);
    } else if (this.testCreateMasterModel.examSetRequests.length === 1 && this.selectedQueArray.length > 0) {
      const questionIds = (this.selectedQueArray as { questionId: number }[]).map(
        (item) => item.questionId
      );
      this.testCreateMasterModel.examSetRequests[0].questionIds = questionIds;
    }

    this.totalMarksShow = this.getTotalMarks();
    this.firstBoxValue = null;
    this.secondBoxValue = null;
    this.cdr.detectChanges();
  }

  removeAll() {
    if (confirm('Are you sure you want to remove all questions?')) {
      this.testCreateMasterModel.examSetRequests = [];
      this.defaultQuestionList = [];
      this.selectedQueArray = [];
      this.setsList = [];
      this.totalMarksShow = this.getTotalMarks();
      this.cdr.detectChanges();
    }
  }

  removeQuestion(item: any): void {
    const confirmation = confirm(
      `Are you sure you want to delete Question ${item}?`
    );
    if (confirmation) {
      this.defaultQuestionList = this.defaultQuestionList.filter(
        (q: any) => q !== item
      );
      this.selectedQueArray = this.selectedQueArray.filter(
        (q: any) => q.questionId !== item
      );

      if (this.testCreateMasterModel.examSetRequests.length > 0) {
        this.testCreateMasterModel.examSetRequests[0].questionIds =
          this.testCreateMasterModel.examSetRequests[0].questionIds.filter(
            (id: number) => id !== item
          );
      }

      if (this.setsList.length > 0) {
        this.setsList[0] = this.setsList[0].filter(
          (q: any) => q.questionId !== item
        );
      }
    }
    this.totalMarksShow = this.getTotalMarks();
    this.cdr.detectChanges();
  }

  dragquestion(question: any, i: number) {
    this.questionObj = {
      ...this.questionObj,
      index: i,
      question: question.question,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      multiAnswers: question.multiAnswers,
      explanation: question.explanation,
      questionId: question.questionId,
      marks: question.marks,
    };
  }

  nextQuestion() {
    if (this.questionObj.index + 1 < this.buttons.length) {
      const question = this.buttons[this.questionObj.index + 1];
      this.dragquestion(question, this.questionObj.index + 1);
    }
  }

  lastQuestion() {
    if (this.buttons.length > 0) {
      const question = this.buttons[this.buttons.length - 1];
      this.dragquestion(question, this.buttons.length - 1);
    }
  }

  firstQuestion() {
    if (this.buttons.length > 0) {
      const question = this.buttons[0];
      this.dragquestion(question, 0);
    }
  }

  prevQuestion() {
    if (this.questionObj.index > 0) {
      const question = this.buttons[this.questionObj.index - 1];
      this.dragquestion(question, this.questionObj.index - 1);
    }
  }

  getQuestions() {
    const endpoint = this.type === 'weightage-wise'
      ? `api/test/generateTest/weightageWiseTest`
      : `api/test/generateTest`;

    const subjectIds = this.isEditMode 
      ? this.selectedSubjectIdsForEdit 
      : this.testMasterModel.subjectIds;
      
    const chapterIds = this.isEditMode
      ? this.selectedChapterIdsForEdit
      : this.testMasterModel.chapterIds;

    if (!subjectIds || subjectIds.length === 0) {
      console.warn('No subjectIds available for fetching questions');
      this.buttons = [];
      this.categorizeQuestionsList = [];
      if (this.isEditMode) {
        this.selectedQueArray = [];
        this.defaultQuestionList = [];
        this.setsList = [];
        this.testCreateMasterModel.examSetRequests = [];
        this.totalMarksShow = 0;
      }
      this.cdr.detectChanges();
      return;
    }

    this.testMasterModel.subjectIds = subjectIds;
    this.testMasterModel.chapterIds = chapterIds;
    this.testMasterModel.selectedSubjects = this.selectedSubjectsList;

    console.log('🔄 Fetching questions with:', {
      subjectIds: this.testMasterModel.subjectIds,
      chapterIds: this.testMasterModel.chapterIds,
      selectedSubjects: this.testMasterModel.selectedSubjects
    });

    this.http.postRequest(endpoint, this.testMasterModel).subscribe(
      (response: any) => {
        if (response && response.data) {
          const allAvailableQuestions = response.data;
          
          let filteredQuestions = allAvailableQuestions;
          if (this.isEditMode && this.selectedChapterIdsForEdit.length > 0) {
            filteredQuestions = allAvailableQuestions;
          }
          
          this.buttons = filteredQuestions;
          this.testMasterModel.currentPage = response.currentPage;

          this.paginationData = {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalElements: response.totalElements,
            pageSize: response.pageSize,
          };

          this.categorizeQuestionsList = this.categorizeQuestions(filteredQuestions);

          if (response.selectedSubjects && response.selectedSubjects.length > 0) {
            this.selectedSubjectsList = response.selectedSubjects;
            sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));
          }
          
          console.log('✅ Available questions loaded:', this.buttons.length);
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Error fetching questions:', error);
        if (!this.isEditMode) {
          alert('Failed to fetch questions. Please try again.');
        }
      }
    );
  }

  categorizeQuestions(questions: any) {
    const categorized: any = {};
    questions.forEach((question: any) => {
      const type = question.questionType || 'General';
      if (!categorized[type]) {
        categorized[type] = {
          questionType: type,
          array: [],
        };
      }
      categorized[type].array.push(question);
    });
    return Object.values(categorized);
  }

  getTotalMarks(): number {
    return this.selectedQueArray.reduce(
      (sum: any, item: any) => sum + (item.marks || 0),
      0
    );
  }

  GotoSubmit() {
    console.log('🚀 GotoSubmit - FINAL CHECK:');
    console.log('  - selectedQueArray length:', this.selectedQueArray.length);
    console.log('  - setsList length:', this.setsList.length);
    console.log('  - examSetRequests:', this.testCreateMasterModel.examSetRequests);
    console.log('  - marks:', this.marks);
    console.log('  - isEditMode:', this.isEditMode);
    console.log('  - editTestId:', this.editTestId);

    if (this.selectedQueArray.length < 4) {
      alert('Please select at least 5 questions');
      return;
    }

    let calculatedMarks = this.getTotalMarks();

    if (!this.marks || this.marks < 10) {
      alert('Please enter a valid total marks (minimum 10).');
      return;
    }

    if (calculatedMarks > this.marks) {
      alert('Entered Total marks does not match selected total marks');
      return;
    } else if (calculatedMarks < this.marks) {
      alert('Please add some questions or decrease the total marks');
      return;
    }

    sessionStorage.setItem(
      'testSelectedQuestions',
      JSON.stringify(this.selectedQueArray)
    );
    sessionStorage.setItem('setsArr', JSON.stringify(this.setsList));
    sessionStorage.setItem('marks', JSON.stringify(this.marks));
    sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));

    this.testCreateMasterModel.marks = this.marks;
    this.testCreateMasterModel.selectedSubjects = this.selectedSubjectsList;

    const boardName = this.route.snapshot.paramMap.get('name');
    
    if (this.isEditMode && this.editTestId) {
      this.router.navigate([`/teacher/${boardName}/submit-test`], {
        queryParams: {
          type: `${boardName}`,
          testObject: JSON.stringify(this.testCreateMasterModel),
          setsArr: JSON.stringify(this.setsList),
          createdBy: this.teacherId,
          mode: 'edit',
          testId: this.editTestId
        },
      });
    } else {
      this.router.navigate([`/teacher/${boardName}/submit-test`], {
        queryParams: {
          type: `${boardName}`,
          testObject: JSON.stringify(this.testCreateMasterModel),
          setsArr: JSON.stringify(this.setsList),
          createdBy: this.teacherId,
        },
      });
    }
  }

  getQuestionLevels() {
    this.http.getRequest(`api/questionlevel/getallactive`).subscribe(
      (res) => {
        this.QuestionLevelsList = res;
      },
      (error) => {
        console.error('Error fetching question levels:', error);
      }
    );
  }

  setQuestionList(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.testMasterModel.questionLevel = selectedValue;
    this.testMasterModel.currentPage = 1;
    this.getQuestions();
  }

  onCategoryChange(event: Event): void {
    const selectedCategory = (event.target as HTMLSelectElement).value;
    this.testMasterModel.questionCategory = selectedCategory;
    this.testMasterModel.currentPage = 1;
    this.getQuestions();
  }

  onPyqChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.testMasterModel.pyq = selectedValue === 'asked';
    this.testMasterModel.currentPage = 1;
    this.getQuestions();
  }

  onUsedChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.testMasterModel.usedStatus = selectedValue;
    this.testMasterModel.currentPage = 1;
    this.getQuestions();
  }

  getShuffuleNewList() {
    if (this.defaultQuestionList.length < 5) {
      alert('Please add minimum of 5 questions to the list');
      return;
    }

    if (this.testCreateMasterModel.examSetRequests.length <= 0) {
      alert('Please add questions to the list');
      return;
    }

    if (this.testCreateMasterModel.examSetRequests.length >= 8) {
      alert('Maximum of 8 Sets can be created');
      return;
    }

    this.http
      .postRequest(`api/question/shuffleQuestions`, {
        questionsId: this.defaultQuestionList,
      })
      .subscribe(
        (res: any) => {
          this.setsList = [...this.setsList, res];

          const questionIds = (res as { questionsId: number }[]).map(
            (item) => item.questionsId
          );

          const setNames = [
            'Set A',
            'Set B',
            'Set C',
            'Set D',
            'Set E',
            'Set F',
            'Set G',
            'Set H',
          ];

          let currentLength = this.testCreateMasterModel.examSetRequests.length;
          let examSetName =
            setNames[currentLength] ||
            `Set ${String.fromCharCode(65 + currentLength)}`;

          let obj = {
            examSetName: examSetName,
            questionIds: questionIds,
          };

          this.testCreateMasterModel.examSetRequests.push(obj);

          alert(`Successfully created ${examSetName}`);
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error shuffling questions:', error);
          alert('Failed to shuffle questions. Please try again.');
        }
      );
  }

  isQuestionSelected(questionId: number): boolean {
    return this.defaultQuestionList?.some(
      (question: any) => question === questionId
    );
  }

  prevPage() {
    if (this.testMasterModel.currentPage > 1) {
      this.testMasterModel.currentPage--;
      this.getQuestions();
    }
  }

  nextPage() {
    if (this.testMasterModel.currentPage < this.paginationData?.totalPages) {
      this.testMasterModel.currentPage++;
      this.getQuestions();
    }
  }
}
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import * as html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import { Location } from '@angular/common';
import { pdfOne } from 'src/app/shared/AllModel';
import { pdfTwo } from 'src/app/shared/AllModel';
import { answerKey1 } from 'src/app/shared/AllModel';
import { answerKey2 } from 'src/app/shared/AllModel';
import { update_test } from 'src/app/shared/allURL';

interface SelectedSubject {
  subjectId: number;
  subjectName: string;
}

@Component({
  selector: 'app-page-4',
  templateUrl: './page-4.component.html',
  styleUrls: ['./page-4.component.scss'],
})
export class Page4Component {
  dataSource: any = [];
  displayedColumns: string[] = [
    'Sets',
    'Test Pdf',
    'Omr',
    'TeacherKey',
    'AnswerKey',
  ];

  selectedRow: any = null;

  // Selected Subjects from previous component
  selectedSubjectsList: SelectedSubject[] = [];

  pdfOneModel: pdfOne = {
    institute: '',
    examName: '',
    date: '',
    duration: '',
    totalMarks: 0,
    twoColumn: false,
    watermark: '',
    angle: 0,
    opacity: 0.15,
    questions: [],
    teacherKey: false,
    examSetName: '',
    isPdf: true,
  };

  pdfTwoModel: pdfTwo = {
    instituteName: '',
    organization: '',
    examName: '',
    standard: '',
    totalQuestions: 0,
    totalMarks: 0,
    twoColumn: false,
    teacherKey: false,
    date: '',
    time: '',
    questions: [],
    examSetName: '',
    isPdf: true,
  };

  answerKey1Model: answerKey1 = {
    creatorId: null,
    institute: '',
    address: '',
    contactDetails: '',
    examName: '',
    date: '',
    duration: '',
    totalMarks: 0,
    examSetName: '',
    isPdf: true,
  };

  answerKey2Model: answerKey2 = {
    creatorId: null,
    instituteName: '',
    organization: '',
    examName: '',
    standard: '',
    totalQuestions: 0,
    totalMarks: 0,
    date: '',
    time: '',
    examSetName: '',
    isPdf: true,
  };

  selectedColumnType: 'single' | 'double' = 'single';
  selectedColumnTypePdf2: 'single' | 'double' = 'single';
  selectedDocumentType: string = 'pdf';

  testForm: FormGroup;
  testObject: any = {};
  testSelectedQuestions: any = [];
  isLoading = false;
  setsList: any = [];
  minDate: string = '';
  teacherId: any;
  institute: string = '';
  downloadedSets: number[] = [];
  setIndexCurrent: any;
  columnType: any = 'Single Column';

  // Edit mode properties
  isEditMode: boolean = false;
  editTestId: number | null = null;

  // Preview settings
  showSubjectName: boolean = true;
  subjectName: string = 'Physics';
  showDepartmentName: boolean = true;
  departmentName: string = 'JEE CELL';
  showTotalQuestions: boolean = true;
  totalQuestions: number = 50;
  showDivision: boolean = true;
  division: string = 'XII - A Div';
  showpapername: boolean = true;
  paper: string = 'JEE Physics';
  showTotalMarks: boolean = true;
  totalMarks: number = 50;
  showDate: boolean = true;
  date: string = new Date().toISOString().split('T')[0];
  showTime: boolean = true;
  startTime: string = '10:00';
  endTime: string = '12:00';
  showPaperName: boolean = true;
  paperName: string = 'JEE Physics';

  // Store parsed query params
  private parsedTestObject: any = null;
  private parsedSetsArr: any = null;

  constructor(
    public http: HttpmethodsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private location: Location
  ) {
    this.testForm = this.fb.group({
      testName: ['', Validators.required],
      testDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      testMode: ['', Validators.required],
      marks: [0, [Validators.required, Validators.min(0)]],
      testModeCheckbox: [false]
    });
  }

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Retrieve selected subjects from sessionStorage or route params
    this.loadSelectedSubjects();

    this.route.queryParams.subscribe((queryParams) => {
      console.log('🔍 Page4 Query Params:', queryParams);
      
      // Check if this is edit mode
      if (queryParams['mode'] === 'edit' && queryParams['testId']) {
        this.isEditMode = true;
        this.editTestId = Number(queryParams['testId']);
        
        // Parse testObject from query params
        if (queryParams['testObject']) {
          try {
            this.parsedTestObject = JSON.parse(queryParams['testObject']);
            console.log('📦 Parsed testObject from query (edit mode):', this.parsedTestObject);
          } catch (e) {
            console.error('Error parsing testObject:', e);
          }
        }
        
        // Parse setsArr from query params
        if (queryParams['setsArr']) {
          try {
            this.parsedSetsArr = JSON.parse(queryParams['setsArr']);
            console.log('📦 Parsed setsArr from query (edit mode):', this.parsedSetsArr);
          } catch (e) {
            console.error('Error parsing setsArr:', e);
          }
        }
        
        // FIRST: Use parsed data from query params (UPDATED QUESTIONS & MARKS)
        this.useParsedData();
        
        // SECOND: Load metadata from API (DO NOT overwrite user updated values)
        this.loadTestMetadataForEdit(this.editTestId);
        
      } else if (queryParams['testObject']) {
        // Normal creation flow - read from query params
        try {
          this.parsedTestObject = JSON.parse(queryParams['testObject']);
          console.log('📦 Parsed testObject from query (creation):', this.parsedTestObject);
        } catch (e) {
          console.error('Error parsing testObject:', e);
        }
        
        if (queryParams['setsArr']) {
          try {
            this.parsedSetsArr = JSON.parse(queryParams['setsArr']);
            console.log('📦 Parsed setsArr from query (creation):', this.parsedSetsArr);
          } catch (e) {
            console.error('Error parsing setsArr:', e);
          }
        }
        
        // Use the parsed data
        this.useParsedData();
      } else {
        // Initialize with default values
        this.testObject = {
          testName: '',
          marks: 0,
          testDate: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '12:00',
          testMode: '',
          selectedSubjects: this.selectedSubjectsList
        };
        this.testSelectedQuestions = [];
        this.dataSource = [];
        this.setsList = [];
        this.setFormValues();
      }

      this.teacherId = queryParams['createdBy'];
      console.log('Selected Subjects:', this.selectedSubjectsList);
    });
  }

  /**
   * Use the parsed data from query params - THIS IS THE SOURCE OF TRUTH
   */
  useParsedData(): void {
    if (this.parsedTestObject) {
      this.testObject = { ...this.parsedTestObject };
      
      // Update selected subjects
      if (this.testObject.selectedSubjects && this.testObject.selectedSubjects.length > 0) {
        this.selectedSubjectsList = this.testObject.selectedSubjects;
        sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));
      }
      
      // Set form values
      this.setFormValues();
    }
    
    // Use parsed setsArr for questions - THIS IS THE SOURCE OF TRUTH FOR QUESTIONS
    if (this.parsedSetsArr && this.parsedSetsArr.length > 0) {
      const allQuestions: any[] = [];
      
      console.log('🔍 setsArr structure:', this.parsedSetsArr);
      
      // Handle the nested array structure
      this.parsedSetsArr.forEach((set: any) => {
        if (Array.isArray(set)) {
          set.forEach((item: any) => {
            if (Array.isArray(item)) {
              // If item is an array, spread it
              allQuestions.push(...item);
            } else if (item && typeof item === 'object' && item.questionId) {
              // If item is a question object
              allQuestions.push(item);
            }
          });
        }
      });
      
      // Remove duplicates by questionId
      const seenIds = new Set();
      const uniqueQuestions = allQuestions.filter((q) => {
        if (!q.questionId) return false;
        if (seenIds.has(q.questionId)) return false;
        seenIds.add(q.questionId);
        return true;
      });
      
      // Store questions from query params (UPDATED QUESTIONS)
      this.testSelectedQuestions = uniqueQuestions;
      this.dataSource = this.parsedSetsArr;
      this.setsList = this.parsedSetsArr;
      
      console.log('✅ Loaded questions from query params:', this.testSelectedQuestions.length);
      console.log('✅ Loaded sets from query params:', this.dataSource.length);
    } else {
      // Fallback to sessionStorage only if query params don't have data
      console.log('⚠️ No setsArr in query params, using sessionStorage fallback');
      this.testSelectedQuestions = JSON.parse(
        sessionStorage.getItem('testSelectedQuestions') || '[]'
      );
      this.dataSource = JSON.parse(sessionStorage.getItem('setsArr') || '[]');
      this.setsList = this.dataSource;
    }
    
    // Update marks from parsed data
    if (this.testObject.marks) {
      this.testForm.patchValue({ marks: this.testObject.marks });
    }
    
    this.cdr.detectChanges();
  }

  /**
   * Load ONLY test metadata for edit (DO NOT overwrite user updated values)
   * Preserves: marks, testName, selectedSubjects, questions
   */
  loadTestMetadataForEdit(testId: number): void {
    this.isLoading = true;
    this.http.getRequest(`api/test/getbyid/${testId}`).subscribe({
      next: (response: any) => {
        console.log('📝 Test metadata loaded (preserving user updates):', response);
        this.isLoading = false;
        
        // CRITICAL: ONLY update fields that the user CANNOT change in test-creation
        // DO NOT overwrite marks, testName, selectedSubjects, or questions
        
        // Update ONLY these fields from API (user cannot change these in test-creation)
        // These are read-only metadata fields
        if (!this.testObject.testDate) {
          this.testObject.testDate = response.testDate;
        }
        if (!this.testObject.startTime) {
          this.testObject.startTime = response.startTime;
        }
        if (!this.testObject.endTime) {
          this.testObject.endTime = response.endTime;
        }
        if (!this.testObject.testMode) {
          this.testObject.testMode = response.testMode;
        }
        if (!this.testObject.typeOfTest) {
          this.testObject.typeOfTest = response.typeOfTest;
        }
        
        // DO NOT overwrite: marks, testName, selectedSubjects, questions
        // These come from the user's updates in test-creation and are already in this.testObject
        
        console.log('✅ Preserved user updated values:');
        console.log('  - marks:', this.testObject.marks);
        console.log('  - testName:', this.testObject.testName);
        console.log('  - questions count:', this.testSelectedQuestions.length);
        
        // Update selected subjects only if we don't have them from parsed data
        if (response.selectedSubjects && response.selectedSubjects.length > 0 && this.selectedSubjectsList.length === 0) {
          this.selectedSubjectsList = response.selectedSubjects;
          sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));
        }

        // Set form values (preserves user updated marks and testName)
        this.setFormValues();

        // Update UI
        this.cdr.detectChanges();
        
        console.log('✅ Questions preserved from parsed data:', this.testSelectedQuestions.length);
        console.log('✅ Loaded metadata for test:', testId);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading test metadata:', error);
        // Don't show error, we already have data from parsed params
      }
    });
  }

  // Method to load selected subjects from sessionStorage
  loadSelectedSubjects(): void {
    const storedSubjects = sessionStorage.getItem('selectedSubjects');
    if (storedSubjects) {
      try {
        this.selectedSubjectsList = JSON.parse(storedSubjects);
        console.log('Loaded selected subjects from sessionStorage:', this.selectedSubjectsList);
      } catch (e) {
        console.error('Error parsing selected subjects:', e);
        this.selectedSubjectsList = [];
      }
    } else {
      // Try to get from testMasterModel in sessionStorage
      const testMasterModel = sessionStorage.getItem('testMasterModel');
      if (testMasterModel) {
        try {
          const parsed = JSON.parse(testMasterModel);
          if (parsed.selectedSubjects && parsed.selectedSubjects.length > 0) {
            this.selectedSubjectsList = parsed.selectedSubjects;
            sessionStorage.setItem('selectedSubjects', JSON.stringify(this.selectedSubjectsList));
          }
        } catch (e) {
          console.error('Error parsing testMasterModel:', e);
        }
      }
    }
  }

  // Get subjects as comma-separated string for display
  getSubjectsString(): string {
    return this.selectedSubjectsList.map(s => s.subjectName).join(', ');
  }

  // Get subjects for API payload
  getSelectedSubjectsForAPI(): any[] {
    return this.selectedSubjectsList.map(subject => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName
    }));
  }

  setFormValues(): void {
    if (this.testObject) {
      // Convert date from DD/MM/YYYY to YYYY-MM-DD for date input
      let formattedDate = this.testObject.testDate;
      if (formattedDate && formattedDate.includes('/')) {
        const [day, month, year] = formattedDate.split('/');
        formattedDate = `${year}-${month}-${day}`;
      }

      this.testForm.patchValue({
        testName: this.testObject.testName || '',
        testDate: formattedDate || '',
        startTime: this.testObject.startTime || '10:00',
        endTime: this.testObject.endTime || '12:00',
        marks: this.testObject.marks || 0,
        testMode: this.testObject.testMode || ''
      });
    }
  }

  get f() {
    return this.testForm.controls;
  }

  // Update methods that sync form with testObject
  updateMarks(event: any): void {
    const value = event.target.value;
    this.testObject.marks = value;
    this.testForm.patchValue({ marks: value });
    this.cdr.detectChanges();
  }

  updateTestName(event: any): void {
    const value = event.target.value;
    this.testObject.testName = value;
    this.testForm.patchValue({ testName: value });
    this.cdr.detectChanges();
  }

  updateStartTime(event: any): void {
    const value = event.target.value;
    this.testObject.startTime = value;
    this.testForm.patchValue({ startTime: value });
    this.cdr.detectChanges();
  }

  updateEndTime(event: any): void {
    const value = event.target.value;
    this.testObject.endTime = value;
    this.testForm.patchValue({ endTime: value });
    this.cdr.detectChanges();
  }

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value; // YYYY-MM-DD

    if (value) {
      const [year, month, day] = value.split('-');
      this.testObject.testDate = `${day}/${month}/${year}`;
      this.testForm.patchValue({ testDate: value });
      this.cdr.detectChanges();
    }
  }

  onCategoryChange(event: Event): void {
    const selectedCategory = (event.target as HTMLSelectElement).value;
    this.testObject.testMode = selectedCategory;
    this.testForm.patchValue({ testMode: selectedCategory });
    this.cdr.detectChanges();
  }

  selectRow(element: any): void {
    this.selectedRow = element;
  }

  onInstituteChange() {
    this.downloadedSets = [];
    console.log(this.institute);
    this.cdr.detectChanges();
  }

  onColumnTypeChange() {
    this.pdfOneModel.twoColumn = this.selectedColumnType === 'double';
    this.columnType = this.selectedColumnType === 'single' ? 'Single Column' : 'Double Column';
    console.log(this.pdfOneModel);
    this.cdr.detectChanges();
  }

  onColumnTypeChangePdf2() {
    this.pdfTwoModel.twoColumn = this.selectedColumnTypePdf2 === 'double';
    this.columnType = this.selectedColumnTypePdf2 === 'single' ? 'Single Column' : 'Double Column';
    console.log(this.pdfTwoModel);
    this.cdr.detectChanges();
  }

  onWatermarkChange() {
    console.log('Watermark changed to:', this.pdfOneModel.watermark);
    this.cdr.detectChanges();
  }

  onAngleChange() {
    console.log('Rotation angle changed to:', this.pdfOneModel.angle);
    this.cdr.detectChanges();
  }

  onDocumentTypeChange() {
    const isPdf = this.selectedDocumentType === 'pdf';
    this.pdfOneModel.isPdf = isPdf;
    this.pdfTwoModel.isPdf = isPdf;
    this.answerKey1Model.isPdf = isPdf;
    this.answerKey2Model.isPdf = isPdf;
    this.cdr.detectChanges();
  }

  onView(element: any): void {
    this.dialog.open(PopupFormComponent, {
      width: '700px',
      data: { pdfUrl: element.pdfUrl },
    });
  }

  getAlphabet(index: number): string {
    return String.fromCharCode(65 + index);
  }

  goBack(): void {
    this.location.back();
  }

  downloadAnswerKey(set: any, index: number) {
    this.isLoading = true;
    this.setIndexCurrent = index;

    this.answerKey1Model.creatorId = this.teacherId;
    this.answerKey1Model.institute = this.institute;
    this.answerKey1Model.examName = this.testObject.testName + ' ' + set;
    this.answerKey1Model.date = this.testObject.testDate;
    this.answerKey1Model.totalMarks = this.testObject.marks;
    this.answerKey1Model.examSetName = set;

    const startTime = this.testObject.startTime;
    const endTime = this.testObject.endTime;

    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${endTime}`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    const diffMs: number = endMs - startMs;
    const durationMinutes = Math.round(diffMs / (1000 * 60));
    this.answerKey1Model.duration = String(durationMinutes) + ' Minutes';

    this.http
      .postBlobRequest('api/pdf/answerKey', this.answerKey1Model)
      .subscribe(
        (blob: Blob) => {
          this.isLoading = false;

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;

          const fileExtension = this.pdfOneModel.isPdf ? 'pdf' : 'docx';
          a.download = `Exam_${this.pdfOneModel.examSetName || 'document'
            }_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;

          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error generating PDF:', error);
          alert('Failed to generate PDF');
        }
      );
  }

  downloadAnswerKey2(set: any, index: number) {
    this.isLoading = true;
    this.setIndexCurrent = index;

    this.answerKey2Model.creatorId = this.teacherId;
    this.answerKey2Model.instituteName = this.institute;
    this.answerKey2Model.organization = this.route.snapshot.paramMap.get('name') || '';
    this.answerKey2Model.examName = this.testObject.testName + ' ' + set;
    this.answerKey2Model.standard = set;
    this.answerKey2Model.totalQuestions = this.testSelectedQuestions.length;
    this.answerKey2Model.date = this.testObject.testDate;
    this.answerKey2Model.totalMarks = this.testObject.marks;
    this.answerKey2Model.examSetName = set;

    const startTime = this.testObject.startTime;
    const endTime = this.testObject.endTime;
    this.answerKey2Model.time = startTime + ' to ' + endTime;

    this.http
      .postBlobRequest('api/pdf/answerKeyCh', this.answerKey2Model)
      .subscribe(
        (blob: Blob) => {
          this.isLoading = false;

          const downloadUrl = window.URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;

          const fileExtension = this.answerKey2Model.isPdf ? 'pdf' : 'docx';
          const fileName = `AnswerKey_${this.answerKey2Model.examSetName ||
            this.answerKey2Model.examName ||
            'document'
            }_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
          downloadLink.download = fileName;

          document.body.appendChild(downloadLink);
          downloadLink.click();

          setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(downloadLink);
          }, 100);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error generating answer key:', error);
          alert(
            `Failed to generate ${this.answerKey2Model.isPdf ? 'PDF' : 'Word'
            } answer key`
          );
        }
      );
  }

  /**
   * UPDATED: Download PDF for Format 1, 2, 3 with fixed duration calculation
   */
  DownloadPdf1(element: any, i: any, set: any, type: any) {
    // Use the updated testObject values
    const examName = this.testObject.testName + ' ' + set;
    const examDate = this.testObject.testDate;
    const totalMarks = this.testObject.marks;
    const instituteName = this.institute || 'Format 1';

    // FIXED: Calculate duration from start and end time
    const startTime = this.testObject.startTime;
    const endTime = this.testObject.endTime;
    let durationMinutes = 180; // Default fallback
    
    if (startTime && endTime) {
        try {
            // Parse time strings (e.g., "14:00" or "02:00")
            const startParts = startTime.split(':');
            const endParts = endTime.split(':');
            
            if (startParts.length >= 2 && endParts.length >= 2) {
                let startHour = parseInt(startParts[0]);
                let startMinute = parseInt(startParts[1]);
                let endHour = parseInt(endParts[0]);
                let endMinute = parseInt(endParts[1]);
                
                // Calculate difference
                let totalStartMinutes = startHour * 60 + startMinute;
                let totalEndMinutes = endHour * 60 + endMinute;
                
                // If end time is less than start time, add 24 hours
                if (totalEndMinutes <= totalStartMinutes) {
                    totalEndMinutes += 24 * 60;
                }
                
                durationMinutes = totalEndMinutes - totalStartMinutes;
                console.log('⏰ Duration calculated:', durationMinutes, 'minutes');
            }
        } catch (e) {
            console.error('Error calculating duration:', e);
            durationMinutes = 180;
        }
    }

    // If duration is 0 or negative, use default
    if (durationMinutes <= 0) {
        durationMinutes = 180;
    }

    // Log what's being sent
    console.log('📄 PDF Data (Format 1/2/3):', {
        examName: examName,
        date: examDate,
        totalMarks: totalMarks,
        duration: durationMinutes + ' Minutes',
        institute: instituteName,
        teacherKey: type,
        questionsCount: element?.length || 0,
        startTime: startTime,
        endTime: endTime
    });

    // Set the model
    this.pdfOneModel.examName = examName;
    this.pdfOneModel.date = examDate;
    this.pdfOneModel.totalMarks = totalMarks;
    this.pdfOneModel.institute = instituteName;
    this.pdfOneModel.teacherKey = type;
    this.pdfOneModel.duration = durationMinutes + ' Minutes';
    this.pdfOneModel.examSetName = set;
    this.pdfOneModel.twoColumn = this.selectedColumnType === 'double';
    this.pdfOneModel.watermark = this.pdfOneModel.watermark || '';

    // Format questions
    type QuestionItem = {
        question: string;
        option1: string;
        option2: string;
        option3: string;
        option4: string;
    } & ({ questionId: number } | { questionsId: number });

    const filteredData = (element as QuestionItem[]).map((item) => {
        const questionId =
            'questionId' in item ? item.questionId : item.questionsId;

        return {
            questionId,
            question: item.question,
            option1: item.option1,
            option2: item.option2,
            option3: item.option3,
            option4: item.option4,
        };
    });

    this.pdfOneModel.questions = filteredData;

    // Validation
    if (!this.pdfOneModel.institute || !this.pdfOneModel.examName || !this.pdfOneModel.date) {
        alert('Please fill all required fields: institute, exam name, date, start time, and end time');
        return;
    }

    if (!this.pdfOneModel.totalMarks || this.pdfOneModel.totalMarks <= 0) {
        alert('Total marks must be greater than 0');
        return;
    }

    this.isLoading = true;
    this.setIndexCurrent = i;

    console.log('📄 Final PDF One Model:', {
        examName: this.pdfOneModel.examName,
        date: this.pdfOneModel.date,
        totalMarks: this.pdfOneModel.totalMarks,
        duration: this.pdfOneModel.duration,
        institute: this.pdfOneModel.institute,
        questionsCount: this.pdfOneModel.questions.length
    });

    this.http.postBlobRequest('api/pdf/createPDF', this.pdfOneModel).subscribe(
        (blob: Blob) => {
            if (!this.downloadedSets.includes(i)) {
                this.downloadedSets.push(i);
            }
            this.isLoading = false;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const fileExtension = this.pdfOneModel.isPdf ? 'pdf' : 'docx';
            a.download = `Exam_${this.pdfOneModel.examSetName || 'document'
                }_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        (error) => {
            this.isLoading = false;
            console.error('Error generating document:', error);
            alert('Failed to generate document');
        }
    );
  }

  /**
   * Download PDF for Format 4
   */
  DownloadPdf2(element: any, i: any, set: any, type: any) {
    const examName = this.testObject.testName + ' ' + set;
    const examDate = this.testObject.testDate;
    const totalMarks = this.testObject.marks;
    const instituteName = this.institute || 'Format 4';
    const organization = this.route.snapshot.paramMap.get('name') || '';
    const startTime = this.testObject.startTime;
    const endTime = this.testObject.endTime;
    const timeString = startTime && endTime ? startTime + ' to ' + endTime : '10:00 to 12:00';

    console.log('📄 PDF Data (Format 4):', {
        examName: examName,
        date: examDate,
        totalMarks: totalMarks,
        time: timeString,
        instituteName: instituteName,
        organization: organization,
        questionsCount: element?.length || 0
    });

    this.pdfTwoModel.organization = organization;
    this.pdfTwoModel.examName = examName;
    this.pdfTwoModel.date = examDate;
    this.pdfTwoModel.totalMarks = totalMarks;
    this.pdfTwoModel.instituteName = instituteName;
    this.pdfTwoModel.teacherKey = type;
    this.pdfTwoModel.time = timeString;
    this.pdfTwoModel.examSetName = set;
    this.pdfTwoModel.standard = set;
    this.pdfTwoModel.twoColumn = this.selectedColumnTypePdf2 === 'double';

    type QuestionItem = {
        question: string;
        option1: string;
        option2: string;
        option3: string;
        option4: string;
    } & ({ questionId: number } | { questionsId: number });

    const filteredData = (element as QuestionItem[]).map((item) => {
        const questionId =
            'questionId' in item ? item.questionId : item.questionsId;

        return {
            questionId,
            question: item.question,
            option1: item.option1,
            option2: item.option2,
            option3: item.option3,
            option4: item.option4,
        };
    });

    this.pdfTwoModel.questions = filteredData;
    this.pdfTwoModel.totalQuestions = filteredData.length;

    this.isLoading = true;
    this.setIndexCurrent = i;

    console.log('📄 Final PDF Two Model:', this.pdfTwoModel);

    this.http.postBlobRequest('api/pdf/createPDF1', this.pdfTwoModel).subscribe(
        (blob: Blob) => {
            if (!this.downloadedSets.includes(i)) {
                this.downloadedSets.push(i);
            }
            this.isLoading = false;

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            const fileExtension = this.pdfTwoModel.isPdf ? 'pdf' : 'docx';
            const fileName = `Exam_${this.pdfTwoModel.examSetName ||
                this.pdfTwoModel.examName ||
                'document'
                }_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(link);
            }, 100);
        },
        (error) => {
            this.isLoading = false;
            console.error('Error generating document:', error);
            alert('Failed to generate document');
        }
    );
  }

  OMRDownload(i: any) {
    if (this.institute.trim().length <= 0) {
      alert('Please select institute to download OMR Sheet.');
      return;
    }

    let obj = {
      instituteName: this.institute,
      totalQuestions: this.testSelectedQuestions.length,
      isPdf: this.answerKey1Model.isPdf,
    };

    this.isLoading = true;
    this.setIndexCurrent = i;

    this.http.postBlobRequest('api/pdf/omr', obj).subscribe(
      (blob: Blob) => {
        this.isLoading = false;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const fileExtension = this.answerKey1Model.isPdf ? 'pdf' : 'docx';
        a.download = `OMR_Sheet_${this.institute}_${new Date()
          .toISOString()
          .slice(0, 10)}.${fileExtension}`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error generating file:', error);
        alert('Failed to generate file');
      }
    );
  }

  CreateTest() {
    // Add selected subjects to testObject before sending
    this.testObject.selectedSubjects = this.selectedSubjectsList;

    // Update form with latest testObject values
    this.testForm.patchValue({
      testName: this.testObject.testName,
      testDate: this.formatToISO(this.testObject.testDate),
      startTime: this.testObject.startTime,
      endTime: this.testObject.endTime,
      marks: this.testObject.marks,
      testMode: this.testObject.testMode
    });

    Object.keys(this.testForm.controls).forEach((field) => {
      const control = this.testForm.get(field);
      if (control?.disabled) {
        control.enable();
      }
    });

    Object.values(this.testForm.controls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    console.log('Form Status:', this.testForm.status);
    console.log('Form Errors:', this.testForm.errors);
    Object.keys(this.testForm.controls).forEach((key) => {
      console.log(`${key} Errors:`, this.testForm.get(key)?.errors);
    });
    console.log('Selected Subjects in CreateTest:', this.selectedSubjectsList);
    console.log('Test Object being sent:', this.testObject);
    console.log('Questions being sent:', this.testSelectedQuestions.length);

    if (this.testForm.valid) {
      console.log('Form is valid:', this.testObject);
      
      // Determine if this is Create or Update
      const endpoint = this.isEditMode && this.editTestId 
        ? `${update_test}/${this.editTestId}` 
        : `api/test/createSets`;
      
      const requestMethod = this.isEditMode && this.editTestId 
        ? this.http.putRequest.bind(this.http) 
        : this.http.postRequest.bind(this.http);
      
      // Add testId for update
      if (this.isEditMode && this.editTestId) {
        this.testObject.testId = this.editTestId;
      }

      requestMethod(endpoint, this.testObject).subscribe({
        next: (response) => {
          console.log(response);
          const message = this.isEditMode ? 'Test updated successfully' : 'Test created successfully';
          alert(message);
          // Navigate back to tests list
          const boardName = this.route.snapshot.paramMap.get('name');
          this.router.navigate([`/teacher/${boardName}/tests`]);
        },
        error: (err) => {
          console.log('Error in subscription:', err);
          const errorMsg = this.isEditMode ? 'Error updating test. Please try again.' : 'Error creating test. Please try again.';
          alert(errorMsg);
        },
      });
    } else {
      alert('Form is not valid. Please fill in all required fields correctly.');
    }
  }

  formatToISO(date: string | null): string | null {
    if (!date) return null;
    const parts = date.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  onColumnType(event: Event): void {
    const selectedCategory = (event.target as HTMLSelectElement).value;
    this.columnType = selectedCategory;
    this.cdr.detectChanges();
  }

  goNext() {
    alert('Going Next!');
  }

  shouldAddBorder(): boolean {
    const itemHeight = 50;
    const totalItems = this.testSelectedQuestions.length;
    const cumulativeHeight = totalItems * itemHeight;

    if (cumulativeHeight > 465 && (cumulativeHeight - 465) % 1080 === 0) {
      return true;
    }
    return false;
  }

  DownloadTwoColoumnPdf(element: any, i: any) {
    this.isLoading = true;
    this.setIndexCurrent = i;
    const filteredData = (
      element as {
        question: string;
        option1: string;
        option2: string;
        option3: string;
        option4: string;
      }[]
    ).map(({ question, option1, option2, option3, option4 }) => ({
      question,
      option1,
      option2,
      option3,
      option4,
    }));

    this.http
      .postBlobRequest('api/test/pdfGenerateTwoColumn', filteredData)
      .subscribe(
        (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          this.isLoading = false;
          window.open(url);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error generating PDF:', error);
          alert('Failed to generate PDF');
        }
      );
  }

  exportPDF() {
    const element = document.querySelector('.main-content') as HTMLElement;

    if (element) {
      setTimeout(() => {
        const images = element.querySelectorAll('img');

        const imagePromises = Array.from(images).map(
          (img: HTMLImageElement) =>
            new Promise<void>((resolve, reject) => {
              const imgSrc = img.src;

              fetch(imgSrc)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${imgSrc}`);
                  }
                  return response.blob();
                })
                .then((blob) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    img.src = reader.result as string;
                    resolve();
                  };
                  reader.onerror = () =>
                    reject(new Error('Failed to convert image to Base64'));
                  reader.readAsDataURL(blob);
                })
                .catch((error) => reject(error));
            })
        );

        Promise.all(imagePromises)
          .then(() => {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const outerPadding = 10;
            const innerPadding = 5;
            const usableWidth = pageWidth - 2 * (outerPadding + innerPadding);
            const usableHeight = pageHeight - 2 * (outerPadding + innerPadding);

            html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
              const contentWidth = canvas.width;
              let contentHeight = canvas.height;

              const scaleFactor = usableWidth / contentWidth;
              const scaledWidth = usableWidth;
              let yPosition = 0;

              while (contentHeight > 0) {
                const remainingHeight = usableHeight / scaleFactor;
                const visibleHeight = Math.min(remainingHeight, contentHeight);

                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = contentWidth;
                croppedCanvas.height = visibleHeight;

                const ctx = croppedCanvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(
                    canvas,
                    0,
                    yPosition,
                    contentWidth,
                    visibleHeight,
                    0,
                    0,
                    contentWidth,
                    visibleHeight
                  );

                  const croppedImageData = croppedCanvas.toDataURL('image/png');

                  doc.addImage(
                    croppedImageData,
                    'PNG',
                    outerPadding + innerPadding,
                    outerPadding + innerPadding,
                    scaledWidth,
                    visibleHeight * scaleFactor
                  );
                }

                doc.setDrawColor(0);
                doc.setLineWidth(0.3);
                doc.rect(
                  outerPadding,
                  outerPadding,
                  pageWidth - 2 * outerPadding,
                  pageHeight - 2 * outerPadding
                );

                yPosition += visibleHeight;
                contentHeight -= visibleHeight;

                if (contentHeight > 0) {
                  doc.addPage();
                }
              }

              doc.save('question.pdf');
            });
          })
          .catch((error) => {
            console.error('Error processing images:', error);
          });
      }, 100);
    } else {
      console.error('No element found with the class "main-content".');
    }
  }
}
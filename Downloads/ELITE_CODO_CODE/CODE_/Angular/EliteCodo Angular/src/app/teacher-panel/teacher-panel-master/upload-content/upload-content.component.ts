import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { chapterwisetopics, entranceexamwisestandard, entranceexamwisesubject, fileUpload, getActive_exam, standardwisesubject, subjectwisechapter } from 'src/app/shared/allURL';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ContentType {
  id: string;
  title: string;
  icon: string;
  description: string;
  fileTypes: string[];
}

interface TestData {
  testId: number;
  testName: string;
}

interface ApiResponse {
  message: string;
  responseCode: number;
  flag: boolean;
  id: number | null;
}

@Component({
  selector: 'app-upload-content',
  templateUrl: './upload-content.component.html',
  styleUrls: ['./upload-content.component.scss'],
  animations: [
    trigger('cardAnimation', [
      state('inactive', style({
        transform: 'scale(1)',
        opacity: 0.7
      })),
      state('active', style({
        transform: 'scale(1.05)',
        opacity: 1
      })),
      transition('inactive <=> active', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class UploadContentComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedContentType: string | null = null;
  http = inject(HttpmethodsService);

  filteredStandards: any[] = [];
  filteredSubjects: any[] = [];
  filteredChapters: any[] = [];
  filteredTopics: any[] = [];

  contentTypes: ContentType[] = [
    {
      id: 'formulas',
      title: 'Formulas',
      icon: 'calculator',
      description: 'Upload chapter-specific mathematical formulas',
      fileTypes: ['pdf', 'txt', 'docx', 'doc']
    },
    {
      id: 'notes',
      title: 'Study Notes',
      icon: 'read',
      description: 'Comprehensive chapter and topic-wise notes',
      fileTypes: ['pdf', 'txt', 'docx', 'doc']
    },
    {
      id: 'summary',
      title: 'Summaries',
      icon: 'snippets',
      description: 'Concise chapter and topic summaries',
      fileTypes: ['pdf', 'txt', 'docx', 'doc']
    },
    {
      id: 'video',
      title: 'Video Content',
      icon: 'play-circle',
      description: 'Educational video lectures and tutorials',
      fileTypes: ['mp4', 'mov', 'avi']
    },
    {
      id: 'schedule',
      title: 'Schedules',
      icon: 'schedule',
      description: 'Exam and study schedule management',
      fileTypes: ['pdf', 'docx', 'doc']
    },
    {
      id: 'question',
      title: 'Question Papers',
      icon: 'file-text',
      description: 'Past exam question papers with solutions',
      fileTypes: ['pdf']
    }
  ];

  activeExam: any[] = [];
  serverImage: string = '';
  fileName: string = '';
  testData: TestData[] = [];
  fileExtensionOfUpload: string = '';
  activateROut = inject(ActivatedRoute);
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.getexamActiveData();
    this.getTestData();
  }

  initializeForm() {
    this.uploadForm = this.fb.group({
      examName: [null, Validators.required],
      standard: [null],
      subject: [null],
      chapter: [null],
      topic: [null],
      url: [null, Validators.required],
      title: [null, [Validators.required, Validators.minLength(5)]],
      testName: [null],
      testDateTime: [null],
      description: [null],
      examYear: [null]
    });

    this.updateFormValidators();
  }

  updateFormValidators() {
    if (!this.selectedContentType) return;

    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    this.uploadForm.get('examName')?.setValidators([Validators.required]);
    this.uploadForm.get('url')?.setValidators([Validators.required]);
    this.uploadForm.get('title')?.setValidators([Validators.required, Validators.minLength(5)]);

    switch (this.selectedContentType) {
      case 'schedule':
        this.uploadForm.get('testName')?.setValidators([Validators.required]);
        this.uploadForm.get('testDateTime')?.setValidators([Validators.required]);
        break;

      case 'question':
        this.uploadForm.get('examYear')?.setValidators([Validators.required]);
        break;

      default:
        this.uploadForm.get('standard')?.setValidators([Validators.required]);
        this.uploadForm.get('subject')?.setValidators([Validators.required]);
        this.uploadForm.get('chapter')?.setValidators([Validators.required]);
        this.uploadForm.get('description')?.setValidators([Validators.required, Validators.minLength(10)]);
        break;
    }

    Object.keys(this.uploadForm.controls).forEach(key => {
      this.uploadForm.get(key)?.updateValueAndValidity();
    });
  }

  selectContentType(type: ContentType) {
    this.uploadForm.reset();
    this.selectedContentType = type.id;
    this.resetFilteredData();
    this.updateFormValidators();
    this.serverImage = '';
    this.fileExtensionOfUpload = '';
  }

  resetFilteredData() {
    this.filteredStandards = [];
    this.filteredSubjects = [];
    this.filteredChapters = [];
    this.filteredTopics = [];
  }

  navigateToResources() {
    const boardName = this.activateROut.snapshot.paramMap.get('name');
    this.router.navigate([`/teacher/${boardName}/view-content`]);
  }

  getTestData() {
    // Using pipe and catchError to handle 404 gracefully
    this.http.getRequest('api/tests/active').pipe(
      catchError((error: any) => {
        console.warn('Test data API error (404 expected if no tests exist):', error);
        // Return empty array as fallback
        return of([]);
      })
    ).subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.testData = response;
        } else if (response && Array.isArray(response.data)) {
          this.testData = response.data;
        } else if (response && typeof response === 'object') {
          this.testData = [response];
        } else {
          this.testData = [];
        }

        // Only show error if it's not a 404 and we actually have an error
        if (response === null || response === undefined) {
          // Silent fail - no test data available
          this.testData = [];
        }
      },
      (error: any) => {
        // This is the error callback for when catchError doesn't handle it
        console.error('Error loading test data:', error);
        // Don't show error popup for 404 - just set empty array
        if (error?.status !== 404) {
          this.notificationService.showError('Failed to load test data', 'Error');
        }
        this.testData = [];
      }
    );
  }

  resetSelection() {
    this.uploadForm.reset();
    this.selectedContentType = null;
    this.resetFilteredData();
    this.serverImage = '';
    this.fileExtensionOfUpload = '';
  }

  handleFileInput(event: any, controlName: string) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];

    if (!file) {
      this.notificationService.showError('No file selected', 'Error');
      return;
    }

    this.fileName = file.name;

    const maxFileSize = 50 * 1024 * 1024;
    if (file.size > maxFileSize) {
      this.notificationService.showError(`File size exceeds ${maxFileSize / (1024 * 1024)} MB limit`, 'Error');
      return;
    }

    const selectedContentType = this.contentTypes.find(type => type.id === this.selectedContentType);
    if (!selectedContentType) {
      this.notificationService.showError('Invalid content type selected', 'Error');
      return;
    }

    const allowedFileTypes = selectedContentType.fileTypes;
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
      this.notificationService.showError(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`, 'Error');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    formData.append('uploadfile', file);

    this.http.postRequest(fileUpload, formData).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (data.status === true) {
          this.fileExtensionOfUpload = fileExtension;
          this.serverImage = data.path;
          this.notificationService.showSuccess('File uploaded successfully', 'Success');
          this.uploadForm.patchValue({ url: data.path });
        } else {
          this.notificationService.showError(data.message || 'Failed to upload file', 'Error');
        }
      },
      (error: any) => {
        this.isLoading = false;
        console.error('File upload error:', error);
        this.notificationService.showError('Something went wrong during file upload', 'Error');
      }
    );
  }

  isImage(fileValue: string | null): boolean {
    if (!fileValue) return false;

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

    if (fileValue.startsWith('data:image')) return true;

    const extension = fileValue.split('.').pop()?.toLowerCase();
    return extension ? imageExtensions.includes(extension) : false;
  }

  getSelectedContentTypeTitle(): string {
    const selectedType = this.contentTypes.find(type => type.id === this.selectedContentType);
    return selectedType ? selectedType.title : 'Content';
  }

  onEntranceExamChange(entranceExamId: any) {
    if (!entranceExamId || entranceExamId === 'null' || entranceExamId === 'undefined') {
      this.filteredStandards = [];
      this.uploadForm.patchValue({
        standard: null,
        subject: null,
        chapter: null,
        topic: null
      });
      return;
    }

    const examId = Number(entranceExamId);
    if (isNaN(examId)) {
      this.notificationService.showError('Invalid exam ID', 'Error');
      return;
    }

    this.http.getRequest(entranceexamwisestandard + examId).subscribe(
      (res: any) => {
        this.filteredStandards = res.standardMasters || [];
        this.uploadForm.patchValue({
          standard: null,
          subject: null,
          chapter: null,
          topic: null
        });
      },
      (error: any) => {
        console.error('Error loading standards:', error);
        this.notificationService.showError('Failed to load standards', 'Error');
        this.filteredStandards = [];
      }
    );
  }

  onStandardChange(standardId: any) {
    if (!standardId || standardId === 'null' || standardId === 'undefined') {
      this.filteredSubjects = [];
      this.uploadForm.patchValue({
        subject: null,
        chapter: null,
        topic: null
      });
      return;
    }

    const stdId = Number(standardId);
    if (isNaN(stdId)) {
      this.notificationService.showError('Invalid standard ID', 'Error');
      return;
    }

    this.http.getRequest(standardwisesubject + stdId).subscribe(
      (res: any) => {
        this.filteredSubjects = res.subjectMasters || [];
        this.uploadForm.patchValue({
          subject: null,
          chapter: null,
          topic: null
        });
      },
      (error: any) => {
        console.error('Error loading subjects:', error);
        this.notificationService.showError('Failed to load subjects', 'Error');
        this.filteredSubjects = [];
      }
    );
  }

  onSubjectChange(subjectId: any) {
    if (!subjectId || subjectId === 'null' || subjectId === 'undefined') {
      this.filteredChapters = [];
      this.uploadForm.patchValue({
        chapter: null,
        topic: null
      });
      return;
    }

    const subId = Number(subjectId);
    const standardId = this.uploadForm.get('standard')?.value;

    if (isNaN(subId) || !standardId) {
      this.notificationService.showError('Invalid subject or standard ID', 'Error');
      return;
    }

    this.http.getRequest(`${subjectwisechapter}active/${subId}/${standardId}`).subscribe(
      (res: any) => {
        this.filteredChapters = res || [];
        this.uploadForm.patchValue({
          chapter: null,
          topic: null
        });
      },
      (error: any) => {
        console.error('Error loading chapters:', error);
        this.notificationService.showError('Failed to load chapters', 'Error');
        this.filteredChapters = [];
      }
    );
  }

  onChapterChange(chapterId: any) {
    if (!chapterId || chapterId === 'null' || chapterId === 'undefined') {
      this.filteredTopics = [];
      this.uploadForm.patchValue({ topic: null });
      return;
    }

    const chapId = Number(chapterId);
    if (isNaN(chapId)) {
      this.notificationService.showError('Invalid chapter ID', 'Error');
      return;
    }

    this.http.getRequest(chapterwisetopics + chapId).subscribe(
      (res: any) => {
        this.filteredTopics = res || [];
        this.uploadForm.patchValue({ topic: null });
      },
      (error: any) => {
        console.error('Error loading topics:', error);
        this.notificationService.showError('Failed to load topics', 'Error');
        this.filteredTopics = [];
      }
    );
  }

  getexamActiveData() {
    const teacherID = sessionStorage.getItem('teacherId');
    if (!teacherID) {
      this.notificationService.showError('Teacher ID not found', 'Error');
      return;
    }

    this.http.getRequest(`api/auth/teacherentranceexams/${teacherID}`).subscribe(
      (res: any) => {
        this.activeExam = res || [];
      },
      (error: any) => {
        console.error('Error loading exams:', error);
        this.notificationService.showError('Failed to load exams', 'Error');
        this.activeExam = [];
      }
    );
  }

  submitUpload() {
    this.uploadForm.markAllAsTouched();

    if (this.uploadForm.invalid) {
      this.notificationService.showError('Please fill all required fields correctly', 'Error');
      return;
    }

    if (!this.selectedContentType) {
      this.notificationService.showError('Please select a content type', 'Error');
      return;
    }

    if (!this.serverImage) {
      this.notificationService.showError('Please upload a file', 'Error');
      return;
    }

    const formData = this.uploadForm.value;
    const teacherId = sessionStorage.getItem('teacherId');

    if (!teacherId) {
      this.notificationService.showError('Teacher ID not found', 'Error');
      return;
    }

    const reqObj: any = {
      entranceExamId: formData.examName,
      url: this.serverImage,
      type: this.fileExtensionOfUpload,
      title: formData.title,
      contentType: this.selectedContentType,
      uploaderId: teacherId
    };

    switch (this.selectedContentType) {
      case 'schedule':
        if (formData.testName) reqObj.testId = formData.testName;
        if (formData.testDateTime) reqObj.testDateTime = formData.testDateTime;
        break;

      case 'question':
        if (formData.examYear) reqObj.examYear = String(formData.examYear);
        break;

      default:
        if (formData.standard) reqObj.standardId = formData.standard;
        if (formData.subject) reqObj.subjectId = formData.subject;
        if (formData.chapter) reqObj.chapterId = formData.chapter;
        if (formData.topic) reqObj.topicId = formData.topic;
        if (formData.description) reqObj.description = formData.description;
        break;
    }

    console.log('Submitting data:', reqObj);

    this.isLoading = true;

    this.http.postRequest(`api/uploadcontent/upload`, reqObj).subscribe(
      (res: any) => {
        this.isLoading = false;
        console.log('API Response:', res);

        const apiResponse = res as ApiResponse;

        if (apiResponse && apiResponse.flag === true) {
          this.notificationService.showSuccess(apiResponse.message || 'Content published successfully!', 'Success');
          this.resetSelection();
        } else {
          this.notificationService.showError(apiResponse?.message || 'Failed to publish content', 'Error');
        }
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Upload error:', error);
        this.notificationService.showError('Something went wrong while publishing content', 'Error');
      }
    );
  }
}
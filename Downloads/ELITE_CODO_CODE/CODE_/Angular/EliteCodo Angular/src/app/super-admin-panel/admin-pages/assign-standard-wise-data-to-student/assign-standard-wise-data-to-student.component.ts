import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import {
  entranceexamwisestandard, getActive_exam, standardwisesubject, assignStandardWiseDataToStudent,
  studentmappeddataURL,
  studentidandentranceexamidwisedata,
  studentidwiseallaccessmanagements,
  getById_student
} from 'src/app/shared/allURL';


@Component({
  selector: 'app-assign-standard-wise-data-to-student',
  templateUrl: './assign-standard-wise-data-to-student.component.html',
  styleUrls: ['./assign-standard-wise-data-to-student.component.scss', '../../../../assets/css/loading.css']
})
export class AssignStandardWiseDataToStudentComponent {
  assignmentForm!: FormGroup;
  entranceExams: any;

  loading: boolean = false; // Loading state
  errorMsg: boolean = false;
  isEdit = true;
  filteredStandards: any;
  filteredSubjects: any;  // Array of arrays for subjects per standard
  teacherId: any;
  notificationService = inject(NotificationService)
  isSubmitting: boolean = false; // Track the loading state
  buttonText: string = 'Submit Assignment';  // Default button text
  iconType: string = 'check-circle';  // Default icon type
  entranceExamIdVar: any;
  standardIdVar: any;
  loaderSpinn = false;
  isEditOfDeleteOptions = false;
  selectedSubjects: number[] = []; // Tracks selected options
  previousSelection: number[] = []; // Tracks the previous state of selections
  removedSubject: number | null = null; // Tracks the removed subject

  // Student data
  studentData: any = null;
  studentHasTeacher: boolean = false;

  dataSource = new MatTableDataSource<any>();
  // Columns to be displayed in the table
  displayedColumns: string[] = ['entranceExamName', 'entranceStatus', 'standardsAndSubjects', 'edit'];

  onloadEntranceexamid: any;
  @ViewChild('courseSection') courseSection!: ElementRef;
  forErrorMSG: any;

  constructor(
    private fb: FormBuilder, 
    private http: HttpmethodsService, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.assignmentForm = this.fb.group({
      entranceExamId: [''],
      standards: this.fb.array([])  // FormArray for standards and subjects
    });

    this.getDataFromQueryParams();
    this.getAccessManagement();
    this.loadActiveExams();  // Load entrance exams on init
    this.filteredSubjects = []; // Initialize filteredSubjects
  }

  // Handle selection changes
  onSelectionChange(currentSelection: number[]): void {
    // Detect removed options by comparing previously selected subjects with the current selection
    const removedOptions = this.selectedSubjects.filter(
      (id) => !currentSelection.includes(id)
    );

    if (removedOptions.length > 0) {
      this.removedSubject = removedOptions[0]; // Get the first removed subject
      console.log('Removed Subject:', this.removedSubject);
    } else {
      this.removedSubject = null; // Reset if nothing is removed
    }

    // Update the selectedSubjects array for the next change detection
    this.selectedSubjects = [...currentSelection];
    console.log('Updated Selected Subjects:', this.selectedSubjects);
  }

  getDataFromQueryParams() {
    this.route.queryParams.subscribe(params => {
      this.teacherId = +params['studentID'];
      console.log({ studentIdFromQueryParams: this.teacherId });
      
      // Check if student has a teacher assigned
      this.checkStudentTeacherAssignment();
    });
  }

  /**
   * Check if the student has a teacher assigned
   */
  checkStudentTeacherAssignment(): void {
    if (!this.teacherId) return;
    
    this.http.getRequest(`${getById_student}${this.teacherId}`).subscribe(
      (data: any) => {
        console.log('Student Data:', data);
        this.studentData = data;
        
        // Check if student has a teacher assigned
        if (data.teacher && data.teacher.id) {
          this.studentHasTeacher = true;
          console.log('Student has teacher assigned:', data.teacher.id);
        } else {
          this.studentHasTeacher = false;
          console.log('Student does NOT have a teacher assigned');
        }
      },
      (error) => {
        console.error('Error fetching student data:', error);
      }
    );
  }

  /**
   * Navigate to edit student page to assign teacher
   */
  goToEditStudent(): void {
    // Navigate back to student management with edit mode
    this.router.navigate(['/super_admin/Slayout/student-management'], {
      queryParams: { editStudentId: this.teacherId, openEdit: true }
    });
  }

  // Getter for standards FormArray
  get standards(): FormArray {
    return this.assignmentForm.get('standards') as FormArray;
  }

  // Add a new standard
  addStandard() {
    const standardGroup = this.fb.group({
      standardId: [''],
      subjectIds: [[]]
    });
    this.standards.push(standardGroup);
    this.filteredSubjects.push([]);  // Add an empty array for subjects
  }

  // Remove a standard
  removeStandard(standardId: any, index: number) {
    let standardIdVar = standardId.value.standardId
    console.log('standardId.value.standardId', standardIdVar);
    this.http.deleteRequest(`api/auth/delete/${this.teacherId}/${this.onloadEntranceexamid}`, `${standardIdVar}?role=student`).subscribe(
      (res) => {
        console.log({ res })
        this.notificationService.showSuccess('Succefully Deleted Row', 'Success');
        this.getAccessManagement();
        this.standards.removeAt(index);
        this.filteredSubjects.splice(index, 1);  // Remove corresponding subjects
      }, err => {
        this.notificationService.showError('Something Went Wrong', 'Error');
      })
  }

  loadActiveExams() {
    this.http.getRequest(`${getActive_exam}`).subscribe((data) => {
      this.entranceExams = data;
    });
  }

  scrollToCourseSection() {
    if (this.courseSection && this.courseSection.nativeElement) {
      this.courseSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // Handle entrance exam change
  onEntranceExamChange(entranceExamId: number) {
    console.log({ entranceExamId });

    this.http.getRequest(`${entranceexamwisestandard}${entranceExamId}`).subscribe((data: any) => {
      this.filteredStandards = data.standardMasters;
      this.filteredSubjects = this.standards.controls.map(() => []); // Reset subjects for all standards
    });
    this.standards.clear(); // Clear existing standards when a new entrance exam is selected
  }

  // Handle standard change for specific FormGroup
  onStandardChange(index: number, standardId: number) {
    console.log({ standardId });

    this.http.getRequest(`${standardwisesubject}${standardId}`).subscribe((data: any) => {
      this.filteredSubjects[index] = data.subjectMasters;
    });
  }

  getAccessManagement() {
    this.loading = true; // Start loading
    this.http.getRequest(studentidwiseallaccessmanagements + this.teacherId)
      .subscribe({
        next: (data: any) => {
          console.log({ data });
          this.forErrorMSG = data;

          const entranceExams = data.teacherAssessmentEntranceExams || [];

          if (data.teacherAssessmentEntranceExams.length === 0) {
            this.notificationService.showError('Not assigned', 'Not assigned any data');
          }

          this.errorMsg = false;
          this.loading = false; // Data loaded
          this.dataSource = new MatTableDataSource(entranceExams);
          console.log('Access Management Data:', entranceExams);
        },
        error: (error) => {
          console.error('Error fetching access management:', error);
          this.errorMsg = true;
          this.loading = false; // Error occurred, stop loading
        }
      });
  }

  loadExistingData(entranceexamid: any) {
    this.onloadEntranceexamid = entranceexamid;
    this.loaderSpinn = true;
    console.log('teacherId', this.teacherId);

    this.http.getRequest(`${studentidandentranceexamidwisedata}${this.teacherId}/${entranceexamid}`).subscribe(
      (response: any) => {

        console.log({ response });
        console.log('res =>', response);

        this.isEditOfDeleteOptions = true;
        if (response.teacherAssessmentEntranceExams.length === 0) {
          this.notificationService.showError('Not assigned', 'Not assigned any data');
        } else {
          this.notificationService.showSuccess('Succefully Fetched', 'Success');
          let arr = response.teacherAssessmentEntranceExams[0].teacherAssessmentStandards[0].teacherAssessmentSubjects;
          let newArr = arr.map((val: any) => val.subjectId)
          this.selectedSubjects = newArr;
          console.log({ newArr });
        }
        this.loaderSpinn = false;

        if (response) {
          const entranceExam = response.teacherAssessmentEntranceExams[0];
          this.assignmentForm.patchValue({
            entranceExamId: entranceExam.entranceExamId,
            isPrint: response.isPrint,
            isOcr: response.isOcr
          });

          this.isEdit = false;

          this.entranceExamIdVar = entranceExam.entranceExamId;
          // Load standards for the entrance exam
          this.http.getRequest(`${entranceexamwisestandard}${entranceExam.entranceExamId}`)
            .subscribe((data: any) => {

              this.filteredStandards = data.standardMasters;

              // Clear existing standards
              this.standards.clear();
              const subjectObservables: Observable<any>[] = [];

              // Add each standard and push subject API calls to the array
              entranceExam.teacherAssessmentStandards.forEach((standard: any, index: number) => {
                const standardGroup = this.fb.group({
                  standardId: [standard.standardId],
                  subjectIds: [standard.teacherAssessmentSubjects.map((subject: any) => subject.subjectId)]
                });
                this.standards.push(standardGroup);
                this.standardIdVar = standard.standardId;
                // Push subject API call
                subjectObservables.push(
                  this.http.getRequest(`${standardwisesubject}${standard.standardId}`)
                );
              });

              // Use forkJoin to execute all subject calls in parallel
              forkJoin(subjectObservables).subscribe((subjectResponses: any[]) => {
                this.filteredSubjects = subjectResponses.map(response => response.subjectMasters);
              });
              this.loaderSpinn = false;
            });
        }
      },
      error => {
        this.loaderSpinn = false;
        console.error('Error loading existing data:', error);
        this.notificationService.showError("Failed to load existing data", "Error");
      }
    );
  }

  // Submit form
  onSubmit() {
    // FIRST: Check if student has a teacher assigned
    if (!this.studentHasTeacher) {
      this.notificationService.showError(
        'This student does not have a teacher assigned. Please assign a teacher first.',
        'Teacher Required'
      );
      
      // Show a confirmation dialog to navigate to edit student
      if (confirm('This student has no teacher assigned. Would you like to go to Student Management to assign a teacher?')) {
        this.goToEditStudent();
      }
      return;
    }

    if (this.isEdit) {
      if (this.assignmentForm.valid) {
        // Start the loader, update the button text and icon type
        this.buttonText = 'Processing...';
        this.isSubmitting = true;
        this.iconType = 'loading';  // Change icon to loader
        const requestBody = {
          teacherId: this.teacherId,  // This is Student ID
          entranceExamId: this.assignmentForm.value.entranceExamId,
          standards: this.assignmentForm.value.standards.map((standard: any) => ({
            standardId: standard.standardId,
            subjectIds: standard.subjectIds
          }))
        };
        console.log({ requestBody });
        this.http.postRequest(`api/auth/addstudentassignemnts`, requestBody).subscribe((response: any) => {
          console.log('Assignment successful', response);
          this.notificationService.showSuccess("Assignment successful", "Success");
          this.assignmentForm.reset();
          this.getAccessManagement();
          this.buttonText = 'Submit Assignment';
          this.isSubmitting = false;
          this.iconType = 'check-circle';  // Change back to default icon
        }, error => {
          console.error('Assignment failed', error);
          
          // Check for specific error messages
          if (error.status === 400 && error.error?.message === "Student must have an assigned teacher before adding assignments") {
            this.notificationService.showError(
              'This student does not have a teacher assigned. Please assign a teacher first.',
              'Teacher Required'
            );
          } else if (error.status === 400 && error.error?.message === "Already present standard") {
            this.notificationService.showError("Standard already exists", "Duplicate Standard Entry");
          } else {
            this.notificationService.showError("Failed to load existing data", "Error");
          }
          this.buttonText = 'Submit Assignment';
          this.isSubmitting = false;
          this.iconType = 'check-circle';  // Change back to default icon
        });

      } else {
        this.notificationService.showError("Please Fill all the field", "Error");
      }
    } else {
      console.log('Please fill all the fields below and Update');
      if (this.assignmentForm.valid) {
        // Start the loader, update the button text and icon type
        this.buttonText = 'Processing...';
        this.isSubmitting = true;
        this.iconType = 'loading';  // Change icon to loader
        const requestBody = {
          teacherId: this.teacherId,  // This is Student ID
          entranceExamId: this.assignmentForm.value.entranceExamId,
          standards: this.assignmentForm.value.standards.map((standard: any) => ({
            standardId: standard.standardId,
            subjectIds: standard.subjectIds
          }))
        };
        console.log({ requestBody });
        this.http.putRequest(`api/auth/updatestudentassignments`, requestBody).subscribe((response: any) => {
          console.log('Assignment successful', response);
          this.notificationService.showSuccess("Assignment update successful", "Success");
          this.assignmentForm.reset();
          this.getAccessManagement();
          this.buttonText = 'Submit Assignment';
          this.isSubmitting = false;
          this.iconType = 'check-circle';  // Change back to default icon
        }, error => {
          console.error('Assignment failed', error);
          
          if (error.status === 400 && error.error?.message === "Student must have an assigned teacher before adding assignments") {
            this.notificationService.showError(
              'This student does not have a teacher assigned. Please assign a teacher first.',
              'Teacher Required'
            );
          } else if (error.status === 400 && error.error?.message === "Already present standard") {
            this.notificationService.showError("Standard already exists", "Duplicate Standard Entry");
          } else {
            this.notificationService.showError("Failed to load existing update data", "Error");
          }
          this.buttonText = 'Submit Assignment';
          this.isSubmitting = false;
          this.iconType = 'check-circle';  // Change back to default icon
        });

      } else {
        this.notificationService.showError("Please Fill all the field", "Error");
      }
    }
  }
}
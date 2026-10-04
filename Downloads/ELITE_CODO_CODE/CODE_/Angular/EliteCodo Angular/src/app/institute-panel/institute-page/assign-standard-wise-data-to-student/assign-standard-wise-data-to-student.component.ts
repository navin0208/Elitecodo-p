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
import swal from 'sweetalert2';

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
  router = inject(Router)
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
  forErrorMSG: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['entranceExamName', 'entranceStatus', 'standardsAndSubjects', 'edit'];

  onloadEntranceexamid: any;
  @ViewChild('courseSection') courseSection!: ElementRef;

  // Student data
  studentData: any = null;
  studentHasTeacher: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpmethodsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.assignmentForm = this.fb.group({
      entranceExamId: [''],
      standards: this.fb.array([])
    });

    this.getDataFromQueryParams();
    this.getAccessManagement();
    this.loadActiveExams();
    this.filteredSubjects = [];
  }

  // Handle selection changes
  onSelectionChange(currentSelection: number[]): void {
    const removedOptions = this.selectedSubjects.filter(
      (id) => !currentSelection.includes(id)
    );

    if (removedOptions.length > 0) {
      this.removedSubject = removedOptions[0];
      console.log('Removed Subject:', this.removedSubject);
    } else {
      this.removedSubject = null;
    }

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
    this.router.navigate(['/institute/layout-institute/student-management'], {
      queryParams: { editStudentId: this.teacherId }
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
    this.filteredSubjects.push([]);
  }

  // Remove a standard
  removeStandard(standardId: any, index: number) {
    let standardIdVar = standardId.value.standardId;
    console.log('standardId.value.standardId', standardIdVar);
    this.http.deleteRequest(`api/auth/delete/${this.teacherId}/${this.onloadEntranceexamid}`, `${standardIdVar}?role=student`).subscribe(
      (res) => {
        console.log({ res });
        this.notificationService.showSuccess('Successfully Deleted Row', 'Success');
        this.getAccessManagement();
        this.standards.removeAt(index);
        this.filteredSubjects.splice(index, 1);
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
      this.filteredSubjects = this.standards.controls.map(() => []);
    });
    this.standards.clear();
  }

  // Handle standard change for specific FormGroup
  onStandardChange(index: number, standardId: number) {
    console.log({ standardId });

    this.http.getRequest(`${standardwisesubject}${standardId}`).subscribe((data: any) => {
      this.filteredSubjects[index] = data.subjectMasters;
    });
  }

  getAccessManagement() {
    this.loading = true;
    this.http.getRequest(studentidwiseallaccessmanagements + this.teacherId)
      .subscribe({
        next: (data: any) => {
          this.forErrorMSG = data;
          const entranceExams = data.teacherAssessmentEntranceExams || [];
          this.errorMsg = false;
          this.loading = false;
          this.dataSource = new MatTableDataSource(entranceExams);
          console.log('Access Management Data:', entranceExams);
        },
        error: (error) => {
          console.error('Error fetching access management:', error);
          this.errorMsg = true;
          this.loading = false;
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
          this.notificationService.showSuccess('Successfully Fetched', 'Success');
          let arr = response.teacherAssessmentEntranceExams[0].teacherAssessmentStandards[0].teacherAssessmentSubjects;
          let newArr = arr.map((val: any) => val.subjectId);
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

          this.http.getRequest(`${entranceexamwisestandard}${entranceExam.entranceExamId}`)
            .subscribe((data: any) => {
              this.filteredStandards = data.standardMasters;
              this.standards.clear();
              const subjectObservables: Observable<any>[] = [];

              entranceExam.teacherAssessmentStandards.forEach((standard: any, index: number) => {
                const standardGroup = this.fb.group({
                  standardId: [standard.standardId],
                  subjectIds: [standard.teacherAssessmentSubjects.map((subject: any) => subject.subjectId)]
                });
                this.standards.push(standardGroup);
                this.standardIdVar = standard.standardId;
                subjectObservables.push(
                  this.http.getRequest(`${standardwisesubject}${standard.standardId}`)
                );
              });

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
      // Show a user-friendly SweetAlert popup
      swal.fire({
        title: '⚠️ Teacher Required',
        html: `
          <div style="text-align: left;">
            <p style="font-size: 16px; margin-bottom: 15px; color: #555;">
              This student does not have a teacher assigned. 
              Please assign a teacher before proceeding with Access Management.
            </p>
            <ul style="color: #e74c3c; margin-left: 20px; list-style-type: none; padding-left: 0;">
              <li style="margin: 10px 0; padding: 5px 10px; background: #fef5f5; border-radius: 5px;">
                <strong>Student:</strong> ${this.studentData?.firstName || ''} ${this.studentData?.lastName || ''}
              </li>
              <li style="margin: 10px 0; padding: 5px 10px; background: #fef5f5; border-radius: 5px;">
                <strong>Current Status:</strong> No teacher assigned
              </li>
            </ul>
            <p style="font-size: 14px; color: #666; margin-top: 15px;">
              Click "Assign Teacher" to go to Student Management and assign a teacher.
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Assign Teacher Now',
        confirmButtonColor: '#17a2b8',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#6c757d',
        background: '#fff',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to edit student page
          this.goToEditStudent();
        }
      });
      return;
    }

    // Proceed with normal submission if student has teacher
    if (this.isEdit) {
      if (this.assignmentForm.valid) {
        this.buttonText = 'Processing...';
        this.isSubmitting = true;
        this.iconType = 'loading';
        const requestBody = {
          teacherId: this.teacherId,
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
          this.iconType = 'check-circle';
        }, error => {
          console.error('Assignment failed', error);
          if (error.status === 400 && error.error?.message === "Already present standard") {
            this.notificationService.showError("Standard already exists", "Duplicate Standard Entry");
          } else if (error.status === 400 && error.error?.message === "Student must have an assigned teacher before adding assignments") {
            this.notificationService.showError(
              "This student does not have a teacher assigned. Please assign a teacher first.",
              "Teacher Required"
            );
          } else {
            this.notificationService.showError("Failed to load existing data", "Error");
          }
          this.buttonText = 'Submit Assignment';
          this.isSubmitting = false;
          this.iconType = 'check-circle';
        });

      } else {
        this.notificationService.showError("Please Fill all the field", "Error");
      }
    } else {
      console.log('Please fill all the fields below and Update');
      if (this.assignmentForm.valid) {
        this.buttonText = 'Processing...';
        this.isSubmitting = true;
        this.iconType = 'loading';
        const requestBody = {
          teacherId: this.teacherId,
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
          this.iconType = 'check-circle';
        }, error => {
          console.error('Assignment failed', error);
          if (error.status === 400 && error.error?.message === "Already present standard") {
            this.notificationService.showError("Standard already exists", "Duplicate Standard Entry");
          } else if (error.status === 400 && error.error?.message === "Student must have an assigned teacher before adding assignments") {
            this.notificationService.showError(
              "This student does not have a teacher assigned. Please assign a teacher first.",
              "Teacher Required"
            );
          } else {
            this.notificationService.showError("Failed to load existing update data", "Error");
          }
          this.buttonText = 'Submit Assignment';
          this.isSubmitting = false;
          this.iconType = 'check-circle';
        });

      } else {
        this.notificationService.showError("Please Fill all the field", "Error");
      }
    }
  }
}
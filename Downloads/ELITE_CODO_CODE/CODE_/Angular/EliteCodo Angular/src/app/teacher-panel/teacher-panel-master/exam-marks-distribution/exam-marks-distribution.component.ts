import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MainURL } from 'src/app/ConfigUrl/config';
import { ActivatedRoute } from '@angular/router';
interface GradeSubmission {
  testId: number;
  studentId: number;
  grades: { [key: string]: number };
}
interface Subject {
  id: number;
  name: string;
}

interface Grade {
  subjectId: number;
  value: number | null;
}

interface Student {
  id: number;
  name: string;
  grades: Grade[];
}

interface Test {
  id: number;
  name: string;
  subjects: Subject[];
  students: Student[];
}

@Component({
  selector: 'app-exam-marks-distribution',
  templateUrl: './exam-marks-distribution.component.html',
  styleUrls: ['./exam-marks-distribution.component.scss'],
})
export class ExamMarksDistributionComponent implements OnInit {
  private baseUrl = MainURL.HostURL
  tests: Test[] = [];
  currentTest: Test | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  selectedStudentIds: Set<number> = new Set();
  isAllSelected: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const testId = Number(params.get('testId')); // Get testId from route params
      if (testId) {
        this.loadTestById(testId);
      }
    });
    // this.loadAvailableTests();
  }

  loadTestById(testId: number) {
    this.selectedStudentIds.clear();
    this.isAllSelected = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.http
      .get<Test[]>(`${this.baseUrl}api/test/getOfflineTestById/${testId}`)
      .subscribe({
        next: (testData) => {
          this.currentTest = testData[0];
          console.log('Loaded Test:', this.currentTest);
        },
        error: (err) => {
          this.errorMessage = 'Failed to load test details';
          this.currentTest = null;
          console.error('Failed to load test details', err);
        },
      });
  }

  onTestSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const testId = parseInt(selectElement.value);

    if (testId) {
      this.loadTestById(testId);
    } else {
      this.currentTest = null;
    }
  }

  // loadTestById(testId: number) {
  //   this.selectedStudentIds.clear();
  //   this.isAllSelected = false;
  //   this.errorMessage = '';
  //   this.successMessage = '';

  //   this.http.get<Test[]>(`${this.baseUrl}api/test/getOfflineTestById/${testId}`).subscribe({
  //     next: (testData) => {
  //       this.currentTest = testData[0];
  //       console.log('Loaded Test:', this.currentTest);
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Failed to load test details';
  //       this.currentTest = null;
  //       console.error('Failed to load test details', err);
  //     }
  //   });
  // }

  // Student selection methods
  toggleStudentSelection(studentId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedStudentIds.add(studentId);
    } else {
      this.selectedStudentIds.delete(studentId);
    }
    this.updateSelectAllState();
  }

  toggleAllStudents(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.selectedStudentIds.clear();

    if (checkbox.checked && this.currentTest) {
      this.currentTest.students.forEach(student =>
        this.selectedStudentIds.add(student.id)
      );
    }

    this.isAllSelected = checkbox.checked;
  }

  isStudentSelected(studentId: number): boolean {
    return this.selectedStudentIds.has(studentId);
  }

  private updateSelectAllState() {
    if (!this.currentTest) return;
    this.isAllSelected = this.selectedStudentIds.size === this.currentTest.students.length;
  }

  // Grade management methods
  getStudentGrade(student: Student, subjectId: number): number | null {
    const grade = student.grades.find(g => g.subjectId === subjectId);
    return grade ? grade.value : null;
  }

  updateStudentGrade(student: Student, subjectId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseFloat(input.value) : null;

    if (value !== null && (value < 0 || value > 100)) {
      alert('Grade must be between 0 and 100');
      return;
    }

    const gradeIndex = student.grades.findIndex(g => g.subjectId === subjectId);
    if (gradeIndex !== -1) {
      student.grades[gradeIndex].value = value;
    }
  }

  // Submission logic
  get canSubmitGrades(): boolean {
    return this.currentTest !== null && this.selectedStudentIds.size > 0;
  }

  submitGrades() {
    if (!this.currentTest) return;

    // Prepare grades for selected students
    const gradesForSubmission: GradeSubmission[] =
      this.currentTest.students
        .filter(student => this.selectedStudentIds.has(student.id))
        .map(student => ({
          testId: this.currentTest!.id,
          studentId: student.id,
          grades: this.transformGradesForSubmission(student.grades)
        }));

    console.log({ gradesForSubmission });

    // Actual submission to API
    this.http.post(`${this.baseUrl}api/test/saveOfflineTest`, gradesForSubmission).subscribe({
      next: (response) => {
        this.successMessage = `Successfully submitted grades for ${gradesForSubmission.length} students`;
        this.errorMessage = '';
        console.log('Grades submission response:', response);

        // Clear selection after successful submission
        this.selectedStudentIds.clear();
        this.isAllSelected = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit grades';
        this.successMessage = '';
        console.error('Grades submission error:', err);
      }
    });
  }

  private transformGradesForSubmission(grades: Grade[]): { [key: string]: number } {
    return grades.reduce((acc, grade) => {
      acc[grade.subjectId.toString()] = grade.value ?? 0;
      return acc;
    }, {} as { [key: string]: number });
  }
}
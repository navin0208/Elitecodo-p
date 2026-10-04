// services/marks-calculation.service.ts
import { Injectable } from '@angular/core';
import { ExamMarks } from 'src/app/teacher-panel/teacher-panel-master/exam-marks-distribution/exam-marks-distribution.component';

@Injectable({
  providedIn: 'root'
})
export class MarksCalculationService {
  // Calculate total marks for an exam
  calculateTotalMarks(examMarks: ExamMarks): number {
    return Object.values(examMarks.subjects).reduce((total, subject) => {
      return total + subject.marks;
    }, 0);
  }

  // Calculate percentage for an exam
  calculatePercentage(examMarks: ExamMarks): number {
    const totalMarks = this.calculateTotalMarks(examMarks);
    const totalMaxMarks = Object.values(examMarks.subjects).reduce((total, subject) => {
      return total + subject.maxMarks;
    }, 0);

    return totalMaxMarks > 0
      ? parseFloat(((totalMarks / totalMaxMarks) * 100).toFixed(2))
      : 0;
  }

  // Validate marks entry
  validateMarksEntry(examMarks: ExamMarks): boolean {
    return Object.values(examMarks.subjects).every(subject =>
      subject.marks >= 0 && subject.marks <= subject.maxMarks
    );
  }

  // Grade calculation based on percentage
  calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }
}
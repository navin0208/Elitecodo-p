// exam.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MainURL } from 'src/app/ConfigUrl/config';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = MainURL.HostURL;

  constructor(private http: HttpClient) { }

  // Get question counts by exam
  getQuestionCountByExam(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}reports/exams-report`)
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Error fetching exam question counts:', error);
          return of([]); // Return empty array instead of mock data
        })
      );
  }

  // Get question counts by subject (optionally filtered by exam)
  getQuestionCountBySubject(examId?: string): Observable<any[]> {
    let url = `${this.apiUrl}reports/subjects`;
    if (examId) {
      url += `?examId=${examId}`;
    }

    return this.http.get<any>(url)
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Error fetching subject question counts:', error);
          return of([]); // Return empty array instead of mock data
        })
      );
  }

  // Get question counts by chapter (optionally filtered by subject)
  getQuestionCountByChapter(subjectId?: string): Observable<any[]> {
    let url = `${this.apiUrl}reports/chapters`;
    if (subjectId) {
      url += `?subjectId=${subjectId}`;
    }

    return this.http.get<any>(url)
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Error fetching chapter question counts:', error);
          return of([]); // Return empty array instead of mock data
        })
      );
  }

  // Optional: You can keep these mock methods but mark them as deprecated
  // or remove them completely if not needed for testing
  private getMockExamData(): any[] {
    console.warn('Using mock exam data - only for development purposes');
    return [];
  }

  private getMockSubjectData(): any[] {
    console.warn('Using mock subject data - only for development purposes');
    return [];
  }

  private getMockChapterData(): any[] {
    console.warn('Using mock chapter data - only for development purposes');
    return [];
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MainURL } from 'src/app/ConfigUrl/config';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = MainURL.HostURL;

  constructor(private http: HttpClient) { }

  // Teacher reports
  getAllTeachers(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}reports/teachers/${sessionStorage.getItem('instituteId')}`));
  }

  getTeacherPerformanceData(teacherId: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}reports/teacher/${teacherId}/performance`).toPromise();
  }

  getTeacherTestsData(teacherId: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}reports/teacher/${teacherId}/tests`).toPromise();
  }

  // Test reports
  getAllTests(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}reports/tests`));
  }

  getTestPerformanceData(testId: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}reports/test/${testId}/performance`).toPromise();
  }

  getTestScoreDistribution(testId: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}reports/test/${testId}/score-distribution`).toPromise();
  }

  // Student reports
  getAllStudents(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}reports/students?instituteId=${sessionStorage.getItem('instituteId')}`));
  }

  getStudentProgressData(studentId: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}reports/student/${studentId}/progress`).toPromise();
  }

  getStudentSubjectData(studentId: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}reports/student/${studentId}/subjects`).toPromise();
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { } from '@angular/core';
import { Router } from '@angular/router';
import { MainURL } from 'src/app/ConfigUrl/config';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import {
  standardwiseentranceexam,
  standardwisesubject,
} from 'src/app/shared/allURL';

interface LogoutRoleWiseRequest {
  id: number;
  userRole: string;
}

@Injectable({
  providedIn: 'root',
})


export class HttpmethodsService {
  router = inject(Router);
  metaTitle = inject(Title);

  constructor(private http: HttpClient) { }

  token: any;
  baseUrl = MainURL.HostURL;
  backgroundColorVar: any;

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  postRequest(url: string, body: any) {
    return this.http.post(this.baseUrl + url, body);
  }

  getRequest(url: string) {
    return this.http.get(this.baseUrl + url);
  }

  putRequest(url: string, body: any) {
    return this.http.put(this.baseUrl + url, body);
  }

  deleteRequest(url: string, id: any) {
    return this.http.delete(this.baseUrl + url + '/' + id);
  }
  deleteRequest1(url: string) {
    return this.http.delete(this.baseUrl + url);
  }

  public fileUpload(url: string, formData: File) {
    const uploadfile: FormData = new FormData();
    uploadfile.append('uploadfile', formData);
    return this.http.post(this.baseUrl + url, uploadfile);
  }

  public PageTitle(title: string) {
    return this.metaTitle.setTitle(title);
  }

  getBackgroundColor() {
    return localStorage.getItem('backgroundColor');
  }

  getSubjectsByStandardId(standardId: number): Observable<any> {
    return this.http.get<any>(`${standardwisesubject}${standardId}`);
  }

  getExamsByStandardId(standardId: number): Observable<any> {
    return this.http.get<any>(`${standardwiseentranceexam}${standardId}`);
  }

  // Fetch active entrance exams
  getActiveExams(): Observable<any> {
    return this.http.get(this.baseUrl + 'api/entranceexam/activeentranceexam');
  }

  // Fetch standards by entrance exam
  getStandardsByEntranceExam(entranceExamId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}api/entranceexam/entranceexamwisestandard/${entranceExamId}`
    );
  }

  // Fetch subjects by standard
  getSubjectsByStandard(standardId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}api/subject/standardwisesubject/${standardId}`
    );
  }

  getUserRole(): string {
    // Retrieve user role from local storage or token
    return localStorage.getItem('userRole') || '';
  }

  logout(): any {
    localStorage.removeItem('userRole');
    this.router.navigate(['/']); // Redirect to login page
  }

  getPendingUsers(role: string): Observable<any> {
    const endpoints: { [key: string]: string } = {
      teacher: `${this.baseUrl}/pendingteacherlist`,
      student: `${this.baseUrl}/pendingstudentlist`,
      parent: `${this.baseUrl}/pendingparentlist`,
      admin: `${this.baseUrl}/pendingadminlist`,
    };

    const endpoint = endpoints[role.toLowerCase()];
    if (!endpoint) {
      throw new Error(`No API endpoint found for role: ${role}`);
    }

    return this.http.get(endpoint);
  }

  // ⬇️ New method for handling Blob responses (PDFs, files)
  postBlobRequest(url: string, body: any): Observable<Blob> {
    return this.http.post(this.baseUrl + url, body, { responseType: 'blob' });
  }

  logoutRoleWise(id: Number, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}api/auth/logout/${id}`, body);
  }


}

import { Injectable } from '@angular/core';
import { HttpmethodsService } from '../httpMethodService/httpmethods.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

   private apiUrl = 'your-backend-api-url'; // Replace with actual backend URL

  constructor(private http: HttpClient) {}

  uploadFormula(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-formula`, data);
  }

  uploadChapterNotes(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-chapter-notes`, data);
  }

  uploadTopicNotes(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-topic-notes`, data);
  }

  uploadChapterSummary(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-chapter-summary`, data);
  }

  uploadTopicSummary(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-topic-summary`, data);
  }

  uploadVideoContent(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-video`, data);
  }

  uploadSchedule(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-schedule`, data);
  }
}
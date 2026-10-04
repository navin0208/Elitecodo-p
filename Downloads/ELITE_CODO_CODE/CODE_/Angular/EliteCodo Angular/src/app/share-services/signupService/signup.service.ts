import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpmethodsService } from '../httpMethodService/httpmethods.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(private http: HttpmethodsService) {}

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Observable with registration response
   */
  register(userData: any): Observable<any> {
    return this.http.postRequest('api/auth/signup', userData);
  }

  /**
   * Activate user after successful payment
   * @param userId - The user ID to activate
   * @returns Observable with activation status
   */
  activateUser(userId: string | null): Observable<any> {
    return this.http.postRequest(`api/auth/activate/${userId}`, {});
  }

  /**
   * Check if email is already registered
   * @param email - Email to check
   * @returns Observable with response
   */
  checkEmailExists(email: string): Observable<any> {
    return this.http.getRequest(`api/auth/check-email?email=${email}`);
  }
}
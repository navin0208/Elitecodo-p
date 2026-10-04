import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpmethodsService } from '../httpMethodService/httpmethods.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpmethodsService) {}

  /**
   * Create Razorpay payment order
   * Expected Response: { orderId, keyId, amount, currency }
   */
  createOrder(paymentData: any): Observable<any> {
    return this.http.postRequest('api/payment/create-order', paymentData);
  }

  /**
   * Verify payment after Razorpay success
   */
  verifyPayment(verificationData: any): Observable<any> {
    return this.http.postRequest('api/payment/verify', verificationData);
  }

  /**
   * Get payment status
   */
  getPaymentStatus(orderId: string): Observable<any> {
    return this.http.getRequest(`api/payment/status/${orderId}`);
  }
}
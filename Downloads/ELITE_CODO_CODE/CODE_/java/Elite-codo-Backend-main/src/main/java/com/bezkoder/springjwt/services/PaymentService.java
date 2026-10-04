package com.bezkoder.springjwt.services;

import com.bezkoder.springjwt.payload.request.CreateOrderRequest;
import com.bezkoder.springjwt.payload.request.VerifyPaymentRequest;
import org.springframework.http.ResponseEntity;

public interface PaymentService {

    ResponseEntity<?> createOrder(CreateOrderRequest request);

    ResponseEntity<?> verifyPayment(VerifyPaymentRequest request);
}
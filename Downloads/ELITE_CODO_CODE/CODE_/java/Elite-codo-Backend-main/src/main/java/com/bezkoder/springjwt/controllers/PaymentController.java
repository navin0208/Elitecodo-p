package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.payload.request.CreateOrderRequest;
import com.bezkoder.springjwt.payload.request.VerifyPaymentRequest;
import com.bezkoder.springjwt.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    private static final Logger logger =
            LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    /**
     * Create Razorpay order.
     *
     * Payment flow:
     * 1. User fills registration form
     * 2. Razorpay order is created
     * 3. User completes payment
     * 4. Signup happens after successful payment
     *
     * IMPORTANT:
     * Do NOT require an existing user/subscription here.
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest request) {

        try {
            logger.info("========== CREATE PAYMENT ORDER ==========");
            logger.info("Plan Id : {}", request.getPlanId());
            logger.info("Plan Name : {}", request.getPlanName());
            logger.info("Amount : {}", request.getAmount());
            logger.info("Email : {}", request.getEmail());
            logger.info("Phone : {}", request.getPhone());

            // Do NOT validate subscription here.
            // User/subscription may not exist yet because
            // registration happens after payment.
            return paymentService.createOrder(request);

        } catch (Exception e) {

            logger.error("Error while creating Razorpay order", e);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to create payment order.");
        }
    }

    /**
     * Verify Razorpay payment after successful payment.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody VerifyPaymentRequest request) {

        try {
            logger.info("========== VERIFY PAYMENT ==========");
            logger.info("Payment Id : {}", request.getPaymentId());
            logger.info("Order Id : {}", request.getOrderId());

            return paymentService.verifyPayment(request);

        } catch (Exception e) {

            logger.error("Error while verifying Razorpay payment", e);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to verify payment.");
        }
    }
}
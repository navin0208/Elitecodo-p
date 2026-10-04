package com.bezkoder.springjwt.services.impl;

import com.bezkoder.springjwt.payload.request.CreateOrderRequest;
import com.bezkoder.springjwt.payload.request.VerifyPaymentRequest;
import com.bezkoder.springjwt.payload.response.CreateOrderResponse;
import com.bezkoder.springjwt.payload.response.VerifyPaymentResponse;
import com.bezkoder.springjwt.services.PaymentService;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger =
            LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


    // ============================================================
    // CREATE RAZORPAY ORDER
    // ============================================================
    //
    // NEW PAYMENT FLOW:
    //
    // 1. User fills registration form
    // 2. Create Razorpay order
    // 3. User completes payment
    // 4. Payment is verified
    // 5. Signup API is called
    // 6. User + Subscription are created
    //
    // IMPORTANT:
    // There must NOT be any subscription lookup here.
    // There may NOT be a user yet.
    // ============================================================

    @Override
    @Transactional
    public ResponseEntity<?> createOrder(
            CreateOrderRequest request) {

        try {

            logger.info("==================================================");
            logger.info("========== CREATE PAYMENT ORDER ==========");
            logger.info("==================================================");

            logger.info(
                    "User Id : {}",
                    request.getUserId()
            );

            logger.info(
                    "Amount : {}",
                    request.getAmount()
            );

            logger.info(
                    "Plan Id : {}",
                    request.getPlanId()
            );

            logger.info(
                    "Plan Name : {}",
                    request.getPlanName()
            );

            logger.info(
                    "Email : {}",
                    request.getEmail()
            );

            logger.info(
                    "Phone : {}",
                    request.getPhone()
            );


            // ========================================================
            // BASIC VALIDATION
            // ========================================================

            if (request.getAmount() == null
                    || request.getAmount() <= 0) {

                logger.warn(
                        "Invalid payment amount: {}",
                        request.getAmount()
                );

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Payment amount must be greater than zero."
                        );
            }


            // ========================================================
            // CREATE RAZORPAY ORDER REQUEST
            // ========================================================

            JSONObject orderRequest =
                    new JSONObject();

            /*
             * Razorpay expects amount in paise.
             *
             * Example:
             * ₹6600 = 660000 paise
             */

            int amountInPaise =
                    (int) Math.round(
                            request.getAmount() * 100
                    );

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    "INR"
            );


            // ========================================================
            // RECEIPT
            // ========================================================
            //
            // userId can be NULL because registration happens
            // AFTER payment.
            //
            // Therefore, do NOT create:
            //
            // "receipt_" + request.getUserId()
            //
            // because that would become "receipt_null".
            //
            // Use a unique timestamp-based receipt instead.
            // ========================================================

            String receipt =
                    "receipt_"
                            + System.currentTimeMillis();

            orderRequest.put(
                    "receipt",
                    receipt
            );


            // ========================================================
            // CREATE ORDER IN RAZORPAY
            // ========================================================

            Order order =
                    razorpayClient.Orders.create(
                            orderRequest
                    );

            String orderId =
                    order.get("id");


            logger.info(
                    "Razorpay Order Created : {}",
                    orderId
            );


            // ========================================================
            // IMPORTANT
            // ========================================================
            //
            // DO NOT:
            //
            // subscriptionMasterRepository
            //         .findByUserId(...)
            //
            // DO NOT:
            //
            // subscription.setOrderId(...)
            //
            // DO NOT:
            //
            // subscriptionMasterRepository.save(...)
            //
            // Because the user/subscription does not exist yet.
            // ========================================================


            // ========================================================
            // RESPONSE
            // ========================================================

            CreateOrderResponse response =
                    new CreateOrderResponse();

            response.setOrderId(
                    orderId
            );

            response.setKeyId(
                    razorpayKeyId
            );

            response.setAmount(
                    request.getAmount()
            );

            response.setCurrency(
                    "INR"
            );


            logger.info(
                    "Payment order response prepared successfully."
            );

            logger.info(
                    "Order ID : {}",
                    orderId
            );

            logger.info(
                    "Amount : {}",
                    request.getAmount()
            );

            logger.info(
                    "Currency : INR"
            );

            logger.info("==================================================");


            return ResponseEntity.ok(
                    response
            );


        } catch (Exception e) {

            logger.error(
                    "=================================================="
            );

            logger.error(
                    "ERROR WHILE CREATING RAZORPAY ORDER",
                    e
            );

            logger.error(
                    "=================================================="
            );

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to create payment order."
                    );
        }
    }


    // ============================================================
    // VERIFY PAYMENT
    // ============================================================
    //
    // NEW FLOW:
    //
    // Payment verification happens BEFORE signup.
    //
    // Therefore:
    //
    // - User may not exist
    // - Subscription may not exist
    //
    // So this method ONLY verifies the Razorpay signature.
    //
    // After this succeeds, frontend sends:
    //
    // paymentId
    // paymentStatus = Completed
    //
    // to /api/auth/signup.
    // ============================================================

    @Override
    @Transactional
    public ResponseEntity<?> verifyPayment(
            VerifyPaymentRequest request) {

        try {

            logger.info("==================================================");
            logger.info("========== VERIFY PAYMENT ==========");
            logger.info("==================================================");

            logger.info(
                    "Order Id : {}",
                    request.getOrderId()
            );

            logger.info(
                    "Payment Id : {}",
                    request.getPaymentId()
            );

            logger.info(
                    "User Id : {}",
                    request.getUserId()
            );


            // ========================================================
            // VALIDATE REQUEST
            // ========================================================

            if (request.getOrderId() == null
                    || request.getOrderId()
                    .trim()
                    .isEmpty()) {

                logger.warn(
                        "Order ID is missing."
                );

                return ResponseEntity.ok(
                        new VerifyPaymentResponse(
                                false,
                                "Order ID is required.",
                                HttpStatus.BAD_REQUEST.value()
                        )
                );
            }


            if (request.getPaymentId() == null
                    || request.getPaymentId()
                    .trim()
                    .isEmpty()) {

                logger.warn(
                        "Payment ID is missing."
                );

                return ResponseEntity.ok(
                        new VerifyPaymentResponse(
                                false,
                                "Payment ID is required.",
                                HttpStatus.BAD_REQUEST.value()
                        )
                );
            }


            if (request.getSignature() == null
                    || request.getSignature()
                    .trim()
                    .isEmpty()) {

                logger.warn(
                        "Payment signature is missing."
                );

                return ResponseEntity.ok(
                        new VerifyPaymentResponse(
                                false,
                                "Payment signature is required.",
                                HttpStatus.BAD_REQUEST.value()
                        )
                );
            }


            // ========================================================
            // GENERATE RAZORPAY SIGNATURE
            // ========================================================

            String payload =
                    request.getOrderId()
                            + "|"
                            + request.getPaymentId();


            String generatedSignature =
                    hmacSHA256(
                            payload,
                            razorpayKeySecret
                    );


            // ========================================================
            // VERIFY SIGNATURE
            // ========================================================

            if (!generatedSignature.equals(
                    request.getSignature())) {

                logger.error(
                        "Payment signature verification failed."
                );

                return ResponseEntity.ok(
                        new VerifyPaymentResponse(
                                false,
                                "Payment verification failed.",
                                HttpStatus.BAD_REQUEST.value()
                        )
                );
            }


            logger.info(
                    "Payment signature verified successfully."
            );


            // ========================================================
            // IMPORTANT
            // ========================================================
            //
            // DO NOT FIND USER HERE.
            //
            // DO NOT FIND SUBSCRIPTION HERE.
            //
            // Registration happens AFTER payment.
            //
            // The frontend will now use:
            //
            // paymentId
            // paymentStatus = Completed
            //
            // in the signup request.
            // ========================================================


            logger.info(
                    "Payment verification successful."
            );

            logger.info(
                    "Payment ID : {}",
                    request.getPaymentId()
            );

            logger.info(
                    "Order ID : {}",
                    request.getOrderId()
            );


            // ========================================================
            // SUCCESS RESPONSE
            // ========================================================

            return ResponseEntity.ok(
                    new VerifyPaymentResponse(
                            true,
                            "Payment verified successfully.",
                            HttpStatus.OK.value()
                    )
            );


        } catch (Exception e) {

            logger.error(
                    "=================================================="
            );

            logger.error(
                    "ERROR WHILE VERIFYING PAYMENT",
                    e
            );

            logger.error(
                    "=================================================="
            );

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new VerifyPaymentResponse(
                                    false,
                                    "Payment verification failed.",
                                    HttpStatus.INTERNAL_SERVER_ERROR.value()
                            )
                    );
        }
    }


    // ============================================================
    // HMAC SHA256
    // ============================================================

    private String hmacSHA256(
            String data,
            String secret) throws Exception {

        Mac sha256Hmac =
                Mac.getInstance(
                        "HmacSHA256"
                );

        SecretKeySpec secretKey =
                new SecretKeySpec(
                        secret.getBytes(
                                StandardCharsets.UTF_8
                        ),
                        "HmacSHA256"
                );

        sha256Hmac.init(
                secretKey
        );

        byte[] hash =
                sha256Hmac.doFinal(
                        data.getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        StringBuilder hexString =
                new StringBuilder();

        for (byte b : hash) {

            hexString.append(
                    String.format(
                            "%02x",
                            b
                    )
            );
        }

        return hexString.toString();
    }
}
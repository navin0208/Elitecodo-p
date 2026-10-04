import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SignupService } from 'src/app/share-services/signupService/signup.service';
import { PaymentService } from 'src/app/share-services/paymentService/payment.service';
import { SubscriptionService } from 'src/app/share-services/subscriptionService/subscription.service';
import { SubscriptionPlan, PlanCustomization } from 'src/app/shared/AllModel';
import { NotificationService } from 'src/app/share-services/NotificationService/notification.service';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { create_Institution } from 'src/app/shared/allURL';
import { CanComponentDeactivate } from 'src/app/share-services/guards/can-component-deactivate';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, CanComponentDeactivate {
  signupForm!: FormGroup;
  isLoading = false;
  isPaymentProcessing = false;
  selectedPlan: SubscriptionPlan | null = null;
  customization: PlanCustomization | null = null;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string = '';
  userId: string | null = null;
  paymentOrderId: string | null = null;
  paymentId: string | null = null;

  // UI States
  currentStep: 'plan-customization' | 'signup-details' | 'subscription-summary' | 'payment' | 'payment-success' | 'payment-failed' = 'plan-customization';

  // Plan
  plan: SubscriptionPlan | null = null;
  currentRole: string = 'institute';

  // Payment success flag
  paymentSuccessMessage: string = '';
  showPaymentSuccess: boolean = false;
  countdown: number = 5;
  countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private signupService: SignupService,
    private paymentService: PaymentService,
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
    private http: HttpmethodsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const planId = params['plan'] || params['role'];
      if (planId) {
        const plan = this.subscriptionService.getPlanById(planId);
        if (plan) {
          this.plan = plan;
          this.selectedPlan = plan;
          this.currentRole = plan.role;
          this.initForm();
          if (plan.role === 'institute') {
            this.customization = this.subscriptionService.calculatePlanCustomization(plan.id, 10, 10);
          } else if (plan.role === 'teacher') {
            this.customization = this.subscriptionService.calculatePlanCustomization(plan.id, 0, 10);
          } else {
            this.customization = this.subscriptionService.calculatePlanCustomization(plan.id, 0, 0);
          }
        }
      } else {
        this.loadPlan();
      }
    });
  }

  initForm(): void {
    const isInstitute = this.currentRole === 'institute';
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      instituteName: ['', isInstitute ? [Validators.required] : []],
      address: ['', isInstitute ? [Validators.required] : []],
      terms: [false, [Validators.requiredTrue]]
    }, { validator: this.passwordMatchValidator });
  }

  loadPlan(): void {
    const plan = this.subscriptionService.getPlanById('institution');
    if (plan) {
      this.plan = plan;
      this.selectedPlan = plan;
      this.currentRole = 'institute';
      this.initForm();
      this.customization = this.subscriptionService.calculatePlanCustomization('institution', 10, 10);
    } else {
      this.notificationService.showError('Plan not found. Please try again.', 'Error');
      this.router.navigate(['/auth/pricing']);
    }
  }

  passwordMatchValidator(form: FormGroup): any {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { mismatch: true };
  }

  get f(): any {
    return this.signupForm.controls;
  }

  onCustomizationChange(customization: PlanCustomization): void {
    this.customization = customization;
  }

  onCustomizationBack(): void {
    if (this.currentRole === 'teacher') {
      this.router.navigate(['/auth/teacher-pricing']);
    } else {
      this.router.navigate(['/auth/institution-pricing']);
    }
  }

  onCustomizationProceed(customization: PlanCustomization): void {
    this.customization = customization;
    this.currentStep = 'signup-details';
  }

  onSummaryBack(): void {
    this.currentStep = 'signup-details';
  }

  onSummaryConfirm(): void {
    this.currentStep = 'payment';
    this.initiatePayment();
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      this.notificationService.showError('Please fill all required fields correctly.', 'Validation Error');
      return;
    }
    this.currentStep = 'subscription-summary';
  }

  async initiatePayment(): Promise<void> {
    this.isPaymentProcessing = true;

    const isRazorpayLoaded = await this.loadRazorpayScript();
    if (!isRazorpayLoaded) {
      this.isPaymentProcessing = false;
      this.notificationService.showError('Payment gateway failed to load. Please try again.', 'Error');
      return;
    }

    const paymentData = {
      amount: this.customization?.totalPrice || 0,
      planId: this.selectedPlan?.id || '',
      planName: this.selectedPlan?.name || '',
      email: this.signupForm.value.email,
      phone: this.signupForm.value.mobile,
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      maxTeachers: this.customization?.totalTeachers || 0,
      maxStudents: this.customization?.totalStudents || 0,
      durationInMonths: this.customization?.durationInMonths || 1,
      role: this.currentRole
    };

    this.paymentService.createOrder(paymentData).subscribe({
      next: (orderResponse: any) => {
        if (orderResponse && orderResponse.orderId && orderResponse.keyId) {
          this.paymentOrderId = orderResponse.orderId;
          this.openRazorpayCheckout(orderResponse);
        } else {
          this.isPaymentProcessing = false;
          this.notificationService.showError('Invalid payment response from server.', 'Error');
        }
      },
      error: (error) => {
        this.isPaymentProcessing = false;
        this.errorMessage = 'Failed to initiate payment. Please try again.';
        this.notificationService.showError(this.errorMessage, 'Payment Error');
      }
    });
  }

  /**
   * ✅ Load Razorpay script dynamically
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (typeof Razorpay !== 'undefined') {
        resolve(true);
        return;
      }

      // Check if the global loadRazorpayScript function exists (from index.html)
      const loadScript = (window as any).loadRazorpayScript;
      if (typeof loadScript === 'function') {
        loadScript()
          .then(() => resolve(true))
          .catch(() => resolve(false));
        return;
      }

      // Fallback: Load script directly
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  openRazorpayCheckout(orderData: any): void {
    if (typeof Razorpay === 'undefined') {
      this.isPaymentProcessing = false;
      this.notificationService.showError('Payment gateway not loaded. Please refresh and try again.', 'Error');
      return;
    }

    if (!orderData.orderId || !orderData.keyId) {
      this.isPaymentProcessing = false;
      this.notificationService.showError('Invalid payment configuration. Please try again.', 'Error');
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Elite Codo',
      description: `${this.selectedPlan?.name} Plan Subscription`,
      order_id: orderData.orderId,
      prefill: {
        name: `${this.signupForm.value.firstName} ${this.signupForm.value.lastName}`.trim(),
        email: this.signupForm.value.email,
        contact: this.signupForm.value.mobile
      },
      notes: {
        planId: this.selectedPlan?.id || '',
        maxTeachers: this.customization?.totalTeachers || 0,
        maxStudents: this.customization?.totalStudents || 0,
        role: this.currentRole,
        durationInMonths: this.customization?.durationInMonths || 1
      },
      theme: {
        color: this.selectedPlan?.color || '#8b5cf6'
      },
      modal: {
        ondismiss: () => {
          this.isPaymentProcessing = false;
          this.handlePaymentFailure('Payment cancelled by user.');
        }
      },
      handler: (response: any) => {
        this.paymentId = response.razorpay_payment_id;
        this.verifyPayment(response);
      }
    };

    try {
      const razorpay = new Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      this.isPaymentProcessing = false;
      this.notificationService.showError('Failed to open payment gateway. Please try again.', 'Error');
    }
  }

  verifyPayment(paymentResponse: any): void {
    this.isPaymentProcessing = true;

    const verificationData = {
      orderId: paymentResponse.razorpay_order_id,
      paymentId: paymentResponse.razorpay_payment_id,
      signature: paymentResponse.razorpay_signature
    };

    this.paymentService.verifyPayment(verificationData).subscribe({
      next: (response: any) => {
        this.isPaymentProcessing = false;
        if (response && response.flag === true) {
          this.registerUserAfterPayment();
        } else {
          this.handlePaymentFailure('Payment verification failed. Please try again.');
        }
      },
      error: (error) => {
        this.isPaymentProcessing = false;
        this.handlePaymentFailure('Payment verification failed. Please contact support.');
      }
    });
  }

  registerUserAfterPayment(): void {
    const formData = this.signupForm.value;
    const isInstitute = this.currentRole === 'institute';

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      status: this.currentRole === 'teacher' ? 'Active' : 'Pending',
      role: this.currentRole,
      creatorId: null,
      durationInMonths: this.customization?.durationInMonths || 1,
      photo: null,
      logoImage: null,
      watermarkImage: null,
      paymentId: this.paymentId,
      paymentStatus: 'Completed'
    };

    if (isInstitute) {
      payload.instituteName = formData.instituteName;
      payload.address = formData.address;
      payload.slogan = formData.instituteName;
      payload.teacherKeys = this.customization?.totalTeachers || 10;
      payload.studentKeys = this.customization?.totalStudents || 10;
    } else {
      payload.instituteName = null;
      payload.address = formData.address || 'Not provided';
      payload.slogan = null;
      payload.teacherKeys = 0;
      payload.studentKeys = this.customization?.totalStudents || 10;
    }

    this.http.postRequest(create_Institution, payload).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.userId = response.id;
          this.showPaymentSuccessPopup('Payment Successful! Your account is pending approval.');
        } else {
          this.handlePaymentFailure('Registration failed after payment. Please contact support.');
        }
      },
      error: (error) => {
        this.handlePaymentFailure('Registration failed after payment. Please contact support.');
      }
    });
  }

  handlePaymentFailure(message: string): void {
    this.currentStep = 'payment-failed';
    this.errorMessage = message;
    this.notificationService.showError(message, 'Payment Failed');
    setTimeout(() => {
      this.currentStep = 'subscription-summary';
      this.isPaymentProcessing = false;
    }, 3000);
  }

  showPaymentSuccessPopup(message: string): void {
    this.paymentSuccessMessage = message;
    this.showPaymentSuccess = true;
    this.currentStep = 'payment-success';
    this.countdown = 5;

    this.notificationService.showSuccess(message, 'Payment Successful!');

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.redirectToLogin();
      }
    }, 1000);
  }

  redirectToLogin(): void {
    this.showPaymentSuccess = false;
    const loginRoute = this.currentRole === 'teacher' ? '/auth/Teacher-Login' : '/auth/Institution-Login';
    this.router.navigate([loginRoute], {
      queryParams: {
        registered: true,
        payment: 'success',
        status: this.currentRole === 'teacher' ? 'active' : 'pending',
        role: this.currentRole
      }
    });
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.signupForm.pristine && !this.isPaymentProcessing) {
      return true;
    }

    if (this.isPaymentProcessing) {
      this.notificationService.showWarning('Payment is in progress. Please wait.', 'Processing');
      return false;
    }

    if (this.isLoading) {
      this.notificationService.showWarning('Registration is in progress. Please wait.', 'Processing');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      resolve(confirmLeave);
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    clearInterval(this.countdownInterval);
    this.redirectToLogin();
  }

  retryPayment(): void {
    this.currentStep = 'subscription-summary';
    this.isPaymentProcessing = false;
    this.errorMessage = '';
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 'plan-customization': return 'Customize Your Plan';
      case 'signup-details': return 'Create Your Account';
      case 'subscription-summary': return 'Review & Confirm';
      case 'payment': return 'Processing Payment...';
      case 'payment-success': return 'Payment Successful!';
      case 'payment-failed': return 'Payment Failed';
      default: return 'Sign Up';
    }
  }

  getStepNumber(): number {
    switch (this.currentStep) {
      case 'plan-customization': return 1;
      case 'signup-details': return 2;
      case 'subscription-summary': return 3;
      case 'payment': return 4;
      case 'payment-success': return 5;
      case 'payment-failed': return 4;
      default: return 0;
    }
  }
}
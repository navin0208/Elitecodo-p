import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubscriptionService } from 'src/app/share-services/subscriptionService/subscription.service';
import { SubscriptionPlan, PlanCustomization } from 'src/app/shared/AllModel';

@Component({
  selector: 'app-plan-customizer',
  templateUrl: './plan-customizer.component.html',
  styleUrls: ['./plan-customizer.component.css']
})
export class PlanCustomizerComponent implements OnInit {
  @Input() selectedPlanId: string = '';
  @Input() selectedPlan: SubscriptionPlan | null = null;
  @Output() customizationChange = new EventEmitter<PlanCustomization>();
  @Output() back = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<PlanCustomization>();

  // Institution specific
  selectedTeachers: number = 10;
  selectedStudents: number = 10;
  minTeachers: number = 10;
  minStudents: number = 10;
  teacherPrice: number = 200;
  studentPrice: number = 100;
  
  // Teacher specific
  extraStudents: number = 0;
  maxExtraStudents: number = 50;
  extraStudentPrice: number = 50;
  
  // Duration
  selectedDuration: number = 1;
  availableDurations: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  // Prices
  monthlyPrice: number = 0;
  totalPrice: number = 0;

  // Form for non-institution plans (student/teacher)
  customizationForm!: FormGroup;
  customization: PlanCustomization | null = null;
  maxExtraTeachers: number = 0;
  maxExtraStudentsForForm: number = 0;
  showPriceBreakdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setDefaults();
    this.calculateTotal();
  }

  initForm(): void {
    this.customizationForm = this.fb.group({
      extraTeachers: [0, [Validators.required, Validators.min(0)]],
      extraStudents: [0, [Validators.required, Validators.min(0)]]
    });

    this.customizationForm.valueChanges.subscribe(() => {
      this.calculateCustomization();
    });
  }

  setDefaults(): void {
    if (this.selectedPlan) {
      if (this.selectedPlan.role === 'institute') {
        const min = this.subscriptionService.getMinValues(this.selectedPlan.id);
        this.minTeachers = min.minTeachers;
        this.minStudents = min.minStudents;
        this.selectedTeachers = this.minTeachers;
        this.selectedStudents = this.minStudents;
        this.teacherPrice = this.selectedPlan.teacherPrice || 200;
        this.studentPrice = this.selectedPlan.studentPrice || 100;
        
        this.availableDurations = this.subscriptionService.getAvailableDurations(this.selectedPlan.id);
        this.selectedDuration = this.subscriptionService.getDefaultDuration(this.selectedPlan.id);
      } 
      // NEW: Teacher plan
      else if (this.selectedPlan.role === 'teacher') {
        this.minStudents = this.selectedPlan.defaultStudents || 10;
        this.selectedStudents = this.minStudents;
        this.extraStudentPrice = this.selectedPlan.extraStudentPrice || 50;
        this.maxExtraStudents = this.selectedPlan.maxExtraStudents || 50;
        
        this.availableDurations = this.subscriptionService.getAvailableDurations(this.selectedPlan.id);
        this.selectedDuration = this.subscriptionService.getDefaultDuration(this.selectedPlan.id);
        this.calculateTeacherTotal();
      }
      // Student plan
      else {
        const max = this.subscriptionService.getMaxExtras(this.selectedPlan.id);
        this.maxExtraTeachers = max.maxTeachers;
        this.maxExtraStudentsForForm = max.maxStudents;
        this.availableDurations = this.subscriptionService.getAvailableDurations(this.selectedPlan.id);
        this.selectedDuration = this.subscriptionService.getDefaultDuration(this.selectedPlan.id);
        this.calculateCustomization();
      }
    }
  }

  // Institution methods
  incrementTeachers(): void {
    this.selectedTeachers++;
    this.calculateTotal();
  }

  decrementTeachers(): void {
    if (this.selectedTeachers > this.minTeachers) {
      this.selectedTeachers--;
      this.calculateTotal();
    }
  }

  incrementStudents(): void {
    if (this.selectedPlan?.role === 'institute') {
      this.selectedStudents++;
      this.calculateTotal();
    }
  }

  decrementStudents(): void {
    if (this.selectedPlan?.role === 'institute' && this.selectedStudents > this.minStudents) {
      this.selectedStudents--;
      this.calculateTotal();
    }
  }

  // Teacher methods
  incrementExtraStudents(): void {
    if (this.extraStudents < this.maxExtraStudents) {
      this.extraStudents++;
      this.calculateTeacherTotal();
    }
  }

  decrementExtraStudents(): void {
    if (this.extraStudents > 0) {
      this.extraStudents--;
      this.calculateTeacherTotal();
    }
  }

  calculateTeacherTotal(): void {
    if (!this.selectedPlan || this.selectedPlan.role !== 'teacher') return;

    const baseStudents = this.minStudents;
    const totalStudents = baseStudents + this.extraStudents;
    const monthlyPrice = this.selectedPlan.basePrice || 200;
    const extraCost = this.extraStudents * this.extraStudentPrice;
    this.monthlyPrice = monthlyPrice + extraCost;
    this.totalPrice = this.monthlyPrice * this.selectedDuration;

    this.customization = {
      planId: this.selectedPlan.id,
      role: this.selectedPlan.role,
      selectedTeachers: 0,
      selectedStudents: totalStudents,
      teacherPrice: 0,
      studentPrice: this.extraStudentPrice,
      durationInMonths: this.selectedDuration,
      baseTeachers: 0,
      baseStudents: baseStudents,
      extraTeachers: 0,
      extraStudents: this.extraStudents,
      totalTeachers: 0,
      totalStudents: totalStudents,
      basePrice: monthlyPrice,
      totalPrice: this.totalPrice,
      monthlyPrice: this.monthlyPrice,
      selectedPlan: this.selectedPlan
    };

    this.customizationChange.emit(this.customization);
  }

  onDurationChange(): void {
    if (this.selectedPlan?.role === 'teacher') {
      this.calculateTeacherTotal();
    } else if (this.selectedPlan?.role === 'institute') {
      this.calculateTotal();
    } else {
      this.calculateCustomization();
    }
  }

  // Student/Teacher plans - increment/decrement extra slots
  incrementExtra(type: 'teachers' | 'students'): void {
    const control = type === 'teachers' ? 'extraTeachers' : 'extraStudents';
    const currentValue = this.customizationForm.get(control)?.value || 0;
    const max = type === 'teachers' ? this.maxExtraTeachers : this.maxExtraStudentsForForm;
    
    if (currentValue < max) {
      this.customizationForm.patchValue({ [control]: currentValue + 1 });
    }
  }

  decrementExtra(type: 'teachers' | 'students'): void {
    const control = type === 'teachers' ? 'extraTeachers' : 'extraStudents';
    const currentValue = this.customizationForm.get(control)?.value || 0;
    
    if (currentValue > 0) {
      this.customizationForm.patchValue({ [control]: currentValue - 1 });
    }
  }

  calculateTotal(): void {
    if (!this.selectedPlan || this.selectedPlan.role !== 'institute') return;

    const teachers = this.selectedTeachers;
    const students = this.selectedStudents;
    const teacherPrice = this.teacherPrice;
    const studentPrice = this.studentPrice;
    const duration = this.selectedDuration;

    this.monthlyPrice = (teachers * teacherPrice) + (students * studentPrice);
    this.totalPrice = this.monthlyPrice * duration;

    this.customization = {
      planId: this.selectedPlan.id,
      role: this.selectedPlan.role,
      selectedTeachers: teachers,
      selectedStudents: students,
      teacherPrice: teacherPrice,
      studentPrice: studentPrice,
      durationInMonths: duration,
      baseTeachers: 0,
      baseStudents: 0,
      extraTeachers: 0,
      extraStudents: 0,
      totalTeachers: teachers,
      totalStudents: students,
      basePrice: 0,
      totalPrice: this.totalPrice,
      monthlyPrice: this.monthlyPrice,
      selectedPlan: this.selectedPlan
    };

    this.customizationChange.emit(this.customization);
  }

  calculateCustomization(): void {
    if (!this.selectedPlan || this.selectedPlan.role === 'institute' || this.selectedPlan.role === 'teacher') return;

    const extras = this.customizationForm.value;
    this.customization = this.subscriptionService.calculatePlanCustomization(
      this.selectedPlan.id,
      extras.extraTeachers || 0,
      extras.extraStudents || 0,
      this.selectedDuration
    );

    if (this.customization) {
      this.customizationChange.emit(this.customization);
    }
  }

  getExtraTeacherPrice(): number {
    if (!this.selectedPlan) return 0;
    const extraTeachers = this.customizationForm.get('extraTeachers')?.value || 0;
    return extraTeachers * (this.selectedPlan.extraTeacherPrice || 0);
  }

  getExtraStudentPrice(): number {
    if (!this.selectedPlan) return 0;
    const extraStudents = this.customizationForm.get('extraStudents')?.value || 0;
    return extraStudents * (this.selectedPlan.extraStudentPrice || 0);
  }

  getTotalPrice(): number {
    if (this.selectedPlan?.role === 'institute' || this.selectedPlan?.role === 'teacher') {
      return this.totalPrice;
    }
    return this.customization?.totalPrice || 0;
  }

  getMonthlyPrice(): number {
    if (this.selectedPlan?.role === 'institute' || this.selectedPlan?.role === 'teacher') {
      return this.monthlyPrice;
    }
    return this.customization?.monthlyPrice || 0;
  }

  getBasePrice(): number {
    return this.selectedPlan?.basePrice || 0;
  }

  canProceed(): boolean {
    if (this.selectedPlan?.role === 'institute') {
      return this.selectedTeachers >= this.minTeachers && 
             this.selectedStudents >= this.minStudents &&
             this.selectedDuration > 0;
    }
    if (this.selectedPlan?.role === 'teacher') {
      return this.selectedDuration > 0;
    }
    return this.customizationForm.valid && this.customization !== null;
  }

  onProceed(): void {
    if (this.canProceed() && this.customization) {
      this.proceed.emit(this.customization);
    }
  }

  onBack(): void {
    this.back.emit();
  }

  togglePriceBreakdown(): void {
    this.showPriceBreakdown = !this.showPriceBreakdown;
  }

  // Getters
  getMaxExtraTeachers(): number {
    return this.maxExtraTeachers;
  }

  getMaxExtraStudents(): number {
    if (this.selectedPlan?.role === 'teacher') {
      return this.maxExtraStudents;
    }
    return this.maxExtraStudentsForForm;
  }

  getPlanName(): string {
    return this.selectedPlan?.name || '';
  }

  getDefaultTeachers(): number {
    if (this.selectedPlan?.role === 'institute') {
      return this.selectedTeachers;
    }
    return this.selectedPlan?.defaultTeachers || 0;
  }

  getDefaultStudents(): number {
    if (this.selectedPlan?.role === 'institute') {
      return this.selectedStudents;
    }
    if (this.selectedPlan?.role === 'teacher') {
      return this.minStudents;
    }
    return this.selectedPlan?.defaultStudents || 0;
  }

  isInstitutePlan(): boolean {
    return this.selectedPlan?.role === 'institute';
  }

  isTeacherPlan(): boolean {
    return this.selectedPlan?.role === 'teacher';
  }

  getTeacherCount(): number {
    return this.selectedTeachers;
  }

  getStudentCount(): number {
    if (this.selectedPlan?.role === 'teacher') {
      return this.minStudents + this.extraStudents;
    }
    return this.selectedStudents;
  }

  getTeacherTotalCost(): number {
    return this.selectedTeachers * this.teacherPrice;
  }

  getStudentTotalCost(): number {
    if (this.selectedPlan?.role === 'teacher') {
      return (this.minStudents + this.extraStudents) * this.extraStudentPrice;
    }
    return this.selectedStudents * this.studentPrice;
  }

  getDurationLabel(months: number): string {
    if (months === 1) return '1 Month';
    if (months === 12) return '12 Months (Annual)';
    return `${months} Months`;
  }

  getTotalAmount(): number {
    return this.totalPrice;
  }

  getExtraStudentCount(): number {
    return this.extraStudents;
  }

  getBaseStudentPrice(): number {
    return this.selectedPlan?.basePrice || 200;
  }
}
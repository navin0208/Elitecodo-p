import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PlanCustomization } from 'src/app/shared/AllModel';

@Component({
  selector: 'app-subscription-summary',
  templateUrl: './subscription-summary.component.html',
  styleUrls: ['./subscription-summary.component.css']
})
export class SubscriptionSummaryComponent implements OnInit {
  @Input() customization: PlanCustomization | null = null;
  @Input() userDetails: any = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  getPlanName(): string {
    return this.customization?.selectedPlan?.name || '';
  }

  getTotalPrice(): number {
    return this.customization?.totalPrice || 0;
  }

  getMonthlyPrice(): number {
    return this.customization?.monthlyPrice || 0;
  }

  getBasePrice(): number {
    return this.customization?.basePrice || 0;
  }

  getDurationInMonths(): number {
    return this.customization?.durationInMonths || 1;
  }

  getExtraTeacherPrice(): number {
    if (this.customization?.role === 'institute') {
      return this.customization?.teacherPrice || 0;
    }
    return (this.customization?.extraTeachers || 0) * (this.customization?.selectedPlan?.extraTeacherPrice || 0);
  }

  getExtraStudentPrice(): number {
    if (this.customization?.role === 'institute') {
      return this.customization?.studentPrice || 0;
    }
    return (this.customization?.extraStudents || 0) * (this.customization?.selectedPlan?.extraStudentPrice || 0);
  }

  getTotalTeachers(): number {
    return this.customization?.totalTeachers || 0;
  }

  getTotalStudents(): number {
    return this.customization?.totalStudents || 0;
  }

  getDefaultTeachers(): number {
    return this.customization?.baseTeachers || 0;
  }

  getDefaultStudents(): number {
    return this.customization?.baseStudents || 0;
  }

  getExtraTeachers(): number {
    return this.customization?.extraTeachers || 0;
  }

  getExtraStudents(): number {
    return this.customization?.extraStudents || 0;
  }

  isInstitutePlan(): boolean {
    return this.customization?.role === 'institute';
  }

  getDurationLabel(): string {
    const months = this.getDurationInMonths();
    if (months === 1) return '1 Month';
    if (months === 12) return '12 Months (Annual)';
    return `${months} Months`;
  }

  // NEW: Get validity period
  getValidityPeriod(): string {
    const months = this.getDurationInMonths();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
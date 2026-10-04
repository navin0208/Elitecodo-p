import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { StudentLoginComponent } from './student-login/student-login.component';
import { SuperAdminLoginComponent } from './super-admin-login/super-admin-login.component';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { InstitutionLoginComponent } from './institution-login/institution-login.component';
import { PricingComponent } from './pricing/pricing.component';
import { SignupComponent } from './signup/signup.component';
import { PlanCustomizerComponent } from './plan-customizer/plan-customizer.component';
import { SubscriptionSummaryComponent } from './subscription-summary/subscription-summary.component';
// ✅ No need to import guard here - it's providedIn: 'root'

@NgModule({
  declarations: [
    AdminLoginComponent,
    TeacherLoginComponent,
    StudentLoginComponent,
    SuperAdminLoginComponent,
    ParentLoginComponent,
    NavbarComponent,
    ForgotPasswordComponent,
    InstitutionLoginComponent,
    PricingComponent,
    SignupComponent,
    PlanCustomizerComponent,
    SubscriptionSummaryComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzCardModule,
    NzStepsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule,
    NzTypographyModule,
  ],
  exports: [
    NavbarComponent
  ]
})
export class AuthModule { }
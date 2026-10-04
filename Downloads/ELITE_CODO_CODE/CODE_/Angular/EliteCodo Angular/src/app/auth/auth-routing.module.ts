import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { StudentLoginComponent } from './student-login/student-login.component';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { SuperAdminLoginComponent } from './super-admin-login/super-admin-login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { InstitutionLoginComponent } from './institution-login/institution-login.component';
import { PricingComponent } from './pricing/pricing.component';
import { SignupComponent } from './signup/signup.component';
import { CanDeactivateGuard } from 'src/app/share-services/guards/can-deactivate.guard';

const routes: Routes = [
  { path: 'Admin-Login', component: AdminLoginComponent },
  { path: 'Teacher-Login', component: TeacherLoginComponent },
  { path: 'Student-Login', component: StudentLoginComponent },
  { path: 'Institution-Login', component: InstitutionLoginComponent },
  { path: 'Super-Admin-Login', component: SuperAdminLoginComponent },
  { path: 'Parent-Login', component: ParentLoginComponent },
  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'teacher-pricing', component: PricingComponent, data: { role: 'teacher' } },
  { path: 'institution-pricing', component: PricingComponent, data: { role: 'institute' } },
  { path: 'pricing', component: PricingComponent },
  { 
    path: 'signup', 
    component: SignupComponent,
    canDeactivate: [CanDeactivateGuard]  // ✅ Apply guard
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
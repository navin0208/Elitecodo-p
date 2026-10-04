import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentManagementComponent } from './student-management/student-management.component';
import { TeacherManagementComponent } from './teacher-management/teacher-management.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { AssignStandardWisedataComponent } from './assign-standard-wisedata/assign-standard-wisedata.component';
import { ReportsComponent } from './reports/reports.component';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';
const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'teacher-management', component: TeacherManagementComponent },
  { path: 'student-management', component: StudentManagementComponent },
  { path: 'parent-management', component: ParentManagementComponent },
  { path: 'Assign-Standard-Wise-data', component: AssignStandardWisedataComponent },
  { path: 'Assign-Standard-Wise-data-to-Student', component: AssignStandardWiseDataToStudentComponent },
  { path: 'reports', component: ReportsComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstitutePageRoutingModule { }

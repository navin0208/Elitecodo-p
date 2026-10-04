import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentHomeComponent } from './student-home/student-home.component';
import { BoardDashboardComponent } from './board-dashboard/board-dashboard.component';
import { CommunicationComponent } from './communication/communication.component';
import { UserFeedbackComponent } from './user-feedback/user-feedback.component';
import { QuestionBankComponent } from './question-bank/question-bank.component';
import { TestsComponent } from './tests/tests.component';
import { TestComponent } from './test/test.component';
import { ExamResultComponent } from './exam-result/exam-result.component';
import { FormulaeComponent } from './formulae/formulae.component';
import { ReportsComponent } from './reports/reports.component';
import { StudyResourcesComponent } from './study-resources/study-resources.component';
import { JoinTestComponent } from './join-test/join-test.component';
import { ExamPortalComponent } from './exam-portal/exam-portal.component';
import { FeedbackManagementComponent } from './feedback-management/feedback-management.component';
import { AfterexamMessageComponent } from './afterexam-message/afterexam-message.component';
import { ExamOverlookComponent } from './exam-overlook/exam-overlook.component';
import { NotificationComponent } from './notification/notification.component';
import { ImportantQuestionsComponent } from './important-questions/important-questions.component';
import { ExamCompletionGuard } from 'src/app/shared/exam-completion.guard';
import { ExamPortalGuard } from 'src/app/shared/exam.guard';
const routes: Routes = [
  { path: 'student_home', component: StudentHomeComponent },
  { path: ':name/dashboard', component: BoardDashboardComponent },
  { path: ':name/communication', component: CommunicationComponent },
  { path: ':name/user-feedback', component: UserFeedbackComponent },
  { path: ':name/question-bank', component: QuestionBankComponent },
  { path: ':name/tests', component: TestsComponent },
  { path: ':name/test', component: TestComponent },
  { path: ':name/study_resources', component: StudyResourcesComponent },
  { path: ':name/exam-marks-distribution', component: ExamResultComponent },
  { path: ':name/Formulae', component: FormulaeComponent },
  { path: ':name/Reports', component: ReportsComponent },
  { path: ':name/join-test', component: JoinTestComponent },
  {
    path: ':name/exam-portal',
    component: ExamPortalComponent,
    canActivate: [ExamPortalGuard]  // Add the guard here
  },
  { path: ':name/exam-completion', component: AfterexamMessageComponent },
  // {
  //   path: ':name/exam-portal',
  //   component: ExamPortalComponent,
  //   canActivate: [ExamPortalGuard],
  //   data: {
  //     requiresExamSession: true
  //   }
  // },
  // {
  //   path: ':name/exam-completion',
  //   component: AfterexamMessageComponent,
  //   canActivate: [ExamCompletionGuard]
  // },
  { path: ':name/student-feedback-managment', component: FeedbackManagementComponent },
  { path: ':name/student-feedback-managment', component: FeedbackManagementComponent },
  { path: ':name/exam-overlook', component: ExamOverlookComponent },
  { path: 'notification', component: NotificationComponent },
  { path: ':name/important-questions', component: ImportantQuestionsComponent },

];
// {
//   path: ':name/exam-portal',
//   component: ExamPortalComponent,
//   canActivate: [ExamPortalGuard],
//   data: {
//     requiresExamSession: true
//   }
// },
// {
//   path: ':name/exam-completion',
//   component: AfterexamMessageComponent,
//   canActivate: [ExamCompletionGuard]
// },
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentPanelMasterRoutingModule { }

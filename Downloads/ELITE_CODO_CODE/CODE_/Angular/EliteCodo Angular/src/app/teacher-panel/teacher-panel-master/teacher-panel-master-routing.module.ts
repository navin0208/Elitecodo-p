import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherHomeComponent } from './teacher-home/teacher-home.component';
import { BoardDashboardComponent } from './board-dashboard/board-dashboard.component';
import { QuestionBankComponent } from './question-bank/question-bank.component';
import { TestsComponent } from './tests/tests.component';
import { TestComponent } from './test/test.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ParentCommunicationComponent } from './parent-communication/parent-communication.component';
import { StudentCommunicationComponent } from './student-communication/student-communication.component';
import { CommunicationComponent } from './communication/communication.component';
import { UserFeedbackComponent } from './user-feedback/user-feedback.component';
import { FeedbackManagemntTeacherComponent } from './feedback-managemnt-teacher/feedback-managemnt-teacher.component';
import { UploadContentComponent } from './upload-content/upload-content.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { ExamMarksDistributionComponent } from './exam-marks-distribution/exam-marks-distribution.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';
import { ContentViewComponent } from './content-view/content-view.component';
import { TestchapterComponent } from './testchapter/testchapter.component';
import { standardMaster } from 'src/app/shared/adminModel';
import { StandardTestComponent } from './standard-test/standard-test.component';
import { TestCreationComponent } from './test-creation/test-creation.component';
import { Page4Component } from './page-4/page-4.component';
import { OverallReportsComponent } from './overall-reports/overall-reports.component';
import { AllExamsComponent } from './all-exams/all-exams.component';
import { AllStudentsComponent } from './all-students/all-students.component';
import { ExamWiseComponent } from './exam-wise/exam-wise.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';
import { StudentWisePerformanceComponent } from './student-wise-performance/student-wise-performance.component';
import { AllOfflineTestComponent } from './all-offline-test/all-offline-test.component';
import { NotificationComponent } from './notification/notification.component';
import { TesttopicComponent } from './testtopic/testtopic.component';

const routes: Routes = [
  { path: 'teacher_home', component: TeacherHomeComponent },
  { path: ':name/dashboard', component: BoardDashboardComponent },

  { path: ':name/add-user', component: AddUserComponent },
  { path: ':name/parent-management', component: ParentManagementComponent },
  { path: ':name/user-feedback', component: UserFeedbackComponent },
  {
    path: ':name/teacher-feedback-managemnt',
    component: FeedbackManagemntTeacherComponent,
  },

  { path: ':name/exam-management', component: ExamManagementComponent },
  {
    path: ':name/offline_test/:testId/assign-marks',
    component: ExamMarksDistributionComponent,
  },

  { path: ':name/question-bank', component: QuestionBankComponent },
  { path: ':name/tests', component: TestsComponent },
  { path: ':name/upload-content', component: UploadContentComponent },
  { path: ':name/test', component: TestComponent },
  { path: ':name/communication', component: CommunicationComponent },
  {
    path: ':name/parent-communication',
    component: ParentCommunicationComponent,
  },
  {
    path: ':name/student-communication',
    component: StudentCommunicationComponent,
  },
  {
    path: ':name/Assign-Standard-Wise-data-to-Student',
    component: AssignStandardWiseDataToStudentComponent,
  },
  {
    path: ':name/view-content',
    component: ContentViewComponent,
  },
  // { path: ':name/student-doubt-clarification', component: StudentDoubtClarificationComponent },
  // { path: ':name/student-chat', component: StudentDoubtClarificationComponent },
  ////test
  { path: ':name/testchapter', component: TestchapterComponent },
  { path: ':name/testtopic', component: TesttopicComponent },
  { path: ':name/standard-test', component: StandardTestComponent },
  { path: ':name/testcreation', component: TestCreationComponent },
  { path: ':name/submit-test', component: Page4Component },

  { path: ':name/Overall-Reports', component: OverallReportsComponent },
  { path: ':name/all-exams', component: AllExamsComponent },
  { path: ':name/all-students', component: AllStudentsComponent },
  { path: ':name/exam-wise', component: ExamWiseComponent },
  { path: ':name/offline_test', component: AllOfflineTestComponent },
  { path: ':name/exam-detailed/:id', component: ExamDetailComponent },
  { 
    path: ':name/student-wise-performance/:id',
    component: StudentWisePerformanceComponent,
  },
    { path: 'notification', component: NotificationComponent },
  
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherPanelMasterRoutingModule { }

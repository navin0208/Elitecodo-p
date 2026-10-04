import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherPanelMasterRoutingModule } from './teacher-panel-master-routing.module';
import { TeacherHomeComponent } from './teacher-home/teacher-home.component';
import { BoardDashboardComponent } from './board-dashboard/board-dashboard.component';
import { QuestionBankComponent } from './question-bank/question-bank.component';
import { TestsComponent } from './tests/tests.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MatButtonModule } from '@angular/material/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { TestComponent } from './test/test.component';
import { AddUserComponent } from './add-user/add-user.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { MatDialogModule } from '@angular/material/dialog';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSliderModule } from 'ng-zorro-antd/slider';
// parent-communication.module.ts
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzUploadModule } from 'ng-zorro-antd/upload';
// Ng-Zorro Imports
import { NzGridModule } from 'ng-zorro-antd/grid';

import { NzIconModule } from 'ng-zorro-antd/icon';

// Zorro Modules
import { NzListModule } from 'ng-zorro-antd/list';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { ParentCommunicationComponent } from './parent-communication/parent-communication.component';
import { StudentCommunicationComponent } from './student-communication/student-communication.component';
import { CommunicationComponent } from './communication/communication.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { StudentChatComponent } from './student-chat/student-chat.component';
import { UserFeedbackComponent } from './user-feedback/user-feedback.component';
import { FeedbackManagemntTeacherComponent } from './feedback-managemnt-teacher/feedback-managemnt-teacher.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { UploadContentComponent } from './upload-content/upload-content.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { ExamMarksDistributionComponent } from './exam-marks-distribution/exam-marks-distribution.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MatCardModule } from '@angular/material/card';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';

import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { MatExpansionModule } from '@angular/material/expansion';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { DropdownModule } from 'primeng/dropdown';
import { ContentViewComponent } from './content-view/content-view.component';
import { TestchapterComponent } from './testchapter/testchapter.component';
import { StandardTestComponent } from './standard-test/standard-test.component';
import { TestCreationComponent } from './test-creation/test-creation.component';
import { Page4Component } from './page-4/page-4.component';
import { OverallReportsComponent } from './overall-reports/overall-reports.component';
import { AllExamsComponent } from './all-exams/all-exams.component';
import { AllStudentsComponent } from './all-students/all-students.component';
import { ExamWiseComponent } from './exam-wise/exam-wise.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';
import { StudentWisePerformanceComponent } from './student-wise-performance/student-wise-performance.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { NotificationComponent } from './notification/notification.component';

import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzProgressStatusType } from 'ng-zorro-antd/progress';

import { PopupFormComponent } from './popup-form/popup-form.component';
import { SafePipe } from './safe.pipe';
import { AllOfflineTestComponent } from './all-offline-test/all-offline-test.component';
import { RoleNotificationComponent } from './role-notification/role-notification.component';
import { TesttopicComponent } from './testtopic/testtopic.component';

@NgModule({
  declarations: [
    TeacherHomeComponent,
    BoardDashboardComponent,
    QuestionBankComponent,
    TestsComponent,
    TestComponent,
    AddUserComponent,
    ParentCommunicationComponent,
    StudentCommunicationComponent,
    CommunicationComponent,
    StudentChatComponent,
    UserFeedbackComponent,
    FeedbackManagemntTeacherComponent,
    UploadContentComponent,
    ExamManagementComponent,
    ExamMarksDistributionComponent,
    ParentManagementComponent,
    AssignStandardWiseDataToStudentComponent,
    ContentViewComponent,
    TestchapterComponent,
    StandardTestComponent,
    TestCreationComponent,
    Page4Component,
    OverallReportsComponent,
    AllExamsComponent,
    AllStudentsComponent,
    ExamWiseComponent,
    ExamDetailComponent,
    StudentWisePerformanceComponent,
    PopupFormComponent,
    SafePipe,
    AllOfflineTestComponent,
    NotificationComponent,
    RoleNotificationComponent,
    TesttopicComponent,
  ],
  imports: [
    CommonModule,
    TeacherPanelMasterRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSpinModule,
    NzSelectModule,
    MatButtonModule,
    NzInputNumberModule,
    NzCardModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzMessageModule,
    NzIconModule,
    NzRadioModule,
    NzListModule,
    NzTableModule,
    NzAvatarModule,
    NzTagModule,
    NzLayoutModule,
    NzMenuModule,
    NzNotificationModule,
    NzUploadModule,
    NzBadgeModule,
    MatDialogModule,
    NzTimePickerModule,
    NzGridModule,
    NzAutocompleteModule,
    NzSliderModule,
    NzTabsModule,
    MatGridListModule,
    MatIconModule,
    NzStatisticModule,
    NzToolTipModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    NzDropDownModule,
    MatPaginatorModule,
    MatInputModule,
    NzAlertModule,
    NzResultModule,
    NzBreadCrumbModule,
    NzDescriptionsModule,
    NzPopconfirmModule,
    NzTypographyModule,
    NzDividerModule,
    NzPageHeaderModule,
    NzProgressModule,
    NzDatePickerModule,
    NzSpaceModule,
    MatExpansionModule,
    NzCheckboxModule,
    NzTimelineModule,
    NzEmptyModule,
    DropdownModule,
    MatSortModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,

    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
})
export class TeacherPanelMasterModule {}

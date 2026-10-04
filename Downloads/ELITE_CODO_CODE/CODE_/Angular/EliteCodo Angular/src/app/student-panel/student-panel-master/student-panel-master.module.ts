import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentPanelMasterRoutingModule } from './student-panel-master-routing.module';
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
import { PaginationComponent } from './pagination/pagination.component';
import { NotificationComponent } from './notification/notification.component';



import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { MatDialogModule } from '@angular/material/dialog';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
// parent-communication.module.ts
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzUploadModule } from 'ng-zorro-antd/upload';
// Ng-Zorro Imports
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

// Zorro Modules
import { NzListModule } from 'ng-zorro-antd/list';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MatButtonModule } from '@angular/material/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MatCardModule } from '@angular/material/card';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpaceModule } from 'ng-zorro-antd/space';
// import { FormatTimePipe } from './format-time.pipe';

import { NzProgressModule } from 'ng-zorro-antd/progress';

// Import required NG-Zorro modules
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
// Import NG-ZORRO Segmented Module
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ImportantQuestionsComponent } from './important-questions/important-questions.component';


@NgModule({
  declarations: [
    StudentHomeComponent,
    BoardDashboardComponent,
    CommunicationComponent,
    UserFeedbackComponent,
    QuestionBankComponent,
    TestsComponent,
    TestComponent,
    ExamResultComponent,
    FormulaeComponent,
    ReportsComponent,
    StudyResourcesComponent,
    JoinTestComponent,
    ExamPortalComponent,
    FeedbackManagementComponent,
    AfterexamMessageComponent,
    ExamOverlookComponent,
    PaginationComponent,
    NotificationComponent,
    ImportantQuestionsComponent,
    // FormatTimePipe,
  ],
  imports: [
    CommonModule,
    StudentPanelMasterRoutingModule,
    FormsModule,
    ReactiveFormsModule,


    NzInputModule, NzProgressModule,
    NzSpinModule,
    NzSelectModule,
    MatButtonModule,
    NzInputNumberModule,
    NzCardModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzIconModule,
    NzRadioModule,
    NzListModule,
    NzCheckboxModule,
    NzBreadCrumbModule,
    NzTableModule,
    NzStepsModule,
    NzDatePickerModule,
    NzSliderModule,
    NzAlertModule,
    NzTypographyModule,
    NzAvatarModule,
    NzTagModule,
    NzLayoutModule,
    NzMenuModule,
    NzNotificationModule,
    NzUploadModule,
    NzBadgeModule,
    MatDialogModule,
    NzTreeModule,
    NzGridModule,
    NzAutocompleteModule,
    NzTabsModule,
    MatGridListModule,
    NzDescriptionsModule,
    MatIconModule,
    NzTimePickerModule,
    NzDividerModule,
    NzMessageModule,
    NzStatisticModule,
    NzToolTipModule,
    MatCardModule,
    NzEmptyModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzDropDownModule,
    NzSegmentedModule
  ]
})
export class StudentPanelMasterModule { }

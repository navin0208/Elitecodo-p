import { NgModule } from '@angular/core';
import { CommonModule  } from '@angular/common';

import { AdminPagesRoutingModule } from './admin-pages-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeacherManagementComponent } from './teacher-management/teacher-management.component';
import { StudentManagementComponent } from './student-management/student-management.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { SubjectManagementComponent } from './subject-management/subject-management.component';
import { ChapterManagementComponent } from './chapter-management/chapter-management.component';
import { TopicManagementComponent } from './topic-management/topic-management.component';
import { StandardManagementComponent } from './standard-management/standard-management.component';
import { SubTopicManagementComponent } from './sub-topic-management/sub-topic-management.component';
import { YearOfAppearanceManagementComponent } from './year-of-appearance-management/year-of-appearance-management.component';
import { QuestionLevelManagementComponent } from './question-level-management/question-level-management.component';
import { QuestionTypeManagementComponent } from './question-type-management/question-type-management.component';
import { QuestionsManagementComponent } from './questions-management/questions-management.component';
import { QuestionStatusComponent } from './question-status/question-status.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { AssignStandardWisedataComponent } from './assign-standard-wisedata/assign-standard-wisedata.component';
 import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 

// Import Ng Zorro modules
import { NzInputModule } from 'ng-zorro-antd/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NzGridModule } from 'ng-zorro-antd/grid'; // Add this for nz-col
import { MatInputModule } from '@angular/material/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { MatDialogModule } from '@angular/material/dialog';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMenuModule } from 'ng-zorro-antd/menu';  // Add this
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { DropdownModule } from 'primeng/dropdown';

import { NgxEchartsModule } from 'ngx-echarts';

import { PaginationComponent } from './pagination/pagination.component';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';
import { ChapterWiseWeightageComponent } from './chapter-wise-weightage/chapter-wise-weightage.component';
import { PendingUserStatusComponent } from './pending-user-status/pending-user-status.component';
import { PendingUserListComponent } from './pending-user-list/pending-user-list.component';
import { PendingUserDetailsComponent } from './pending-user-details/pending-user-details.component';
import { InstitutionManagementComponent } from './institution-management/institution-management.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { FeedbackManagementComponent } from './feedback-management/feedback-management.component';
import { CommunicateUserComponent } from './communicate-user/communicate-user.component';
import { StatusWiseQuestionsComponent } from './status-wise-questions/status-wise-questions.component';
import { AllAcceptedQuestionsComponent } from './all-accepted-questions/all-accepted-questions.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import { RoleNotificationComponent } from './role-notification/role-notification.component';
import { ReportOfQuestionComponent } from './report-of-question/report-of-question.component';

@NgModule({
  declarations: [
    DashboardComponent,
    TeacherManagementComponent,
    StudentManagementComponent,
    ExamManagementComponent,
    SubjectManagementComponent,
    ChapterManagementComponent,
    TopicManagementComponent,
    StandardManagementComponent,
    SubTopicManagementComponent,
    YearOfAppearanceManagementComponent,
    QuestionLevelManagementComponent,
    QuestionTypeManagementComponent,
    QuestionsManagementComponent,
    QuestionStatusComponent,
    ViewProfileComponent,
    AssignStandardWisedataComponent,
    PaginationComponent,
    AssignStandardWiseDataToStudentComponent,
    ChapterWiseWeightageComponent,
    PendingUserStatusComponent,
    PendingUserListComponent,
    PendingUserDetailsComponent,
    InstitutionManagementComponent,
    ParentManagementComponent,
    FeedbackManagementComponent,
    CommunicateUserComponent,
    StatusWiseQuestionsComponent,
    AllAcceptedQuestionsComponent,
    AdminManagementComponent,
    RoleNotificationComponent,
    ReportOfQuestionComponent
  ],
  imports: [
    CommonModule,
    AdminPagesRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    NzCheckboxModule,
    NzInputModule,
    NzSelectModule,
    MatButtonModule,
    NzInputNumberModule,
    MatCheckboxModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzDividerModule,
    NzAlertModule,
    NzSpinModule,
    NzResultModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    NzTagModule,
    NzEmptyModule,
    NzPageHeaderModule,
    NzAvatarModule,
    NzProgressModule,
    NzDropDownModule,
    NzBadgeModule,
    NzMenuModule,
    NzModalModule,
    NzMessageModule,
    NzToolTipModule,
    NzAutocompleteModule,
    NzRadioModule,
    NzStatisticModule,
    NzBreadCrumbModule,
    NzDescriptionsModule,
    NzPopconfirmModule,
    NzTypographyModule,
    NzDatePickerModule,
    NzSpaceModule,
    NzTabsModule,
    NzListModule,
    NzTimelineModule,
    NzTableModule,
    DropdownModule,
    NzFormModule,
    NzLayoutModule,
    NzNotificationModule,
    NzUploadModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
  ]
})
export class AdminPagesModule { }

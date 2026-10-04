import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminPagesRoutingModule } from './admin-pages-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeacherManagementComponent } from './teacher-management/teacher-management.component';
import { StudentManagementComponent } from './student-management/student-management.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { SubjectManagementComponent } from './subject-management/subject-management.component';
import { ChapterManagementComponent } from './chapter-management/chapter-management.component';
import { TopicManagementComponent } from './topic-management/topic-management.component';
import { StandardManagementComponent } from './standard-management/standard-management.component';
import { SubTopicManagementComponent } from './sub-topic-management/sub-topic-management.component';
import { YearOfAppearanceManagementComponent } from './year-of-appearance-management/year-of-appearance-management.component';
import { QuestionLevelManagementComponent } from './question-level-management/question-level-management.component';
import { QuestionTypeManagementComponent } from './question-type-management/question-type-management.component';
import { DropdownModule } from 'primeng/dropdown';
import { InstitutionManagementComponent } from './institution-management/institution-management.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { AssignStandardWisedataComponent } from './assign-standard-wisedata/assign-standard-wisedata.component';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';

// Import Ng Zorro modules
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid'; // Add this for nz-col
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { MatButtonModule } from '@angular/material/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzFormModule } from 'ng-zorro-antd/form';


@NgModule({
  declarations: [
    DashboardComponent,
    InstitutionManagementComponent,
    ParentManagementComponent,
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
    AssignStandardWisedataComponent,
    AssignStandardWiseDataToStudentComponent,

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
    NzInputModule,
    NzSelectModule,
    MatButtonModule,
    NzInputNumberModule,
    MatCheckboxModule,
    DropdownModule,
    NzDropDownModule,
    NzGridModule,
    NzAlertModule,
    NzSpinModule,
    NzResultModule,
    NzMenuModule,
    NzModalModule,
    NzMessageModule,
    NzToolTipModule,
    NzRadioModule,
    NzStatisticModule,
    NzBreadCrumbModule,
    NzDescriptionsModule,
    NzPopconfirmModule,
    NzTypographyModule,
    NzCardModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzAvatarModule,
    NzProgressModule,
    NzBadgeModule,
    NzDatePickerModule,
    NzSpaceModule,
    MatExpansionModule,
    MatIconModule,
    NzCheckboxModule,
    NzListModule,
    NzAutocompleteModule,
    NzTabsModule,
    NzTimelineModule,
    NzTableModule,
    NzEmptyModule,
    NzFormModule,
    NzTagModule,

  ]
})
export class AdminPagesModule { }

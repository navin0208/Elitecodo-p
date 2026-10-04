import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParentPanelMasterRoutingModule } from './parent-panel-master-routing.module';
import { ParentHomeComponent } from './parent-home/parent-home.component';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
// NG-Zorro Modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ReportCardComponent } from './report-card/report-card.component';
import { PracticeTestsComponent } from './practice-tests/practice-tests.component';
import { TeacherFeedbackComponent } from './teacher-feedback/teacher-feedback.component';
import { PerformanceComponent } from './performance/performance.component';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';





import { MatDialogModule } from '@angular/material/dialog';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
// parent-communication.module.ts

// Zorro Modules
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { MatGridListModule } from '@angular/material/grid-list';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
// import { FormatTimePipe } from './format-time.pipe';


// Import required NG-Zorro modules
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
// Import NG-ZORRO Segmented Module
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NotificationComponent } from './notification/notification.component';
import { PCompleteComponent } from './p-complete/p-complete.component';

@NgModule({
  declarations: [
    ParentHomeComponent,
    ReportCardComponent,
    PracticeTestsComponent,
    TeacherFeedbackComponent,
    PerformanceComponent,
    NotificationComponent,
    PCompleteComponent
  ],
  imports: [
    CommonModule,
    ParentPanelMasterRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTypographyModule,
    NzGridModule,
    NzIconModule,
    NzStatisticModule,
    NzDividerModule,
    NzTimelineModule,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzAvatarModule,
    NzBadgeModule,
    NzProgressModule,
    NzTableModule,
    NzDropDownModule,
    NzMessageModule,
    NzDescriptionsModule,
    NzRadioModule,
    NzEmptyModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzSpinModule,
    NzTagModule,
    NzToolTipModule,
    NzUploadModule,
    NzAlertModule,
    NzModalModule,
    NzNotificationModule,
    NzResultModule,
    NzSkeletonModule,
    NzTabsModule,
    NzListModule,
    NzRateModule,
    NzSwitchModule,
    NzPopoverModule,
    NzPaginationModule,
    NzCommentModule,
    NzSpaceModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatButtonToggleModule,
    NzPageHeaderModule,
    MatTableModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NzAutocompleteModule,
    NzInputNumberModule,
    MatGridListModule,
    NzTreeModule,
    NzBreadCrumbModule,
    NzStepsModule,
    NzSliderModule,
    NzCheckboxModule,
    NzTimePickerModule,
    NzSegmentedModule,





    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ]
})
export class ParentPanelMasterModule { }

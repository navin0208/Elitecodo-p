import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentHomeComponent } from './parent-home/parent-home.component';
import { ReportCardComponent } from './report-card/report-card.component';
import { PracticeTestsComponent } from './practice-tests/practice-tests.component';
import { TeacherFeedbackComponent } from './teacher-feedback/teacher-feedback.component';
import { PerformanceComponent } from './performance/performance.component';
import { NotificationComponent } from './notification/notification.component';
import { PCompleteComponent } from './p-complete/p-complete.component';

const routes: Routes = [
  { path: 'parent_home', component: ParentHomeComponent },
  { path: 'notification', component: NotificationComponent },
  {
    path: 'parent_home', children: [
      { path: 'report-card', component: ReportCardComponent },
      { path: 'practice-tests', component: PracticeTestsComponent },
      { path: 'teacher-feedback', component: TeacherFeedbackComponent },
      { path: 'profile-completnes', component: PCompleteComponent },
      { path: 'performance', component: PerformanceComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentPanelMasterRoutingModule { }

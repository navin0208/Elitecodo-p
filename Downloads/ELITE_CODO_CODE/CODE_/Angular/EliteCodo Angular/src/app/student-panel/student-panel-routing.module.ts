import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherPanelComponent } from './teacher-panel/teacher-panel.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {
    path: '', component: TeacherPanelComponent, children: [
      { path: '', loadChildren: () => import('../student-panel/student-panel-master/student-panel-master.module').then(m => m.StudentPanelMasterModule) }
    ]
  },
  { path: 'Notification', component: NotificationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentPanelRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherPanelComponent } from './teacher-panel/teacher-panel.component';
import { TeacherHomeComponent } from './teacher-panel-master/teacher-home/teacher-home.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  {
    path: '', component: TeacherPanelComponent, children: [
      { path: '', loadChildren: () => import('../teacher-panel/teacher-panel-master/teacher-panel-master.module').then(m => m.TeacherPanelMasterModule) }
    ]
  }, { path: 'Notification', component: NotificationsComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherPanelRoutingModule { }

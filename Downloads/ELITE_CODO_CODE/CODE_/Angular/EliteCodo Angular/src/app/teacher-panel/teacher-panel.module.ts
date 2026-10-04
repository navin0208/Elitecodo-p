import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TeacherPanelRoutingModule } from './teacher-panel-routing.module';
import { TeacherPanelComponent } from './teacher-panel/teacher-panel.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BackgroundThemeComponent } from './background-theme/background-theme.component';
import { NzPlacementType } from 'ng-zorro-antd/dropdown';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NotificationsComponent } from './notifications/notifications.component';
// import { SafePipe } from './teacher-panel-master/safe.pipe';
@NgModule({
  declarations: [
    TeacherPanelComponent,
    NavbarComponent,
    BackgroundThemeComponent,
    NotificationsComponent
    // SafePipe
  ],
  
  imports: [
    CommonModule,
    TeacherPanelRoutingModule,
    NzDropDownModule,
    NzButtonModule,
    NzTabsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class TeacherPanelModule { }

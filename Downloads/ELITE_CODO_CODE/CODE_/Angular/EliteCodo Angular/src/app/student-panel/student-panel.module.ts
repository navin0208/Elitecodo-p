import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';


import { StudentPanelRoutingModule } from './student-panel-routing.module';
import { TeacherPanelComponent } from './teacher-panel/teacher-panel.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BackgroundThemeComponent } from './background-theme/background-theme.component';
import { NotificationsComponent } from './notifications/notifications.component';
// import { FormatTimePipe } from './student-panel-master/format-time.pipe';
// Ng-Zorro Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TeacherPanelComponent,
    NavbarComponent,
    BackgroundThemeComponent,
    NotificationsComponent,
    // FormatTimePipe // Add the custom pipe here
  ],
  imports: [
    CommonModule,
    StudentPanelRoutingModule,
    MatBadgeModule, MatButtonModule, MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    // Ng-Zorro Modules
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzInputModule,
    NzMessageModule,
    NzTableModule,
    NzTagModule,
    NzUploadModule,
    NzSelectModule,
    NzEmptyModule,
    NzRadioModule,
    NzToolTipModule,
    NzGridModule
  ]
})
export class StudentPanelModule { }

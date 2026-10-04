import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParentPanelRoutingModule } from './parent-panel-routing.module';
import { ParentPanelComponent } from './parent-panel/parent-panel.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BackgroundThemeComponent } from './background-theme/background-theme.component';


@NgModule({
  declarations: [
    ParentPanelComponent,
    NavbarComponent,
    BackgroundThemeComponent
  ],
  imports: [
    CommonModule,
    ParentPanelRoutingModule
  ]
})
export class ParentPanelModule { }

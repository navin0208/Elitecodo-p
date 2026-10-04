import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstitutePanelRoutingModule } from './institute-panel-routing.module';
import { InstituteLayoutComponent } from './institute-layout/institute-layout.component';
import { IconsProviderModule } from '../icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    InstituteLayoutComponent
  ],
  imports: [
    CommonModule,
    InstitutePanelRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzBadgeModule,
    MatDialogModule,
  ]
})
export class InstitutePanelModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsProviderModule } from '../icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { MatDialogModule } from '@angular/material/dialog';

import { SuperAdminPanelRoutingModule } from './super-admin-panel-routing.module';
import { AdminlayoutComponent } from './adminlayout/adminlayout.component';


@NgModule({
  declarations: [AdminlayoutComponent],
  imports: [
    CommonModule,
    SuperAdminPanelRoutingModule,
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
export class SuperAdminPanelModule { }

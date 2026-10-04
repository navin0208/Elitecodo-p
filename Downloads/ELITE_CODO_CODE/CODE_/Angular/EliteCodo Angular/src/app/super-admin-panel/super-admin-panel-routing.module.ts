import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminlayoutComponent } from './adminlayout/adminlayout.component';

const routes: Routes = [
  {
    path: 'Slayout', component: AdminlayoutComponent, children: [
      { path: '', loadChildren: () => import('./admin-pages/admin-pages.module').then(m => m.AdminPagesModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminPanelRoutingModule { }

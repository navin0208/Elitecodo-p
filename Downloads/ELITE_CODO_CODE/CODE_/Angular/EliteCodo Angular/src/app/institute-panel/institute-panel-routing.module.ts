import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstituteLayoutComponent } from './institute-layout/institute-layout.component';

const routes: Routes = [
  {
    path: 'layout-institute', component: InstituteLayoutComponent, children: [
      { path: '', loadChildren: () => import('./institute-page/institute-page.module').then(m => m.InstitutePageModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstitutePanelRoutingModule { }

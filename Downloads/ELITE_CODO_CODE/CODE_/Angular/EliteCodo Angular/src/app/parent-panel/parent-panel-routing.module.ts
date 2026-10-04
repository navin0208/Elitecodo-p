import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentPanelComponent } from './parent-panel/parent-panel.component';

const routes: Routes = [
  {
    path: '', component: ParentPanelComponent, children: [
      { path: '', loadChildren: () => import('../parent-panel/parent-panel-master/parent-panel-master.module').then(m => m.ParentPanelMasterModule) }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentPanelRoutingModule { }

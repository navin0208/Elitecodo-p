import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './authGuard/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin-panel/admin-panel.module').then(
        (m) => m.AdminPanelModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'ROLE_ADMIN' },
  },
  {
    path: 'super_admin',
    loadChildren: () =>
      import('./super-admin-panel/super-admin-panel.module').then(
        (m) => m.SuperAdminPanelModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'super-admin' },
  },
  {
    path: 'teacher',
    loadChildren: () =>
      import('./teacher-panel/teacher-panel.module').then(
        (m) => m.TeacherPanelModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'teacher' },
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./student-panel/student-panel.module').then(
        (m) => m.StudentPanelModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'student' },
  },
  {
    path: 'institute',
    loadChildren: () =>
      import('./institute-panel/institute-panel.module').then(
        (m) => m.InstitutePanelModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'institute' },
  },
  {
    path: 'parent',
    loadChildren: () =>
      import('./parent-panel/parent-panel.module').then(
        (m) => m.ParentPanelModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'parent' },
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }

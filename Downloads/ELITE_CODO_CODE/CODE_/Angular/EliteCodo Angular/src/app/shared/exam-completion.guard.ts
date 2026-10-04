// exam-completion.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class ExamCompletionGuard implements CanActivate {
  constructor(
    private router: Router,
    private notification: NzNotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const fromExamPortal = sessionStorage.getItem('fromExamPortal');
    
    if (fromExamPortal) {
      sessionStorage.removeItem('fromExamPortal');
      return true;
    }

    const boardName = route.params['name'];
    this.notification.warning(
      'Access Denied',
      'You can only access this page after completing an exam',
      { nzDuration: 5000 }
    );
    this.router.navigate([`/student/${boardName}/join-test`]);
    return false;
  }
}
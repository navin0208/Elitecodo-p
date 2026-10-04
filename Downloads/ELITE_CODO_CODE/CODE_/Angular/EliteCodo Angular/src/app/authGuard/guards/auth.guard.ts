import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: HttpmethodsService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole(); // Adjust as per your service implementation

    if (userRole && userRole === expectedRole) {
      return true;
    } else {
      this.router.navigate(['/']); // Redirect to login or access-denied page
      return false;
    }
  }
}

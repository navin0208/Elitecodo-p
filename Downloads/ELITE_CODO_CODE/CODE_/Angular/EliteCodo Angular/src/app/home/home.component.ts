import { Component, OnInit, inject } from '@angular/core';
import { HttpmethodsService } from '../share-services/httpMethodService/httpmethods.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', '../../assets/css/animation.css']
})
export class HomeComponent implements OnInit {

  http = inject(HttpmethodsService)
  
  constructor() { }

  ngOnInit(): void {
    this.http.PageTitle('EliteCodo');
  }

  routeToNext(route: string) {
    window.location.href = `auth/${route}`
  }

}

// app.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LogoutService } from './share-services/logout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private logoutService: LogoutService) { }

  ngOnInit() { 

  }

}

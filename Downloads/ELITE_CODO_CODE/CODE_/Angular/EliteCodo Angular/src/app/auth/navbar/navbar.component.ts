import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  router = inject(Router);

  constructor(private location: Location) {
    console.log('navbar component');
  }

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }

  logout() {
    this.router.navigate(['/']);
  }
}

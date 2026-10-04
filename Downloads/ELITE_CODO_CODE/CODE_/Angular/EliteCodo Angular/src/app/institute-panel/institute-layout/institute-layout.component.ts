import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';

@Component({
  selector: 'app-institute-layout',
  templateUrl: './institute-layout.component.html',
  styleUrls: ['./institute-layout.component.css', '../../../assets/css/myaccount.css']
})
export class InstituteLayoutComponent implements OnInit {

  isAdmmin: any;
  isCollapsed = false;
  isReverseArrow = false;
  typeIcon = TYPE.SUCCESS;
  router = inject(Router);
  width = 200;
  http = inject(HttpmethodsService);
  
  // Institute profile data
  instituteProfilePicture: string = '';
  instituteDisplayName: string = 'Logged in as Institute';

  // Default image path
  private readonly defaultImagePath: string = '../../../assets/images/elitecodo.png';

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.accountDropdown();
    this.http.PageTitle('Institution Panel');

    this.isAdmmin = !!sessionStorage.getItem('adminId');
    console.log('isAdmmin', this.isAdmmin);

    // Load institute profile data
    this.loadInstituteProfile();
  }

  /**
   * Load institute profile data from sessionStorage
   */
  private loadInstituteProfile(): void {
    // Try to get institute data from sessionStorage
    const instituteDataStr = sessionStorage.getItem('instituteData');
    
    if (instituteDataStr) {
      try {
        const instituteData = JSON.parse(instituteDataStr);
        console.log('Institute Data loaded:', instituteData);
        
        // Get profile picture - if exists use it, otherwise keep empty (will use default)
        this.instituteProfilePicture = instituteData.profilePicture || 
                                        instituteData.logoImage || 
                                        instituteData.logo || 
                                        instituteData.image || 
                                        instituteData.photo || 
                                        '';
        
        // Get institute name for display
        this.instituteDisplayName = instituteData.instituteName || 
                                    instituteData.name || 
                                    instituteData.fullName || 
                                    'Logged in as Institute';
        
        console.log('Institute Profile Picture URL:', this.instituteProfilePicture);
        console.log('Institute Display Name:', this.instituteDisplayName);
      } catch (e) {
        console.error('Error parsing institute data:', e);
      }
    } else {
      // Try individual keys if instituteData doesn't exist
      const profilePic = sessionStorage.getItem('instituteProfilePicture') || 
                         sessionStorage.getItem('instituteLogo') || 
                         sessionStorage.getItem('logoImage') || 
                         sessionStorage.getItem('profilePicture') || 
                         '';
      
      if (profilePic) {
        this.instituteProfilePicture = profilePic;
      }
      
      const name = sessionStorage.getItem('instituteName') || 
                   sessionStorage.getItem('instituteFullName') || 
                   '';
      
      if (name) {
        this.instituteDisplayName = name;
      }
    }
    
    // If no profile picture found, use default
    if (!this.instituteProfilePicture || this.instituteProfilePicture.trim() === '') {
      console.log('No profile picture found, using default logo');
      this.instituteProfilePicture = this.defaultImagePath;
    }
  }

  goBack() {
    this.location.back();
  }

  accountDropdown() {
    const tap = document.querySelector('.profile') as HTMLElement;
    if (tap) {
      tap.addEventListener('click', () => {
        const toggleMenu = document.querySelector('.menu') as HTMLElement;
        if (toggleMenu) {
          toggleMenu.classList.toggle('active');
        }
      });
    }
  }

  Logout() {
    swal
      .fire({
        title: 'Are you sure you want to log out?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085D6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Log Out!',
      })
      .then((result) => {
        if (result.isConfirmed) {
          sessionStorage.removeItem('adminId');
          this.http.logout();
        }
      });
  }
}
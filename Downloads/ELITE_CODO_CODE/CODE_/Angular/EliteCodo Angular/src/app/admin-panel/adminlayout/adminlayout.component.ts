import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceManagementService } from 'src/app/share-services/devicemanagementServices/device-management.service';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';

export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  timestamp: Date;
  ipAddress?: string;
}

@Component({
  selector: 'app-adminlayout',
  templateUrl: './adminlayout.component.html',
  styleUrls: ['./adminlayout.component.css', '../../../assets/css/myaccount.css']
})
export class AdminlayoutComponent implements OnInit {

  isAdmmin: any;
  deviceService = inject(DeviceManagementService);

  isCollapsed = false;
  isReverseArrow = false;
  typeIcon = TYPE.SUCCESS;
  router = inject(Router);
  width = 200;
  http = inject(HttpmethodsService);
  
  // Admin profile picture - will be set from sessionStorage
  adminProfilePicture: string = '';
  adminDisplayName: string = 'Logged in as Admin';

  // Default image path
  private readonly defaultImagePath: string = '../../../assets/images/elitecodo.png';

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.accountDropdown();
    this.http.PageTitle('Administrator Panel');

    this.isAdmmin = !!sessionStorage.getItem('adminId');
    console.log('isAdmmin', this.isAdmmin);

    // Load admin profile data from sessionStorage
    this.loadAdminProfile();
  }

  /**
   * Load admin profile data from sessionStorage
   */
  private loadAdminProfile(): void {
    // Try to get admin data from sessionStorage
    const adminDataStr = sessionStorage.getItem('adminData');
    
    if (adminDataStr) {
      try {
        const adminData = JSON.parse(adminDataStr);
        console.log('Admin Data loaded:', adminData);
        
        // Get profile picture - if exists use it, otherwise keep empty (will use default)
        this.adminProfilePicture = adminData.profilePicture || adminData.profileImage || adminData.image || adminData.photo || '';
        
        // Get admin name for display
        if (adminData.firstName && adminData.lastName) {
          this.adminDisplayName = `${adminData.firstName} ${adminData.lastName}`;
        } else if (adminData.fullName) {
          this.adminDisplayName = adminData.fullName;
        } else if (adminData.name) {
          this.adminDisplayName = adminData.name;
        } else if (adminData.username) {
          this.adminDisplayName = adminData.username;
        }
        
        console.log('Admin Profile Picture URL:', this.adminProfilePicture);
        console.log('Admin Display Name:', this.adminDisplayName);
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    } else {
      // Try individual keys if adminData doesn't exist
      const profilePic = sessionStorage.getItem('adminProfilePicture') || 
                         sessionStorage.getItem('profilePicture') || 
                         sessionStorage.getItem('adminImage') || 
                         '';
      
      if (profilePic) {
        this.adminProfilePicture = profilePic;
      }
      
      const name = sessionStorage.getItem('adminFullName') || 
                   sessionStorage.getItem('adminName') || 
                   sessionStorage.getItem('fullName') || 
                   '';
      
      if (name) {
        this.adminDisplayName = name;
      }
    }
    
    // If no profile picture found, use default
    if (!this.adminProfilePicture || this.adminProfilePicture.trim() === '') {
      console.log('No profile picture found, using default logo');
      this.adminProfilePicture = this.defaultImagePath;
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
          this.logoutBySession();
          sessionStorage.removeItem('adminId');
          this.http.logout();
        }
      });
  }

  logoutBySession(): void {
    let adminID = String(sessionStorage.getItem('adminId'));
    let currentDeviceInfo: DeviceInfo = this.deviceService.getCurrentDeviceInfo();

    this.deviceService.logoutDevice(adminID, currentDeviceInfo.deviceId)
      .subscribe(() => {
        this.deviceService.clearDeviceSession();
      });
  }
}
import { Location } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HttpmethodsService } from 'src/app/share-services/httpMethodService/httpmethods.service';
import { InactivityService } from 'src/app/share-services/InactivityService/inactivity.service';
import { TYPE } from 'src/app/shared/AllModel';
import swal from 'sweetalert2';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-adminlayout',
  templateUrl: './adminlayout.component.html',
  styleUrls: ['./adminlayout.component.scss', '../../../assets/css/myaccount.css']
})
export class AdminlayoutComponent implements OnInit, OnDestroy, AfterViewInit {

  isAdmmin: any;
  NameOFSuperAdmin!: string | null;

  isCollapsed = false;
  isReverseArrow = false;
  typeIcon = TYPE.SUCCESS;
  router = inject(Router);
  http = inject(HttpmethodsService);
  private cdr = inject(ChangeDetectorRef);
  
  // Property to control back button visibility
  showBackButton: boolean = false;
  
  // Subscriptions
  private routerSubscription!: Subscription;
  
  // Define root routes where back button should be hidden
  private readonly rootRoutes: string[] = [
    '/super_admin/Slayout',
    '/admin/layout',
    '/admin/layout/dashboard'
  ];

  constructor(
    private location: Location, 
    private idleTimeoutService: InactivityService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.idleTimeoutService.init(120);
    this.accountDropdown();
    this.http.PageTitle('Super-Admin Panel');

    this.isAdmmin = !!sessionStorage.getItem('adminId');
    console.log('isAdmmin', this.isAdmmin);

    this.NameOFSuperAdmin = sessionStorage.getItem('SuperAdminFullName');
    
    // Initialize back button visibility
    this.checkBackButtonVisibility();
    
    // Listen to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkBackButtonVisibility();
        // Force sidebar active state update after navigation
        this.updateSidebarActiveState();
      });
    
    // Listen to browser back/forward button events (popstate)
    window.addEventListener('popstate', this.onPopState.bind(this));
  }

  ngAfterViewInit(): void {
    // Initial sidebar state update after view is ready
    setTimeout(() => {
      this.updateSidebarActiveState();
    }, 100);
  }

  ngOnDestroy(): void {
    this.idleTimeoutService.stopMonitoring();
    // Unsubscribe to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    // Remove popstate event listener
    window.removeEventListener('popstate', this.onPopState.bind(this));
  }

  /**
   * Handle browser back/forward button events
   */
  private onPopState(): void {
    console.log('Popstate event detected');
    // Small delay to ensure URL has changed
    setTimeout(() => {
      this.checkBackButtonVisibility();
      this.updateSidebarActiveState();
    }, 10);
  }

  /**
   * Manually update the sidebar menu active state based on current URL
   * This fixes the issue where back button doesn't update the sidebar highlight
   */
  private updateSidebarActiveState(): void {
    const currentUrl = this.router.url;
    console.log('Updating sidebar active state for URL:', currentUrl);
    
    // First, remove all active classes from all menu items
    const allMenuItems = document.querySelectorAll('li[nz-menu-item]');
    allMenuItems.forEach((item: Element) => {
      const htmlItem = item as HTMLElement;
      htmlItem.classList.remove('ant-menu-item-selected');
      htmlItem.classList.remove('active-menu-item');
    });
    
    // Also remove active classes from submenus
    const allSubmenus = document.querySelectorAll('li[nz-submenu]');
    allSubmenus.forEach((submenu: Element) => {
      const htmlSubmenu = submenu as HTMLElement;
      htmlSubmenu.classList.remove('ant-menu-submenu-open');
      htmlSubmenu.classList.remove('ant-menu-submenu-active');
    });
    
    // Find which menu item should be active based on current URL
    let activeMenuItem: Element | null = null;
    
    // Check for exact matches
    if (currentUrl === '/super_admin/Slayout' || currentUrl === '/super_admin/Slayout/') {
      // Dashboard - exact match
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="../../super_admin/Slayout"]');
    } else if (currentUrl.includes('question-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="question-management"]');
    } else if (currentUrl.includes('Institution-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="Institution-management"]');
    } else if (currentUrl.includes('admin-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="admin-management"]');
    } else if (currentUrl.includes('teacher-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="teacher-management"]');
    } else if (currentUrl.includes('student-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="student-management"]');
    } else if (currentUrl.includes('standard-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="standard-management"]');
    } else if (currentUrl.includes('exam-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="exam-management"]');
    } else if (currentUrl.includes('subject-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="subject-management"]');
    } else if (currentUrl.includes('chapter-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="chapter-management"]');
    } else if (currentUrl.includes('topic-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="topic-management"]');
    } else if (currentUrl.includes('subTopic-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="subTopic-management"]');
    } else if (currentUrl.includes('Chapter-Wise-weightage')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="Chapter-Wise-weightage"]');
    } else if (currentUrl.includes('year-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="year-management"]');
    } else if (currentUrl.includes('pattern-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="pattern-management"]');
    } else if (currentUrl.includes('questionType-management')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="questionType-management"]');
    } else if (currentUrl.includes('question_report')) {
      activeMenuItem = document.querySelector('li[nz-menu-item][routerLink="question_report"]');
    }
    
    // Add active class to the found menu item
    if (activeMenuItem) {
      const htmlItem = activeMenuItem as HTMLElement;
      htmlItem.classList.add('ant-menu-item-selected');
      htmlItem.classList.add('active-menu-item');
      
      // Also open parent submenu if this item is inside one
      const parentSubmenu = htmlItem.closest('li[nz-submenu]');
      if (parentSubmenu) {
        parentSubmenu.classList.add('ant-menu-submenu-open');
        parentSubmenu.classList.add('ant-menu-submenu-active');
      }
    }
    
    // Force change detection
    this.cdr.detectChanges();
  }

  /**
   * Check if back button should be visible based on current route
   */
  private checkBackButtonVisibility(): void {
    const currentUrl = this.router.url;
    
    // Hide back button on root/dashboard routes
    // Show back button on any other route (sub-pages)
    this.showBackButton = !this.isRootRoute(currentUrl);
    
    console.log('Current URL:', currentUrl, 'Show Back Button:', this.showBackButton);
  }

  /**
   * Check if current route is a root route where back button should be hidden
   */
  private isRootRoute(url: string): boolean {
    // Check if URL matches any root route
    for (const rootRoute of this.rootRoutes) {
      if (url === rootRoute || url === rootRoute + '/') {
        return true;
      }
    }
    
    // Also check if we're at the base of any module
    const urlSegments = url.split('/').filter(segment => segment);
    
    // If URL has only 2-3 segments and the last one is 'layout' or 'Slayout', it's likely a root
    if (urlSegments.length <= 3) {
      const lastSegment = urlSegments[urlSegments.length - 1];
      if (lastSegment === 'layout' || lastSegment === 'Slayout' || lastSegment === 'dashboard') {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Go back to previous page and ensure sidebar updates
   */
  goBack() {
    // Navigate back
    this.location.back();
    
    // Small delay to ensure navigation is complete, then update sidebar
    setTimeout(() => {
      this.checkBackButtonVisibility();
      this.updateSidebarActiveState();
    }, 50);
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
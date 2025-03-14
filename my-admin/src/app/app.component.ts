import { Component, OnInit } from '@angular/core';
import { AdminService } from './services/admin.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    // Force validation when app initializes
    if (this.adminService.isLoggedIn()) {
      // Validate the stored admin against server
      this.adminService.validateCurrentAdmin().subscribe(isValid => {
        if (!isValid) {
          this.adminService.logout();
          this.router.navigate(['/login-page']);
        } else {
          // If we're on login page but already authenticated, redirect to dashboard
          if (this.router.url === '/' || this.router.url === '/login') {
            this.router.navigate(['/dashboard-page']);
          }
        }
      });
    }

    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
      
      // Additional route-specific logic if needed
      if (this.isLoggedIn && (this.router.url === '/' || this.router.url === '/login')) {
        this.router.navigate(['/dashboard-page']);
      }
    });
    
    // Check initial login state
    this.checkLoginStatus();
    
    // Subscribe to changes in authentication state
    this.adminService.currentAdmin$.subscribe(admin => {
      this.isLoggedIn = !!admin;
    });
  }

  // Helper method to check login status
  private checkLoginStatus() {
    this.isLoggedIn = this.adminService.isLoggedIn();
  }
  
  // Manual logout method (can be called from UI if needed)
  logout() {
    this.adminService.logout();
    this.router.navigate(['/login-page']);
  }
}
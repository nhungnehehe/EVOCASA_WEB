import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-client';
  isHomepage = false;
  isVisibleSidebar = false;
  isOverlayVisible = false;
  isOverlayFading = false; 

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isHomepage = this.router.url === '/';
    });
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        if (this.isVisibleSidebar) {
          this.closeSidebar();
        }
    });
  }

  ngOnInit() {
    // Clear any existing sidebar state completely on initialization
    this.isVisibleSidebar = false;
    this.isOverlayVisible = false;
    
    // Listen for router events to completely reset sidebar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Force close sidebar and reset all states when page changes
        this.isVisibleSidebar = false;
        this.isOverlayVisible = false;
        this.isOverlayFading = false;
      });
  }

  openSidebar() {
    this.isVisibleSidebar = true;
    this.isOverlayVisible = true;  // Hiển thị overlay khi mở sidebar
  }

  closeSidebar() {
    this.isOverlayFading = true; 
  
    setTimeout(() => {
      this.isVisibleSidebar = false;
      
      setTimeout(() => {
        this.isOverlayVisible = false;
        this.isOverlayFading = false;
      }, 50); 
    }, 250); 
  }
}
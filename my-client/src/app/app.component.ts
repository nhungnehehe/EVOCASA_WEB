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
    setTimeout(() => {
      this.isVisibleSidebar = false;
      this.isOverlayVisible = false;
    }, 0);
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
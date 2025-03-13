import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'my-client';
  isHomepage = false;
  isVisibleSidebar = false;
  isOverlayVisible = false;
  isOverlayFading = false; // Add this new property

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isHomepage = this.router.url === '/';
    });
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Đóng sidebar khi chuyển trang
        if (this.isVisibleSidebar) {
          this.closeSidebar();
        }
    });
  }

  ngOnInit() {
    // Đảm bảo sidebar luôn đóng khi component khởi tạo
    setTimeout(() => {
      this.isVisibleSidebar = false;
      this.isOverlayVisible = false;
    }, 0);
  }

  openSidebar() {
    this.isVisibleSidebar = true;
    this.isOverlayVisible = true;
    this.isOverlayFading = false;
    console.log('Sidebar opened');
  }

  closeSidebar() {
    this.isOverlayFading = true; // Start fading the overlay
    
    // Keep the overlay visible while the sidebar is sliding out
    setTimeout(() => {
      this.isVisibleSidebar = false;
      
      // After sidebar has slid out, hide the overlay
      setTimeout(() => {
        this.isOverlayVisible = false;
        this.isOverlayFading = false;
      }, 50); // Small delay after sidebar is hidden
    }, 250); // This should be slightly less than your sidebar transition time
  }
}
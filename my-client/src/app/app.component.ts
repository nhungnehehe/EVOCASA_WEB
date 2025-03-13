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
  isVisibleSidebar: boolean = false;
  isOverlayVisible: boolean = false;  // Biến điều khiển overlay

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

  openSidebar() {
    this.isVisibleSidebar = true;
    this.isOverlayVisible = true;  // Hiển thị overlay khi mở sidebar
  }

  closeSidebar() {
    this.isVisibleSidebar = false;
       // Ẩn overlay sau time
       setTimeout(() => {
        this.isOverlayVisible = false;
      }, 500);
    
  }
  
}
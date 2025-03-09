import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-client';
  isHomepage = false;
  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isHomepage = this.router.url === '/homepage';
    });

  }  
}

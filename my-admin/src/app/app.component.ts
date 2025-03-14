import { Component, OnInit } from '@angular/core';
import { AdminService } from './services/admin.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    // Check initial login state
    this.isLoggedIn = this.adminService.isLoggedIn();
    
    // Subscribe to changes in authentication state
    this.adminService.currentAdmin$.subscribe(admin => {
      this.isLoggedIn = !!admin;
    });
  }
}
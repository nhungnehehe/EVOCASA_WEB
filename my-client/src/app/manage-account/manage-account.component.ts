import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-manage-account',
  standalone: false,
  templateUrl: './manage-account.component.html',
  styleUrl: './manage-account.component.css'
})
export class ManageAccountComponent {
  constructor (
    private router: Router,
    private userService: UserService
  ) {}
  
   // Hàm xử lý đăng xuất
   signOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.userService.clearCurrentUser(); 
    
    this.router.navigate(['/']);

    alert('You have been signed out successfully');
  }

}

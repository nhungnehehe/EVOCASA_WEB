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
    // Xóa token hoặc thông tin đăng nhập từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Xóa thông tin người dùng hiện tại từ service
    this.userService.clearCurrentUser(); // Đảm bảo UserService có phương thức này
    
    // Chuyển hướng người dùng về trang đăng nhập
    this.router.navigate(['/login-page']);
    
    // Hiển thị thông báo đăng xuất thành công (tùy chọn)
    alert('You have been signed out successfully');
  }

}

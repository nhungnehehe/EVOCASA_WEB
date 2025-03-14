import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { OrderService } from '../services/order.service';
import { Order } from '../interfaces/order';

@Component({
  selector: 'app-order-tracking-detail',
  standalone: false,
  templateUrl: './order-tracking-detail.component.html',
  styleUrl: './order-tracking-detail.component.css',
})
export class OrderTrackingDetailComponent {
  currentUserName: string | null = null;
    currentUserPhone: string | null = null;
    customerInfo: any;
    orders: Order[] = []; 
  

  constructor (
      private router: Router,
      private userService: UserService,
      private customerService: CustomerService,
      private orderService: OrderService
    ) {}

    ngOnInit() {
      this.userService.currentUserPhone$.subscribe((phone: string) => {
        this.currentUserPhone = phone;
        if (this.currentUserPhone) {
          this.customerService.getCustomerByPhone(this.currentUserPhone).subscribe(
            (data: any) => {
              this.customerInfo = data.data; 
              this.currentUserName = this.customerInfo.Name;
            },
            (error) => {
              console.error("Lỗi khi lấy thông tin khách hàng:", error);
            }
          );
        }
      });
    }
   // Hàm xử lý đăng xuất
   signOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.userService.clearCurrentUser(); 
    
    this.router.navigate(['/']);
    alert('You have been signed out successfully');
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { DatePipe } from '@angular/common';
import { CartItem1 } from '../interfaces/customer';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-manage-account',
  standalone: false,
  templateUrl: './manage-account.component.html',
  styleUrl: './manage-account.component.css'
})
export class ManageAccountComponent {
  currentUserName: string | null = null;
  currentUserPhone: string | null = null;
  customerInfo: any;
  formattedDOB: string | null = null;
  cartItems: CartItem1[] = [];  // Mảng giỏ hàng

  constructor(
    private router: Router,
    private userService: UserService,
    private customerService: CustomerService,
    private datePipe: DatePipe,
    private productService: ProductService
  ) {}

  ngOnInit() {
    // Subscribe vào currentUserPhone$
    this.userService.currentUserPhone$.subscribe((phone: string) => {
      this.currentUserPhone = phone;
      if (this.currentUserPhone) {
        // Sau khi lấy số điện thoại, gọi API để lấy thông tin khách hàng
        this.customerService.getCustomerByPhone(this.currentUserPhone).subscribe(
          (data: any) => {
            this.customerInfo = data.data; // Lưu thông tin khách hàng vào biến
            this.currentUserName = this.customerInfo.Name; // Lưu tên người dùng

            this.formattedDOB = this.datePipe.transform(this.customerInfo.DOB, 'dd/MM/yyyy');

            this.getCartData();  
          },
          (error) => {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
          }
        );
      }
    });
  }
  getCartData() {
    if (this.customerInfo && this.customerInfo._id) {
      this.customerService.getCartByCustomerId(this.customerInfo._id).subscribe(
        (cartItems: any[]) => {
          this.cartItems = cartItems.map(item => ({
            productId: item.ProductId,  // Đổi ProductId thành productId
            cartQuantity: item.Quantity // Đổi Quantity thành cartQuantity
          }));
        },
        (error) => {
          console.error("Lỗi khi lấy giỏ hàng:", error);
        }
      );
    }
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

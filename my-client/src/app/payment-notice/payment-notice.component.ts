import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-payment-notice',
  standalone: false,
  templateUrl: './payment-notice.component.html',
  styleUrl: './payment-notice.component.css'
})
export class PaymentNoticeComponent {
  currentUserName: string | null = null;
  currentUserPhone: string | null = null;
  customerInfo: any;

  constructor(
      private userService: UserService,
      private customerService: CustomerService,
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

          },
          (error) => {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
          }
        );
      }
    });
  }
}

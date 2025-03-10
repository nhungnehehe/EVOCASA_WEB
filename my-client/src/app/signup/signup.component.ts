import { Component, ViewChild } from '@angular/core';
import { Account } from '../interfaces/account';
import { Customer } from '../interfaces/customer';
import { AccountService } from '../services/account.service';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  account: Account = new Account();
  customer: Customer = new Customer();
  errMessage: string = '';
  isPhoneNumberValid: boolean = true;
  confirmPassword: string = '';

  @ViewChild('passwordInput') passwordInput: any;
  @ViewChild('confirmPasswordInput') confirmPasswordInput: any;

  constructor(
    private _service: AccountService, 
    private router: Router,
    private _customerService: CustomerService
  ) { }

  // Kiểm tra số điện thoại hợp lệ theo regex
  checkPhoneNumber(): void {
    const phoneNumberRegex = /^(\+84|0)[1-9][0-9]{7,8}$/;
    if (this.account.phonenumber.trim().length === 0) {
      this.isPhoneNumberValid = true;
    } else {
      this.isPhoneNumberValid = phoneNumberRegex.test(this.account.phonenumber);
    }
  }

  // Đăng ký tài khoản (Account) và sau đó đăng ký thông tin Customer
  postAccount(): void {
    if (!this.isPhoneNumberValid) {
      alert('Please enter a valid phone number!');
      return;
    } else if (
      this.account.phonenumber.trim().length === 0 ||
      this.account.Name.trim().length === 0 ||
      this.account.password.trim().length === 0 ||
      this.confirmPassword.trim().length === 0
    ) {
      alert('Please fill in all required fields.');
      return;
    } else if (this.account.password !== this.confirmPassword) {
      alert('Password does not match.');
      return;
    } else {
      // Gọi service đăng ký tài khoản
      this._service.postAccount(this.account).subscribe({
        next: (data) => {
          // Cập nhật lại các trường cần thiết từ dữ liệu trả về
          // Lưu ý: KHÔNG gán this.account.password = data.password để tránh hiển thị password đã hash trên FE.
          this.account.Name = data.Name;
          this.account.phonenumber = data.phonenumber;
          // Nếu cần giữ lại giá trị password gốc trong biến riêng (không bind với input) thì bạn có thể lưu vào một biến khác
          // Ví dụ: this.originalPassword = this.account.password;
          // Nhưng không cập nhật lại đối tượng account mà giao diện đang bind.
          
          alert('Sign up successfully');
          
          // Map các trường cần thiết từ Account sang Customer
          this.customer.Name = this.account.Name;
          this.customer.Phone = this.account.phonenumber;
          this.customer.Mail = "";
          this.customer.DOB = "";
          this.customer.Address = "";
          this.customer.Gender = "";
          this.customer.Image = "";
          this.customer.CreatedAt = "";
          this.customer.Cart = [];
          
          // Gọi đăng ký thông tin customer
          this._customerService.postCustomer(this.customer).subscribe({
            next: (custData) => {
              this.customer = custData;
              this.router.navigate(['/login-page']);
            },
            error: (err) => {
              this.errMessage = err;
            }
          });
        },
        error: (err) => {
          this.errMessage = err;
          alert('Sign up failed');
        }
      });
    }
  }

  // Hàm đăng ký Customer riêng (nếu cần sử dụng riêng)
  postCustomer(): void {
    this.customer.Name = this.account.Name;
    this.customer.Phone = this.account.phonenumber;
    this.customer.Mail = "";
    this.customer.DOB = "";
    this.customer.Address = "";
    this.customer.Gender = "";
    this.customer.Image = "";
    this.customer.CreatedAt = "";
    this.customer.Cart = [];

    if (!this.isPhoneNumberValid) {
      return;
    } else if (
      this.account.phonenumber.trim().length === 0 ||
      this.account.Name.trim().length === 0 ||
      this.account.password.trim().length === 0 ||
      this.confirmPassword.trim().length === 0
    ) {
      return;
    } else if (this.account.password !== this.confirmPassword) {
      return;
    } else {
      this._customerService.postCustomer(this.customer).subscribe({
        next: (data) => {
          this.customer = data;
          alert('Customer registered successfully');
        },
        error: (err) => {
          this.errMessage = err;
          alert('Customer registration failed');
        }
      });
    }
  }
}
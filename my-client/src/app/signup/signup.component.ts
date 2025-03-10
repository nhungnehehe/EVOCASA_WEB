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

  // Đăng ký tài khoản (Account)
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
      this._service.postAccount(this.account).subscribe({
        next: (data) => {
          this.account = data;
          alert('Sign up successfully');
          this.router.navigate(['/login-page']);
        },
        error: (err) => {
          this.errMessage = err;
          alert('Sign up failed');
        }
      });
    }
  }

  // Đăng ký thông tin customer (chỉ map các trường có sẵn)
  postCustomer(): void {
    this.customer.Name = this.account.Name;
    this.customer.Phone = this.account.phonenumber;

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
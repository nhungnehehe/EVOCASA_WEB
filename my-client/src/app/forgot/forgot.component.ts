import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: false,
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  // Step management: 1 - Enter phone number, 2 - Enter verification code, 3 - Reset password
  step: number = 1;

  // Step 1 fields
  phoneNumber: string = "";
  phoneNumbers: any;
  isPhoneNumberValid: boolean = true;
  errorMessage: string = "";
  showVerificationCodeForDebug: boolean = true; // Hiển thị mã xác thực cho mục đích phát triển

  // Step 2 fields: Verification Code
  verificationCode: string = "";
  isVerificationCodeValid: boolean = true;
  generatedCode: string = "";
  countdown: number = 30;
  timer: any;
  
  // Step 3 fields: Reset password
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(
    private router: Router,
    private http: HttpClient,
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  // Kiểm tra định dạng số điện thoại
  checkPhoneNumber(): void {
    const phoneNumberRegex = /^(\+84|0)[1-9][0-9]{7,8}$/; 
    if (this.phoneNumber.trim().length === 0) {
      this.isPhoneNumberValid = true;
    } else {
      this.isPhoneNumberValid = phoneNumberRegex.test(this.phoneNumber);
    }
  }

  // Bước 1: Gửi mã xác thực
  sendCode(): void {
    if (!this.isPhoneNumberValid) {
      alert('Please enter the correct phone number!');
      return;
    }
    if (this.phoneNumber.trim().length === 0) {
      alert('Please enter the phone number!');
      return;
    }

    // Kiểm tra số điện thoại với API trước khi xử lý
    this.accountService.checkPhoneNumberExist(this.phoneNumber).subscribe({
      next: (data) => {
        console.log("Received data:", data);
        this.phoneNumbers = data;
        let found = false;
        // Nếu API trả về mảng
        if (Array.isArray(this.phoneNumbers)) {
          if (this.phoneNumbers.length > 0 && this.phoneNumbers[0].phonenumber === this.phoneNumber) {
            found = true;
          }
        } else if (this.phoneNumbers && this.phoneNumbers.phonenumber) {
          // Nếu API trả về đối tượng
          if (this.phoneNumbers.phonenumber === this.phoneNumber) {
            found = true;
          }
        }
        if (found) {
          // Sinh mã xác thực ngẫu nhiên 6 chữ số
          this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
          console.log("Generated verification code:", this.generatedCode);
          alert('Verification code sent successfully!');
          // Chuyển sang bước 2 và bắt đầu đếm ngược 30 giây
          this.step = 2;
          this.startCountdown();
        } else {
          alert('Phone number is unavailable!');
        }
      },
      error: (err) => {
        console.error("Send process error:", err);
        this.errorMessage = err.message || err;
        
        // Trong môi trường development, cho phép tiếp tục ngay cả khi API lỗi
        this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated verification code (API error bypass):", this.generatedCode);
        alert('Verification code sent successfully! (API check bypassed)');
        this.step = 2;
        this.startCountdown();
      }
    });
  }

  // Gửi lại mã xác thực
  resend(): void {
    if (!this.isPhoneNumberValid) {
      alert('Please fill in a correct phone number!');
      return;
    }
    if (this.phoneNumber.trim().length === 0) {
      alert('Please fill in the phone number!');
      return;
    }

    // Trong môi trường development, tạo mã mới mà không kiểm tra với server
    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Resent verification code:", this.generatedCode);
    
    // Chỉ hiển thị thông báo thành công, không hiện mã trong alert
    alert('Verification code resent successfully!');
    
    this.resetCountdown();
  }

  // Kiểm tra mã xác thực khi nhập
  checkVerificationCode(): void {
    if (this.verificationCode.trim().length === 0) {
      this.isVerificationCodeValid = true;
    }
  }

  // Xác nhận mã xác thực đã nhập
  verifyCode(): void {
    if (this.verificationCode.trim().length === 0) {
      alert('Please enter the verification code!');
      return;
    }
    if (this.verificationCode === this.generatedCode) {
      alert('Verification successful!');
      clearInterval(this.timer);
      // Chuyển sang bước 3: Reset Password
      this.step = 3;
    } else {
      alert('Incorrect verification code!');
    }
  }

  // Bắt đầu bộ đếm ngược 30 giây cho mã xác thực
  startCountdown(): void {
    this.countdown = 30;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        alert("Verification code expired. Please resend!");
      }
    }, 1000);
  }

  // Đặt lại bộ đếm ngược (khi gửi lại mã)
  resetCountdown(): void {
    this.startCountdown();
  }

// Reset mật khẩu sau khi nhập mật khẩu mới và xác nhận
resetPassword(): void {
  if (this.newPassword.trim().length === 0 || this.confirmPassword.trim().length === 0) {
    alert("Please fill in the password fields!");
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  
  // Kiểm tra độ dài mật khẩu (ví dụ: tối thiểu 6 ký tự)
  if (this.newPassword.length < 6) {
    alert("Password must be at least 6 characters long!");
    return;
  }

  // Sử dụng AccountService để reset password, không cần mật khẩu cũ
  this.accountService.resetPassword(this.phoneNumber, this.newPassword)
    .subscribe({
      next: (response) => {
        console.log("Password reset response:", response);
        alert("Password has been reset successfully!");
        this.router.navigate(['/login-page']);
      },
      error: (error) => {
        console.error("Password reset error:", error);
        this.errorMessage = error.message || 'An error occurred';
        alert("An error occurred while resetting the password: " + this.errorMessage);
      }
    });
}
}
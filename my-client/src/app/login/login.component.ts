import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  phonenumber: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isPhoneNumberValid: boolean = true;
  loginForm!: FormGroup;
  loginError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) { }

  checkPhoneNumber(): void {
    const phonenumberRegex = /^(\+84|0)[1-9][0-9]{7,8}$/; // Kiểm tra số điện thoại hợp lệ
    // Nếu dùng reactive form, có thể kiểm tra từ loginForm.value.emailOrPhone, 
    // nhưng để giữ nguyên logic ban đầu, sử dụng this.phonenumber
    this.isPhoneNumberValid = phonenumberRegex.test(this.phonenumber);
  }

  ngOnInit() {
    // Nếu số điện thoại, mật khẩu đã tồn tại thì sử dụng lại thông tin đăng nhập
    const phonenumberCookie = this.authService.getCookie('phonenumber');
    const passwordCookie = this.authService.getCookie('password');
    if (phonenumberCookie && passwordCookie) {
      this.phonenumber = phonenumberCookie;
      this.password = passwordCookie;
      this.rememberMe = true;
    }

    // Khởi tạo form với giá trị mặc định từ biến phonenumber và password
    this.loginForm = this.formBuilder.group({
      emailOrPhone: [this.phonenumber, [Validators.required]],
      password: [this.password, [Validators.required]]
    });
  }

  onSubmit() {
    // Cập nhật lại giá trị từ form vào thuộc tính của component
    const formValues = this.loginForm.value;
    this.phonenumber = formValues.emailOrPhone;
    this.password = formValues.password;

    if (!this.isPhoneNumberValid) {
      alert('Please enter a valid phone number');
      return;
    } else {
      this.authService.login(this.phonenumber, this.password).subscribe(
        (user) => {
          this.authService.setCurrentUser(user);

          this.accountService.checkPasswordResetSuccess(this.phonenumber).subscribe({
            next: (data) => {
              const passwordResetSuccess = data.success;
              if (passwordResetSuccess) {
                this.authService.setCookie('phonenumber', this.phonenumber, 30);
                this.authService.setCookie('password', this.password, 30);
              }
            }
          });
          alert('Login successfully!');
          this.router.navigate(['/'], { relativeTo: this.route });
        },
        (error) => {
          // Thông báo lỗi khi login thất bại
          alert('Login failed!');
          this.loginError = 'Login failed!';
        }
      );
    }
  }
}
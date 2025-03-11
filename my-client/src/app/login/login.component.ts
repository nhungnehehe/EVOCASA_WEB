import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { IUser } from '../interfaces/user';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  phonenumber: string = '';
  password: string = '';
  isPhoneNumberValid: boolean = true;
  loginForm!: FormGroup;
  loginError: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) { }

  checkPhoneNumber(): void {
    const phonenumberRegex = /^(\+84|0)[1-9][0-9]{7,8}$/;
    this.isPhoneNumberValid = phonenumberRegex.test(this.phonenumber);
  }

  ngOnInit(): void {
    // Khởi tạo form với giá trị mặc định từ các biến
    this.loginForm = this.formBuilder.group({
      emailOrPhone: [this.phonenumber, [Validators.required]],
      password: [this.password, [Validators.required]]
    });
  }

  onSubmit(): void {
    // Lấy giá trị từ form
    const formValues = this.loginForm.value;
    this.phonenumber = formValues.emailOrPhone;
    this.password = formValues.password;

    if (!this.isPhoneNumberValid) {
      alert('Please enter a valid phone number');
      return;
    }

    this.authService.login(this.phonenumber, this.password).subscribe(
      (userObj) => {
        // Ép kiểu userObj thành IUser
        const user = userObj as IUser;
        // Lưu thông tin user hiện tại thông qua AuthService
        this.authService.setCurrentUser(user);
        // Cập nhật tên người dùng trong UserService để header cập nhật mà không cần reload
        if (user && user.Name) {
          const firstName = user.Name.split(' ')[0];
          this.userService.setCurrentUserName(firstName);
        }

        // Optionally, kiểm tra thay đổi mật khẩu nếu cần
        this.accountService.checkPasswordResetSuccess(this.phonenumber).subscribe({
          next: (data) => {
            // Xử lí nếu cần
          }
        });
        alert('Login successfully!');
        // Điều hướng về trang chủ
        this.router.navigate(['/'], { relativeTo: this.route });
      },
      (error) => {
        alert('Login failed!');
        this.loginError = 'Login failed!';
      }
    );
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
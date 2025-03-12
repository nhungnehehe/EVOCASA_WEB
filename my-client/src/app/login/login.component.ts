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
    this.loginForm = this.formBuilder.group({
      emailOrPhone: [this.phonenumber, [Validators.required]],
      password: [this.password, [Validators.required]]
    });
  }

  onSubmit(): void {
    const formValues = this.loginForm.value;
    this.phonenumber = formValues.emailOrPhone;
    this.password = formValues.password;

    if (!this.isPhoneNumberValid) {
      alert('Please enter a valid phone number');
      return;
    }

    this.authService.login(this.phonenumber, this.password).subscribe(
      (userObj) => {
        const user = userObj as IUser;
        this.authService.setCurrentUser(user);
        if (user && user.Name) {
          const firstName = user.Name.split(' ')[0];
          this.userService.setCurrentUserName(firstName);
        }
        this.accountService.checkPasswordResetSuccess(this.phonenumber).subscribe({
          next: (data) => {
          }
        });
        alert('Login successfully!');
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
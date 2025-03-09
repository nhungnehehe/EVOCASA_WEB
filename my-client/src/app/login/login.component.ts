import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  emailOrPhone: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isPhoneNumberValid: boolean = true;
  isEmailValid: boolean = true;
  loginError: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      emailOrPhone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // Try auto-login from cookie
    this.authService.autoLogin().subscribe(success => {
      if (success) {
        this.router.navigate(['/']);
      }
    });

    // Retrieve saved credentials if remember me was checked
    const savedEmailOrPhone = this.authService.getCookie('emailOrPhone');
    const savedPassword = this.authService.getCookie('password');
    
    if (savedEmailOrPhone && savedPassword) {
      this.loginForm.patchValue({
        emailOrPhone: savedEmailOrPhone,
        password: savedPassword,
        rememberMe: true
      });
    }
  }

  // Validate input - detects if it's a phone number or email
  validateInput(): void {
    const input = this.loginForm.get('emailOrPhone')?.value;
    
    if (!input) {
      this.isPhoneNumberValid = false;
      this.isEmailValid = false;
      return;
    }
    
    // Check if input contains @ (email format)
    if (input.includes('@')) {
      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      this.isEmailValid = emailRegex.test(input);
      this.isPhoneNumberValid = true; // Not relevant for email
    } else {
      // Validate phone number format (Vietnamese format)
      const phoneRegex = /^(\+84|0)[1-9][0-9]{7,8}$/;
      this.isPhoneNumberValid = phoneRegex.test(input);
      this.isEmailValid = true; // Not relevant for phone
    }
  }

  // Trong login.component.ts
onSubmit(): void {
  if (this.loginForm.invalid) {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
    return;
  }
  
  this.isLoading = true;
  const { emailOrPhone, password, rememberMe } = this.loginForm.value;
  
  this.authService.login(emailOrPhone, password).subscribe({
    next: (user) => {
      console.log('User received:', user);
      if (user) {
        // xử lý thành công
        this.router.navigate(['/']);
      } else {
        this.loginError = 'Invalid credentials. Please try again.';
      }
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Login error:', error);
      this.loginError = 'Login failed. Please try again.';
      this.isLoading = false;
    }
  });
}

  // Navigate to register page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Navigate to forgot password page
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
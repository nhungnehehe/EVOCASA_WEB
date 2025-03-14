import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import {Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  loginError = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginError = 'Please fill in all required fields correctly.';
      return;
    }

    // Here you would normally call an authentication service
    // This is a placeholder for demonstration purposes
    const { employeeId, password } = this.loginForm.value;
    
    // Example authentication logic (replace with actual authentication)
    if (employeeId === 'employee123' && password === 'password123') {
      // Navigate to dashboard on successful login
      this.router.navigate(['/dashboard']);
    } else {
      this.loginError = 'Invalid employee ID or password.';
    }
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap} from 'rxjs/operators';
import { Customer } from '../interfaces/customer';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3002/customer'; // Matching the URL from your CustomerService

  constructor(
    private http: HttpClient, 
    private router: Router,
    private customerService: CustomerService
  ) {}

  // Login using either email or phone
  login(emailOrPhone: string, password: string): Observable<Customer | null> {
    return this.customerService.login(emailOrPhone, password).pipe(
      tap((customer: Customer | null) => {
        if (customer) {
          // Store user in session storage upon successful login
          this.setCurrentUser(customer);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return of(null);
      })
    );
  }

  // Log out user by removing from session storage
  logout(): void {
    if (sessionStorage.getItem('CurrentUser') !== null) {
      sessionStorage.removeItem('CurrentUser');
      this.deleteCookie('auth_token');
      this.router.navigate(['/login']);
    }
  }

  // Store user data in session storage
  setCurrentUser(user: Customer): void {
    // Remove sensitive data before storing
    const { Password, PasswordSalt, ...safeUserData } = user;
    sessionStorage.setItem('CurrentUser', JSON.stringify(safeUserData));
    // Optional: Set auth cookie for persistent login
    this.setCookie('auth_token', user._id, 7); // 7 days expiration
  }

  // Get current user from session storage
  getCurrentUser(): Customer | null {
    const userData = sessionStorage.getItem('CurrentUser');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  // Cookie management functions
  setCookie(name: string, value: string, expireDays: number): void {
    const date = new Date();
    date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
  }

  getCookie(name: string): string {
    const cookieName = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return '';
  }

  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }

  // Auto-login based on cookie (can be called in app initialization)
  autoLogin(): Observable<boolean> {
    const authToken = this.getCookie('auth_token');
    if (!authToken) {
      return of(false);
    }
    
    return this.customerService.getCustomerById(authToken).pipe(
      map(customer => {
        if (customer) {
          this.setCurrentUser(customer);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  // Change password implementation
  changePassword(phoneOrEmail: string, oldPassword: string, newPassword: string): Observable<any> {
    // First verify the old password is correct
    return this.customerService.login(phoneOrEmail, oldPassword).pipe(
      switchMap(customer => {
        if (!customer) {
          return throwError(() => new Error('Current password is incorrect'));
        }
        
        // Update customer with new password
        const updatedCustomer = { ...customer, Password: newPassword };
        return this.customerService.updateCustomer(updatedCustomer);
      }),
      map(response => ({ success: true, message: 'Password changed successfully' })),
      catchError(error => {
        console.error('Change password error:', error);
        return throwError(() => new Error('Failed to change password. Please try again.'));
      })
    );
  }

  // Register a new user
  register(userData: Customer): Observable<Customer> {
    // Set creation date
    userData.CreatedAt = new Date();
    
    return this.customerService.registerCustomer(userData).pipe(
      tap(newUser => {
        // Auto login after registration
        this.setCurrentUser(newUser);
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }
}
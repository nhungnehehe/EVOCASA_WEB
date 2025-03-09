import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Customer, ICustomer, CartItem1 } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  // API base URL
  private apiUrl = 'http://localhost:3002/customer'; 
  
  // Default HTTP options
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  // Get all customers
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
      .pipe(
        tap(_ => console.log('Fetched all customers')),
        catchError(this.handleError<Customer[]>('getAllCustomers', []))
      );
  }

  // Get customer by ID
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customer/${id}`)
      .pipe(
        tap(_ => console.log(`Fetched customer id=${id}`)),
        catchError(this.handleError<Customer>('getCustomerById'))
      );
  }

  // Get customer by phone number
  getCustomerByPhone(phone: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${phone}`)
      .pipe(
        tap(_ => console.log(`Fetched customer with phone=${phone}`)),
        catchError(this.handleError<Customer>('getCustomerByPhone'))
      );
  }

  // Get customer by email (used for login)
  getCustomerByEmail(email: string): Observable<Customer> {
    // Since API may not have an endpoint to search by email, we fetch all and filter
    // Note: In production, this should be handled server-side
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
      .pipe(
        map(customers => {
          const foundCustomer = customers.find(customer => customer.Mail === email);
          if (!foundCustomer) {
            throw new Error(`No customer found with email=${email}`);
          }
          return foundCustomer;
        }),
        tap(customer => console.log(`Found customer with email=${email}`)),
        catchError(this.handleError<Customer>('getCustomerByEmail'))
      );
  }

  // Login with email/phone and password
  login(emailOrPhone: string, password: string): Observable<Customer | null> {
    // For testing purposes only - simulating API call using the sample data
    // In production, this should be a real API call
    console.log(`Attempting login with: ${emailOrPhone}`);
    
    // Mock implementation for development/testing
    // In a real app, you'd make an HTTP request to your backend
    return of(null).pipe(
      switchMap(() => {
        // Determine if input is email or phone
        const isEmail = emailOrPhone.includes('@');
        
        if (isEmail) {
          return this.getCustomerByEmail(emailOrPhone);
        } else {
          return this.getCustomerByPhone(emailOrPhone);
        }
      }),
      map(customer => {
        if (customer) {
          // In real app, you'd compare hashed passwords
          // For now, we're just checking if password matches (for testing)
          if (customer.Password === password) {
            console.log('Login successful');
            return customer;
          }
        }
        console.log('Login failed - invalid credentials');
        return null;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(null);
      })
    );
  }

  // Register new customer
  registerCustomer(customer: ICustomer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer, this.httpOptions)
      .pipe(
        tap((newCustomer: Customer) => console.log(`Added customer w/ id=${newCustomer._id}`)),
        catchError(this.handleError<Customer>('registerCustomer'))
      );
  }

  // Update customer information
  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${customer._id}`, customer, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Updated customer id=${customer._id}`)),
        catchError(this.handleError<Customer>('updateCustomer'))
      );
  }

  // Update customer's cart
  updateCart(customerId: string, cart: CartItem1[]): Observable<Customer> {
    return this.http.put<Customer>(
      `${this.apiUrl}/customers/${customerId}/cart`, 
      { Cart: cart }, 
      this.httpOptions
    ).pipe(
      tap(_ => console.log(`Updated cart for customer id=${customerId}`)),
      catchError(this.handleError<Customer>('updateCart'))
    );
  }

  // Add product to cart
  addToCart(customerId: string, productId: string, quantity: number = 1): Observable<Customer> {
    return this.getCustomerById(customerId).pipe(
      switchMap(customer => {
        const cart = [...customer.Cart];
        const existingItem = cart.find(item => item.ProductId === productId);
        
        if (existingItem) {
          existingItem.Quantity += quantity;
        } else {
          cart.push({ ProductId: productId, Quantity: quantity });
        }
        
        return this.updateCart(customerId, cart);
      }),
      catchError(this.handleError<Customer>('addToCart'))
    );
  }

  // Delete customer
  deleteCustomer(customerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${customerId}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Deleted customer id=${customerId}`)),
        catchError(this.handleError<any>('deleteCustomer'))
      );
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }
}
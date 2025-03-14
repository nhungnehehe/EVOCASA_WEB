import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, retry } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Customer, ICustomer, CartItem1 } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  // API base URL
  private apiUrl = 'http://localhost:3002'; 
  
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
    return this.http.get<Customer>(`${this.apiUrl}/customers/phone/${phone}`)
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
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
          existingItem.cartQuantity += quantity;
        } else {
          cart.push({ productId: productId, cartQuantity: quantity });
        }
        
        return this.updateCart(customerId, cart);
      }),
      catchError(this.handleError<Customer>('addToCart'))
    );
  }
  
  // Lấy danh sách sản phẩm trong giỏ hàng dựa trên customerId
  getCartByCustomerId(customerId: string): Observable<CartItem1[]> {
    return this.http.get<CartItem1[]>(`${this.apiUrl}/customers/${customerId}/cart`)
      .pipe(
        tap(_ => console.log(`Fetched cart for customer id=${customerId}`)),
        catchError(this.handleError<CartItem1[]>('getCartByCustomerId', []))
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
  postCustomer(customer: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json;charset=utf-8');
    const requestOptions: Object = {
      headers: headers,
      responseType: 'text'
    };
    return this.http.post<any>(`${this.apiUrl}/customers`, customer, requestOptions)
      .pipe(
        map((res) => JSON.parse(res) as Array<Customer>),
        retry(3),
        catchError(this.handleError<Array<Customer>>('postCustomer', []))
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


  // Lấy danh sách sản phẩm trong giỏ hàng dựa trên số điện thoại
getCartByPhone(phone: string): Observable<CartItem1[]> {
  return this.http.get<CartItem1[]>(`${this.apiUrl}/customers/phone/${phone}/cart`)
    .pipe(
      tap(_ => console.log(`📢 Fetched cart for phone=${phone}`)),
      catchError(this.handleError<CartItem1[]>('getCartByPhone', []))
    );
}

// Thêm vào CustomerService
updateCustomerCart(phone: string, cartItems: CartItem1[]): Observable<any> {
  // Lọc và chỉ gửi các dữ liệu cần thiết (productId và cartQuantity)
  const cartItemsToSync = cartItems.map(item => ({
    productId: item.productId,
    cartQuantity: item.cartQuantity
  }));

  console.log('Sending updated cart via PUT:', cartItemsToSync); // Log để kiểm tra dữ liệu gửi đi

  // Gửi yêu cầu PUT đến server để cập nhật giỏ hàng của khách hàng
  return this.http.put(`${this.apiUrl}/customers/phone/${phone}/cart`, { cart: cartItemsToSync });
}

}
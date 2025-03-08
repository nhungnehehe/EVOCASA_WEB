import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Customer, ICustomer, CartItem1 } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  // Đường dẫn API base
  private apiUrl = 'http://localhost:3002/customer'; // Thay đổi URL tùy theo server của bạn
  
  // HTTP options mặc định
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  // Lấy tất cả khách hàng
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`)
      .pipe(
        tap(_ => console.log('Fetched all customers')),
        catchError(this.handleError<Customer[]>('getAllCustomers', []))
      );
  }

  // Lấy khách hàng theo ID
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customer/${id}`)
      .pipe(
        tap(_ => console.log(`Fetched customer id=${id}`)),
        catchError(this.handleError<Customer>('getCustomerById'))
      );
  }

  // Lấy khách hàng theo số điện thoại
  getCustomerByPhone(phone: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${phone}`)
      .pipe(
        tap(_ => console.log(`Fetched customer with phone=${phone}`)),
        catchError(this.handleError<Customer>('getCustomerByPhone'))
      );
  }

  // Lấy khách hàng theo email (dùng cho đăng nhập)
  getCustomerByEmail(email: string): Observable<Customer> {
    // Vì API không có sẵn endpoint tìm theo email, chúng ta có thể lấy tất cả và lọc
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

  // Đăng nhập bằng email/phone và mật khẩu
  login(emailOrPhone: string, password: string): Observable<Customer | null> {
    // Kiểm tra xem đầu vào có phải là email hay không
    const isEmail = emailOrPhone.includes('@');
    
    let searchMethod: Observable<Customer>;
    if (isEmail) {
      searchMethod = this.getCustomerByEmail(emailOrPhone);
    } else {
      searchMethod = this.getCustomerByPhone(emailOrPhone);
    }

    return searchMethod.pipe(
      map(customer => {
        if (customer && customer.Password === password) {
          const result = { ...customer };
          return result;
        }
        return null;
      }),
      catchError(this.handleError<Customer | null>('login', null))
    );
  }

  // Tạo khách hàng mới (đăng ký)
  registerCustomer(customer: ICustomer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer, this.httpOptions)
      .pipe(
        tap((newCustomer: Customer) => console.log(`Added customer w/ id=${newCustomer._id}`)),
        catchError(this.handleError<Customer>('registerCustomer'))
      );
  }

  // Cập nhật thông tin khách hàng
  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${customer._id}`, customer, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Updated customer id=${customer._id}`)),
        catchError(this.handleError<Customer>('updateCustomer'))
      );
  }

  // Cập nhật giỏ hàng của khách hàng
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

  // Thêm sản phẩm vào giỏ hàng
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

  // Xóa khách hàng
  deleteCustomer(customerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${customerId}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Deleted customer id=${customerId}`)),
        catchError(this.handleError<any>('deleteCustomer'))
      );
  }

  // Xử lý lỗi
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      return of(result as T);
    };
  }
}
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CartItem } from '../interfaces/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:3002';
  cartCountChanged = new EventEmitter<number>(); // EventEmitter để thông báo số lượng giỏ hàng thay đổi

  constructor(private http: HttpClient) {}

  // Lấy danh sách các sản phẩm trong giỏ hàng
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.baseUrl}/cart`, { withCredentials: true }).pipe(
      tap((cartItems) => this.emitCartCount(cartItems)), 
      catchError(this.handleError)
    );
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(productId: string, quantity: number): Observable<CartItem[]> {
    return this.http.post<CartItem[]>(
      `${this.baseUrl}/cart`,
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap((cartItems) => this.emitCartCount(cartItems)), 
      catchError(this.handleError)
    );
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem(productId: string, quantity: number): Observable<CartItem[]> {
    return this.http.put<CartItem[]>(
      `${this.baseUrl}/cart`,
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap((cartItems) => this.emitCartCount(cartItems)), 
      catchError(this.handleError)
    );
  }

  // Xóa một sản phẩm khỏi giỏ hàng
  removeCartItem(productId: string): Observable<CartItem[]> {
    return this.http.delete<CartItem[]>(`${this.baseUrl}/cart/${productId}`, { withCredentials: true }).pipe(
      tap((cartItems) => this.emitCartCount(cartItems)),
      catchError(this.handleError)
    );
  }

  // Xóa toàn bộ giỏ hàng
  removeAllCart(): Observable<CartItem[]> {
    return this.http.delete<CartItem[]>(`${this.baseUrl}/cart`, { withCredentials: true }).pipe(
      tap(() => this.cartCountChanged.emit(0)), // Phát sự kiện giỏ hàng trống
      catchError(this.handleError)
    );
  }

  // Cập nhật tổng số lượng giỏ hàng
  updateCartCount(): void {
    this.getCartItems().subscribe({
      next: (cartItems) => this.emitCartCount(cartItems),
      error: (err) => console.error('Error updating cart count:', err),
    });
  }

  // Phát sự kiện cập nhật số lượng giỏ hàng
  private emitCartCount(cartItems: CartItem[]): void {
    const totalCount = cartItems.reduce((total, item) => total + (item.cartQuantity || 0), 0);
    console.log('Cart updated, total items:', totalCount); // Log 
    this.cartCountChanged.emit(totalCount); 
  }

  // Hàm xử lý lỗi
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Lỗi client
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Lỗi  server
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import { CartItem } from '../interfaces/cart';


@Injectable({
  providedIn: 'root'
})
export class CartpaymentService {

  public paymentCart: CartItem[] = [];  // Giỏ thanh toán

  // Thêm sản phẩm vào giỏ thanh toán
    addToCartPayment(product: CartItem): void {
    // Kiểm tra nếu sản phẩm chưa có trong giỏ thanh toán
    if (!this.paymentCart.some((item) => item.productId === product.productId)) {
      this.paymentCart.push(product);
    }
  }

  // Xóa sản phẩm khỏi giỏ thanh toán
  removeFromCartPayment(productId: string): void {
    // Tìm và xóa sản phẩm khỏi giỏ thanh toán
    this.paymentCart = this.paymentCart.filter((item) => item.productId !== productId);
  }

  // Lấy danh sách các sản phẩm trong giỏ thanh toán
  getCartPaymentItems(): CartItem[] {
    return this.paymentCart;
  }

  // Cập nhật số lượng sản phẩm trong giỏ thanh toán
  updateProductQuantity(productId: string, quantity: number): void {
    const product = this.paymentCart.find(item => item.productId === productId);
    if (product && quantity > 0) {
      product.cartQuantity = quantity;
    }
  }

  // Tính tổng số lượng sản phẩm trong giỏ thanh toán
  getTotalQuantity(): number {
    return this.paymentCart.reduce((total, item) => total + item.cartQuantity, 0);
  }

  // Tính tổng giá trị giỏ thanh toán
  getTotalAmount(): number {
    return this.paymentCart.reduce((total, item) => total + (item.cartQuantity * item.Price), 0);
  }
}
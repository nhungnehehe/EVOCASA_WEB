import { Injectable } from '@angular/core';
import { CartItem } from '../interfaces/cart';
import { Product } from '../interfaces/product';
import { CartItem1 } from '../interfaces/customer';


@Injectable({
  providedIn: 'root'
})
export class CartpaymentService {
  private selectedProducts: Product[] = [];
  private selectedProductIds: Set<string> = new Set();

  public paymentCart: CartItem[] = [];  // Giỏ thanh toán

  // Thêm sản phẩm vào giỏ thanh toán
  addToCartPayment1(productId: string, product: CartItem): void {
    // Kiểm tra nếu sản phẩm chưa có trong giỏ thanh toán
    if (!this.paymentCart.some((item) => item.productId === product.productId)) {
      this.paymentCart.push(product);
    }
  }

  // Xóa sản phẩm khỏi giỏ thanh toán
  removeFromCartPayment1(productId: string): void {
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
  // Lưu các sản phẩm đã chọn vào service
  // Lưu các sản phẩm đã chọn vào service
  setSelectedProducts(productIds: string[]): void {
    this.selectedProductIds = new Set(productIds); // Chuyển từ mảng sang Set để đảm bảo không trùng lặp
  }

  // Lấy các sản phẩm đã chọn từ service
  getSelectedProducts(): Set<string> {
    return this.selectedProductIds; // Trả về Set các productId đã được chọn
  }

  
  // Thêm một sản phẩm vào danh sách đã chọn
  addToCartPayment(productId: string,product: CartItem): void {
    this.selectedProductIds.add(productId);
    if (!this.paymentCart.some((item) => item.productId === product.productId)) {
      this.paymentCart.push(product);
  }
}

  // Xóa một sản phẩm khỏi danh sách đã chọn
  removeFromCartPayment(productId: string): void {
    this.selectedProductIds.delete(productId);
    this.paymentCart = this.paymentCart.filter((item) => item.productId !== productId);
  }
  // Tính tổng giá trị cho từng sản phẩm trong giỏ
  getProductTotal(productId: string): number {
    const product = this.paymentCart.find(item => item.productId === productId);
    if (product) {
      return product.cartQuantity * product.Price;
    }
    return 0; // Return 0 if the product is not found
  }
   // Tính tổng giá trị đơn hàng gồm tổng tiền, thuế bán hàng và phí giao hàng
   getTotalOrder(): { totalAmount: number, saleTax: number, deliveryFee: number, totalOrder: number } {
    const totalAmount = this.getTotalAmount();
    const saleTax = totalAmount * 0.08; // Thuế bán hàng 8%
    const deliveryFee = 50; // Phí giao hàng cố định
    const totalOrder = totalAmount + saleTax + deliveryFee; // Tổng đơn hàng

    return {
      totalAmount,
      saleTax,
      deliveryFee,
      totalOrder
    };
  }

  clearCartPayment(): void {
    this.paymentCart = []; // Xóa toàn bộ giỏ thanh toán
    this.selectedProductIds.clear(); // Xóa danh sách ID sản phẩm đã chọn
    console.log("Giỏ hàng thanh toán đã được xóa.");
  }
  
}
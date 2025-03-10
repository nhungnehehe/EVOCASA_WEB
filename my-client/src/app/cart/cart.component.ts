import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartpaymentService } from '../services/cartpayment.service'; 
import { CartItem } from '../interfaces/cart'


@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})

export class CartComponent implements OnInit {
  // Danh sách sản phẩm trong giỏ hàng
  products: CartItem[] = [];  // Danh sách sản phẩm trong giỏ hàng
  selectedProductIds: Set<string> = new Set();
  constructor(
    private cartService: CartService,
    public cartpaymentService: CartpaymentService  
  ) {}

  total: number = 0; // Tổng giỏ hàng
  totalQuantity: number = 0; // Tổng số lượng sản phẩm trong giỏ hàng

  // Kiểm tra giỏ hàng có trống hay không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }

  // Lấy danh sách sản phẩm trong giỏ hàng
  loadProducts(): void {
    this.cartService.getCartItems().subscribe({
    next: (data) => {
    this.products = data.map((product) => {
    // Kiểm tra nếu sản phẩm có hình ảnh dưới dạng chuỗi JSON
      if (product.Image && typeof product.Image === 'string') {
        try {
        const images = JSON.parse(product.Image)// Phân tích chuỗi JSON thành mảng
        product.Image = images[0];   // Lấy hình ảnh đầu tiên từ mảng
            } 
        catch (e) { 
        console.error('Error parsing images for product:', product.Name, e);
        product.Image = '';  // Nếu có lỗi, để hình ảnh rỗng
        }
        }
        return product;
        });
      },
        error: (err) => {console.error('Error loading cart:', err); }
        });
      }
      loadSelectedProducts(): void {
        // Lấy lại các productId đã chọn từ CartpaymentService khi quay lại trang giỏ hàng
        this.selectedProductIds = this.cartpaymentService.getSelectedProducts();
      }
    
    ngOnInit(): void {
      // Lấy sản phẩm trong giỏ hàng khi component khởi tạo
      this.loadProducts(); // Thay vì lặp lại code trong ngOnInit, gọi hàm loadProducts()
      // this.updateCartPaymentSummary(); // Lấy thông tin tổng số lượng và tổng tiền của CartPaymentService
      this.loadSelectedProducts();
      this.updateCartPaymentSummary();
    }
    isProductSelected(productId: string): boolean {
      return this.selectedProductIds.has(productId); // Kiểm tra xem sản phẩm có được chọn không
    }
   // Cập nhật số lượng sản phẩm
   changeQuantity(action: string, productId: string): void {
    const product = this.products.find((p) => p.productId === productId);
    if (!product) return;  // Kiểm tra xem sản phẩm có tồn tại trong giỏ không

    if (action === 'increase') {
      product.cartQuantity++;  // Tăng số lượng sản phẩm
    } else if (action === 'decrease' && product.cartQuantity > 1) {
      product.cartQuantity--;  // Giảm số lượng sản phẩm nếu lớn hơn 1
    } else if (action === 'decrease' && product.cartQuantity === 1) {
      this.removeProduct(productId);  // Nếu số lượng là 1, xóa sản phẩm khỏi giỏ
      return;
    }
    this.updateCartPaymentSummary();
    // Gọi phương thức updateCartItem để cập nhật số lượng lên server
    this.cartService.updateCartItem(product.productId, product.cartQuantity).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error('Error updating item quantity:', err);
      }
    });
  }

  // Cập nhật số lượng sản phẩm từ input
  updateQuantity(event: any, productId: string): void {
    const newQuantity = event.target.value;  // Lấy giá trị mới từ input
    const product = this.products.find((p) => p.productId === productId);

    if (product && newQuantity >= 1) {
      
      // Cập nhật số lượng trong giỏ
      this.cartService.updateCartItem(product.productId, parseInt(newQuantity, 10)).subscribe({
        next: () => {
          product.cartQuantity = parseInt(newQuantity, 10);  // Cập nhật số lượng trong giỏ
        },
        error: (err) => {
          console.error('Error updating item quantity:', err);
        }
      });
    }
  }

  // Xóa sản phẩm khi nhấn "Remove"
  removeProduct(productId: string): void {
    const index = this.products.findIndex((p) => p.productId === productId);
    if (index !== -1) {
      this.products.splice(index, 1); // Xóa sản phẩm khỏi giỏ hàng
      this.cartpaymentService.removeFromCartPayment(productId);
      this.updateCartPaymentSummary(); // Cập nhật tổng tiền và số lượng
      this.cartService.removeCartItem(productId);
       // Gọi API để xóa sản phẩm khỏi server
    this.cartService.removeCartItem(productId).subscribe({
      next: () => {
        console.log(`Product ${productId} removed successfully`);
      },
      error: (err) => {
        console.error('Error removing product:', err);
      }
    })
  }
}


onCheckboxChange(event: any, product: CartItem): void {
  const productId = product.productId.toString(); // Đảm bảo productId là chuỗi
  if (event.target.checked) {
    this.selectedProductIds.add(productId);
    this.cartpaymentService.addToCartPayment(productId, product);
  } else {
    this.selectedProductIds.delete(productId);
    this.cartpaymentService.removeFromCartPayment(productId);
  }
  this.updateCartPaymentSummary();
}

  // Cập nhật tổng số lượng và tổng số tiền từ CartPaymentService
  updateCartPaymentSummary(): void {
    this.totalQuantity = this.cartpaymentService.getTotalQuantity(); // Lấy tổng số lượng sản phẩm từ CartPaymentService
    this.total = this.cartpaymentService.getTotalAmount(); // Lấy tổng số tiền từ CartPaymentService
  }
 }
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})

export class CartComponent implements OnInit {
  // Danh sách sản phẩm trong giỏ hàng
  products = [
    { id: 'product-1', name: 'Adjustable Drafting Table', price: 64504, quantity: 1, image: 'https://via.placeholder.com/100' },
    { id: 'product-2', name: 'Adjustable Drafting Table', price: 120, quantity: 2, image: 'https://via.placeholder.com/100' },
    { id: 'product-3', name: 'Adjustable Drafting Table', price: 204, quantity: 1, image: 'https://via.placeholder.com/100' }
  ];

  total: number = 0; // Tổng giỏ hàng
  totalQuantity: number = 0; // Tổng số lượng sản phẩm trong giỏ hàng

  // Kiểm tra giỏ hàng có trống hay không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }

  ngOnInit(): void {
    this.updateTotal(); // Cập nhật tổng tiền khi trang tải
    this.updateTotalQuantity(); // Cập nhật tổng số lượng sản phẩm khi trang tải
  }

  // Thay đổi số lượng sản phẩm khi nhấn các nút
  changeQuantity(action: string, productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (action === 'increase') {
      product.quantity++;
    } else if (action === 'decrease' && product.quantity > 1) {
      product.quantity--;
    } else if (action === 'decrease' && product.quantity === 1) {
      this.removeProduct(productId);
      return;
    }

    this.updateTotal();
    this.updateTotalQuantity();
  }

  // Cập nhật số lượng sản phẩm từ input
  updateQuantity(event: any, productId: string): void {
    const newQuantity = event.target.value;
    const product = this.products.find(p => p.id === productId);
    if (product && newQuantity >= 1) {
      product.quantity = parseInt(newQuantity, 10);
    }
    this.updateTotal();
    this.updateTotalQuantity();
  }

  // Xóa sản phẩm khi nhấn "Remove"
  removeProduct(productId: string): void {
    const index = this.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      this.products.splice(index, 1); // Xóa sản phẩm khỏi giỏ hàng
    }
    this.updateTotal();
    this.updateTotalQuantity();
  }
 // Cập nhật tổng số lượng sản phẩm
 updateTotalQuantity(): void {
  this.totalQuantity = this.products.reduce((sum, product) => sum + product.quantity, 0);
}
  // Cập nhật tổng giỏ hàng
  updateTotal(): void {
    this.total = this.products.reduce((acc, product) => acc + (product.quantity * product.price), 0);
  }
}

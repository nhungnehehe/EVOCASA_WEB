import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  products = [
    { id: 'product-1', name: 'Product 1', price: 6500, quantity: 1, image: 'https://via.placeholder.com/100' },
    { id: 'product-2', name: 'Product 2', price: 7500, quantity: 1, image: 'https://via.placeholder.com/100' }
  ];
  total: number = 0;
  isCartVisible: boolean = true; // Giỏ hàng có thể hiển thị hay không

  ngOnInit(): void {
    this.updateTotal();  // Cập nhật tổng giỏ hàng khi trang tải
  }

  // Hàm để thay đổi số lượng sản phẩm khi nhấn các nút
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
  }

  // Hàm xóa sản phẩm khi nhấn "-" và số lượng = 1
  removeProduct(productId: string): void {
    const index = this.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      this.products.splice(index, 1);  // Xóa sản phẩm khỏi giỏ hàng
    }
    this.updateTotal();  // Cập nhật lại tổng giỏ hàng sau khi xóa sản phẩm
  }

  // Cập nhật tổng giỏ hàng
  updateTotal(): void {
    this.total = this.products.reduce((acc, product) => acc + (product.quantity * product.price), 0);
  }

  // Hàm để mở giỏ hàng
  openCart(): void {
    this.isCartVisible = true;
  }

  // Hàm để đóng giỏ hàng
  closeCart(): void {
    this.isCartVisible = false;
  }

  // Hàm để kiểm tra có sản phẩm không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }
}

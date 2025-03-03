import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  // Danh sách sản phẩm trong giỏ hàng
  products = [
    { id: 'product-1', name: 'Product 1', price: 6500, quantity: 1, image: 'https://via.placeholder.com/100' },
    { id: 'product-2', name: 'Product 2', price: 7500, quantity: 1, image: 'https://via.placeholder.com/100' }
  ];

  total: number = 0; // Tổng giỏ hàng
  isCartVisible: boolean = true; // Giỏ hàng có hiển thị hay không

  // Kiểm tra giỏ hàng có trống hay không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }

  ngOnInit(): void {
    this.updateTotal(); // Cập nhật tổng giỏ hàng khi trang tải
  }

  // Thay đổi số lượng sản phẩm khi nhấn các nút
  changeQuantity(action: string, productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Tăng hoặc giảm số lượng sản phẩm
    if (action === 'increase') {
      product.quantity++;
    } else if (action === 'decrease' && product.quantity > 1) {
      product.quantity--;
    } else if (action === 'decrease' && product.quantity === 1) {
      this.removeProduct(productId); // Xóa sản phẩm khi số lượng giảm xuống 0
      return;
    }

    // Cập nhật tổng giỏ hàng
    this.updateTotal();
  }

  // Xóa sản phẩm khi số lượng = 0
  removeProduct(productId: string): void {
    const index = this.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      this.products.splice(index, 1); // Xóa sản phẩm khỏi giỏ hàng
    }
    this.updateTotal(); // Cập nhật lại tổng giỏ hàng sau khi xóa sản phẩm
  }

  // Cập nhật tổng giỏ hàng
  updateTotal(): void {
    this.total = this.products.reduce((acc, product) => acc + (product.quantity * product.price), 0);
  }

  // Hàm để mở giỏ hàng
  openCart(): void {
    this.isCartVisible = true;
    const cartDrawer = document.getElementById('mini-cart');
    const overlay = document.querySelector('.drawer__overlay');

    if (cartDrawer && overlay) {
      cartDrawer.classList.add('slide-in'); // Thêm class 'slide-in' để mở giỏ hàng
      overlay.classList.add('open');  // Hiển thị overlay
    }
  }

  // Hàm để đóng giỏ hàng
  closeCart(): void {
    this.isCartVisible = false;
    const cartDrawer = document.getElementById('mini-cart');
    const overlay = document.querySelector('.drawer__overlay');

    if (cartDrawer && overlay) {
      cartDrawer.classList.add('slide-out'); // Thêm class 'slide-out' để đóng giỏ hàng
      overlay.classList.remove('open');  // Ẩn overlay
    }

    // Sau khi animation hoàn thành, ẩn giỏ hàng
    cartDrawer?.addEventListener('animationend', () => {
      cartDrawer.classList.add('hidden');
    });
  }
}


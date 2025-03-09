import { Component, OnInit } from '@angular/core';
import { CartItem } from '../interfaces/cart';
import { CartService } from '../services/cart.service';



@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  // Danh sách sản phẩm trong giỏ hàng
  products: CartItem[] = [];  // Danh sách sản phẩm trong giỏ hàng

  total: number = 0; // Tổng giỏ hàng
  isCartVisible: boolean = true; // Giỏ hàng có hiển thị hay không

  constructor(
      private cartService: CartService,
    ) {}

 // Kiểm tra giỏ hàng có trống hay không
 get isEmpty(): boolean {
  return this.products.length === 0;
}

// Lấy danh sách sản phẩm trong giỏ hàng
loadProducts(): void {
  this.cartService.getCartItems().subscribe({
    next: (data) => {
      this.products = data.map((product) => {
        if (product.Image && typeof product.Image === 'string') {
          try {
            const images = JSON.parse(product.Image);
            product.Image = images[0];  // Lấy hình ảnh đầu tiên từ mảng
          } catch (e) { 
            console.error('Error parsing images for product:', product.Name, e);
            product.Image = '';  // Nếu có lỗi, để hình ảnh rỗng
          }
        }
        return product;
      });

      // GỌI `updateTotal()` Ở ĐÂY ĐỂ CẬP NHẬT GIÁ SAU KHI DỮ LIỆU ĐƯỢC TẢI
      this.updateTotal();
    },
    error: (err) => {
      console.error('Error loading cart:', err);
    }
  });
}
    
    ngOnInit(): void {
    this.loadProducts(); // Gọi phương thức để lấy danh sách sản phẩm trong giỏ hàng từ API
    this.updateTotal(); // Cập nhật tổng giỏ hàng khi trang tải
  }

  // Thay đổi số lượng sản phẩm khi nhấn các nút
  changeQuantity(action: string, productId: string): void {
    const product = this.products.find(p => p.productId === productId);
    if (!product) return;

    // Tăng hoặc giảm số lượng sản phẩm
    if (action === 'increase') {
      product.cartQuantity++;
    } else if (action === 'decrease' && product.cartQuantity > 1) {
      product.cartQuantity--;
    } else if (action === 'decrease' && product.cartQuantity === 1) {
      this.removeProduct(productId); // Xóa sản phẩm khi số lượng giảm xuống 0
      return;
    }

    // Cập nhật tổng giỏ hàng
    this.updateTotal();
    // Gọi phương thức updateCartItem để cập nhật số lượng lên server
    this.cartService.updateCartItem(product.productId, product.cartQuantity).subscribe({
      next: () => {
      },
      error: (err) => {
        console.error('Error updating item quantity:', err);
      }
    });

  }

  // Xóa sản phẩm khi số lượng = 0
  removeProduct(productId: string): void {
    const index = this.products.findIndex(p => p.productId === productId);
    
    if (index !== -1) {
      this.products.splice(index, 1); // Xóa sản phẩm khỏi giao diện
      this.updateTotal(); // Cập nhật lại tổng giỏ hàng
  
      // 🛠 Gửi yêu cầu API để xóa sản phẩm khỏi giỏ hàng trên server
      this.cartService.removeCartItem(productId).subscribe({
        next: () => {
          console.log(`Product ${productId} removed from cart on server.`);
        },
        error: (err) => {
          console.error('Error removing product from cart:', err);
        }
      });
    }
  }

  // Cập nhật tổng giỏ hàng
  updateTotal(): void {
    this.total = this.products.reduce((acc, product) => acc + (product.cartQuantity * product.Price), 0);
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

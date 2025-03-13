import { Component, OnInit,Input, Output, HostListener, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { CartItem } from '../interfaces/cart';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() isVisible: boolean = false; // Receive sidebar state from parent
  @Output() closeSidebarEvent = new EventEmitter<void>(); // Emit close event to parent

  // Danh sách sản phẩm trong giỏ hàng
  products: CartItem[] = [];  // Danh sách sản phẩm trong giỏ hàng
  total: number = 0; // Tổng giỏ hàng

  constructor(
      private cartService: CartService,
      private router: Router,
      private renderer: Renderer2,
      private elementRef: ElementRef  // Lấy tham chiếu đến sidebar
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
  
      // Gửi yêu cầu API để xóa sản phẩm khỏi giỏ hàng trên server
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

  // Hàm để đóng giỏ hàng
  closeCart(): void {
    // Start the hiding animation first
    this.isHiding = true;
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      this.closeSidebarEvent.emit(); // Emit event to the parent
      document.body.style.overflow = ''; // Allow scrolling
      this.isHiding = false; // Reset for next time
    }, 300); 
  }

  // Only listen for clicks if sidebar is visible
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
  if (this.isVisible && !this.elementRef.nativeElement.contains(event.target as Node)) {
    this.closeCart();
  }
}
    navigateToCart() {
      this.closeCart(); // Đóng sidebar trước
      this.router.navigate(['/cart-page']); // Chuyển đến trang giỏ hàng
    }
    
    
    ngOnChanges() {
      if (this.isVisible) {
        this.renderer.addClass(document.body, 'no-scroll');
        document.body.style.overflow = 'hidden'; // Chặn cuộn khi mở sidebar
        this.loadProducts(); // Gọi phương thức để lấy danh sách sản phẩm trong giỏ hàng từ API
      
        
        if (this.isFirstLoad) {
          setTimeout(() => {
            if (this.isVisible) {
              this.loadProducts();
              this.isFirstLoad = false;
            }
          }, 100);
        } else {
          this.loadProducts();
        }
      } else {
        this.renderer.removeClass(document.body, 'no-scroll');
      }
    }

}
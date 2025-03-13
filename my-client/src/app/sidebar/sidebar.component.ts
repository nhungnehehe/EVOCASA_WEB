import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { CartItem } from '../interfaces/cart';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false; // Receive sidebar state from parent
  @Output() closeSidebarEvent = new EventEmitter<void>(); // Emit close event to parent

  // Add isHiding property to control animation
  isHiding: boolean = false;

  // Danh sách sản phẩm trong giỏ hàng
  products: CartItem[] = [];  // Danh sách sản phẩm trong giỏ hàng
  total: number = 0; // Tổng giỏ hàng
  private hasInitialized = false;
  private isFirstLoad = true;

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

  loadProducts(): void {
    // Chỉ tải sản phẩm khi sidebar thực sự được hiển thị
    if (!this.isVisible) return;
    
    this.cartService.getCartItems().subscribe({
      next: (data) => {
        this.products = this.formatProducts(data);
        this.updateTotal();
        
        // Giải quyết vấn đề với giỏ hàng trống
        if (this.isFirstLoad && this.products.length === 0 && this.isVisible) {
          this.isFirstLoad = false;
          // Nếu đây là lần tải đầu tiên, giỏ hàng trống và sidebar đang hiển thị, tự động đóng nó
          setTimeout(() => {
            if (this.isVisible) {
              this.closeCart();
            }
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }
    
  ngOnInit(): void {
    console.log('Sidebar initialized with isVisible:', this.isVisible);
    this.hasInitialized = true;
    this.isFirstLoad = true;
    
    // Đảm bảo sidebar khởi động ẩn
    if (this.isVisible) {
      // Nếu isVisible được đặt thành true trong quá trình khởi tạo, đặt lại thành false
      setTimeout(() => {
        if (this.isVisible && this.isFirstLoad) {
          this.closeCart();
        }
      }, 0);
    }
  }

  private formatProducts(data: CartItem[]): CartItem[] {
    return data.map((product) => {
      if (product.Image && typeof product.Image === 'string') {
        try {
          const images = JSON.parse(product.Image);
          product.Image = images[0];
        } catch (e) {
          console.error('Error parsing images for product:', product.Name, e);
          product.Image = '';
        }
      }
      return product;
    });
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
    }, 300); // Match this with your CSS transition time
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
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.hasInitialized && changes['isVisible']) {
      console.log('Sidebar isVisible changed to:', this.isVisible);
      
      if (this.isVisible) {
        // When opening the sidebar
        this.isHiding = false; // Reset hiding state
        this.renderer.addClass(document.body, 'no-scroll');
        document.body.style.overflow = 'hidden';
        
        // Load products
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
        // When sidebar is closed
        this.renderer.removeClass(document.body, 'no-scroll');
        document.body.style.overflow = '';
      }
    }
  }
}
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
  isClosing: boolean = false;

  // Danh sách sản phẩm trong giỏ hàng
  products: CartItem[] = [];  // Danh sách sản phẩm trong giỏ hàng
  total: number = 0; // Tổng giỏ hàng
  private hasInitialized = false;
  private isFirstLoad = true;
  public cartContentLoaded = false;
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
    
    // Đánh dấu đang tải dữ liệu
    this.cartContentLoaded = false;
    
    this.cartService.getCartItems().subscribe({
      next: (data) => {
        this.products = this.formatProducts(data);
        this.updateTotal();
        
        // Đánh dấu đã tải xong
        this.cartContentLoaded = true;
        
        // Không nên tự động đóng sidebar khi giỏ hàng trống
        // Xóa đoạn code tự động đóng sidebar ở đây
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.cartContentLoaded = true; // Đảm bảo đánh dấu hoàn thành ngay cả khi có lỗi
      }
    });
  }
  
  resetSidebar() {
    this.products = [];
    this.total = 0;
    this.isHiding = false;
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

  closeCart(): void {
    // Chỉ đặt trạng thái đang đóng
    this.isClosing = true;
    
    // Đợi hiệu ứng hoàn thành trước khi thực sự đóng
    setTimeout(() => {
      this.closeSidebarEvent.emit(); // Thông báo cho component cha
      document.body.style.overflow = ''; // Cho phép cuộn trang
      this.isClosing = false; // Đặt lại trạng thái
    }, 300); // Thời gian transition
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
      if (this.isVisible) {
        // Khi mở sidebar
        this.isClosing = false;
        this.renderer.addClass(document.body, 'no-scroll');
        document.body.style.overflow = 'hidden';
        this.loadProducts();
      } else {
        // Khi đóng sidebar, chỉ reset state mà không thay đổi animation
        this.renderer.removeClass(document.body, 'no-scroll');
        document.body.style.overflow = '';
        
        // Không reset sidebar ngay lập tức
        setTimeout(() => {
          if (!this.isVisible) {
            this.resetSidebar();
          }
        }, 300);
      }
    }
  }
}
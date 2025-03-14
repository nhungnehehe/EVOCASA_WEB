import { Component, OnInit, Input, Output, HostListener, ElementRef, EventEmitter, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { CartItem } from '../interfaces/cart';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { CartItem1 } from '../interfaces/customer';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';  // Import forkJoin từ rxjs
import { ProductService } from '../services/product.service';
import { CartpaymentService } from '../services/cartpayment.service'; 


@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false; // Receive sidebar state from parent
  @Output() closeSidebarEvent = new EventEmitter<void>(); // Emit close event to parent

  currentUserPhone: string | null = null;
  isUserLoggedIn: boolean = false;

  selectedProductIds: Set<string> = new Set();


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
    private userService: UserService,
    private customerService: CustomerService,
    private cartService: CartService,
    private productService: ProductService,
    private cartpaymentService: CartpaymentService,
    private router: Router,
    private renderer: Renderer2,
    private elementRef: ElementRef  // Lấy tham chiếu đến sidebar
  ) {}

  // Kiểm tra giỏ hàng có trống hay không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }

  loadCartByPhone(phone: string) {
    if (!phone || !this.isUserLoggedIn) {
      console.log("❌ Không có số điện thoại hợp lệ hoặc người dùng đã đăng xuất.");
      this.products = []; // Xóa giỏ hàng ngay khi đăng xuất
      this.updateTotal();
      return;
    }
    // if (!phone) return;
    
    console.log("📢 Gọi API lấy giỏ hàng với số điện thoại:", phone);
    this.cartContentLoaded = false;
  
    // Gọi API lấy giỏ hàng từ Database
    this.customerService.getCartByPhone(phone).subscribe(
      (cartItems: CartItem1[]) => {
        console.log("✅ Giỏ hàng từ Database:", cartItems);
  
        if (cartItems.length === 0) {
          console.log("🛒 Giỏ hàng trống!");
          this.products = [];
          this.updateTotal();
          this.cartContentLoaded = true;
          return;
        }
  
        // Gửi request lấy thông tin sản phẩm
        const productRequests = cartItems.map(item =>
          this.productService.getProductDetails(item.productId).pipe(
            map(productDetails => {
              productDetails.cartQuantity = item.cartQuantity;
              return productDetails;
            })
          )
        );
  
        // Gọi API lấy chi tiết sản phẩm
        forkJoin(productRequests).subscribe(
          (products: CartItem[]) => {
            this.products = products;
            this.updateTotal();
            console.log("✅ Đã tải", products.length, "sản phẩm từ database");
            this.cartContentLoaded = true;
          },
          error => {
            console.error('❌ Lỗi khi lấy thông tin sản phẩm:', error);
            this.cartContentLoaded = true;
          }
        );
      },
      error => {
        console.error('❌ Lỗi khi tải giỏ hàng từ database:', error);
        this.cartContentLoaded = true;
      }
    );
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

    this.userService.currentUserPhone$.subscribe((phone: string | null) => {
      const wasLoggedIn = this.isUserLoggedIn;
      this.currentUserPhone = phone;
      this.isUserLoggedIn = !!phone;
    
      if (wasLoggedIn && !this.isUserLoggedIn) {
        console.log("📢 Người dùng đã đăng xuất, xóa giỏ hàng cũ");
        
        this.resetSidebar(); // Xóa giỏ hàng trên giao diện
        
        this.cartService.clearCart().subscribe({
          next: () => {
            console.log("✅ Giỏ hàng trong session đã được xóa.");
            
            if (this.isVisible) {
              setTimeout(() => {
                this.products = [];
                this.loadProducts(); // Load lại giỏ hàng rỗng
              }, 100);
            }
          },
          error: (err) => {
            console.error("❌ Lỗi khi xóa giỏ hàng:", err);
          }
        });
      } else if (this.isVisible && phone) {
        console.log("📢 Người dùng đã đăng nhập, tải giỏ hàng từ database:", phone);
        this.loadCartByPhone(phone);
      } else if (this.isVisible) {
        console.log("⚠ Người dùng chưa đăng nhập, tải giỏ hàng từ session.");
        this.loadProducts();
      }
    });
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

      // 🔥 Nếu khách hàng đã đăng nhập, cập nhật giỏ hàng lên server
  if (this.isUserLoggedIn && this.currentUserPhone) {
    this.updateCustomerCartOnServer();
  }
  }


  // Gửi giỏ hàng của khách hàng lên server để cập nhật database
updateCustomerCartOnServer(): void {
  if (!this.currentUserPhone) return;

  // Lấy giỏ hàng mới để gửi lên server
  const updatedCart = this.products.map(product => ({
    productId: product.productId,
    cartQuantity: product.cartQuantity
  }));

  console.log("📢 Gửi giỏ hàng mới lên server:", updatedCart);

  // Gọi API cập nhật giỏ hàng của khách hàng trên server
  this.customerService.updateCustomerCart(this.currentUserPhone, updatedCart).subscribe({
    next: () => {
      console.log("✅ Giỏ hàng của khách hàng đã được cập nhật trên server.");
    },
    error: (err) => {
      console.error("❌ Lỗi khi cập nhật giỏ hàng trên server:", err);
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
     // 🔥 Nếu khách hàng đã đăng nhập, cập nhật giỏ hàng lên server
     if (this.isUserLoggedIn && this.currentUserPhone) {
      this.updateCustomerCartOnServer();
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

  clearCart(): void {
    this.products = [];
    this.total = 0;
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log("Giỏ hàng đã được xóa thành công");
      },
      error: (err) => {
        console.error("Lỗi khi xóa giỏ hàng:", err);
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.hasInitialized && changes['isVisible']) {
      if (this.isVisible) {
        // Khi mở sidebar
        this.isClosing = false;
        this.renderer.addClass(document.body, 'no-scroll');
        document.body.style.overflow = 'hidden';
        if (this.isUserLoggedIn && this.currentUserPhone) {
          this.loadCartByPhone(this.currentUserPhone);
        } else {
          this.loadProducts();
        }
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
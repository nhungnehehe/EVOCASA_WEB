import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartpaymentService } from '../services/cartpayment.service'; 
import { CartItem } from '../interfaces/cart'
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { CartItem1 } from '../interfaces/customer';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})

export class CartComponent implements OnInit {
  currentUserPhone: string | null = null;
  currentCustomerId: string | null = null;
  isUserLoggedIn: boolean = false;

  // Danh sách sản phẩm trong giỏ hàng
  products: CartItem1[] = [];  // Danh sách sản phẩm trong giỏ hàng
  selectedProductIds: Set<string> = new Set();
  constructor(
    private cartService: CartService,
    public cartpaymentService: CartpaymentService,
    private userService: UserService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  total: number = 0; // Tổng giỏ hàng
  totalQuantity: number = 0; // Tổng số lượng sản phẩm trong giỏ hàng

  // Kiểm tra giỏ hàng có trống hay không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }

  getCustomerId(phone: string) {
    this.customerService.getCustomerByPhone(phone).subscribe(
      (customer) => {
        this.currentUserPhone = customer.Phone;
        this.isUserLoggedIn = true;
        if (customer.Phone) {
          this.loadCart(phone);
          console.log("📢 ID khách hàng:", this.currentCustomerId);
        }
      },
      (error) => {
        this.isUserLoggedIn = false;
        this.loadProducts(); // Nếu không tìm thấy khách hàng, load giỏ hàng từ session
      }
    );
  }
  
  // // Load giỏ hàng từ Database nếu đã đăng nhập
  loadCart(phone: string) {
    console.log("📢 Gọi API lấy giỏ hàng với customerId:", phone);
  
    this.customerService.getCartByCustomerId(phone).subscribe(
      (cartItems: CartItem1[]) => {
        console.log("✅ Giỏ hàng từ Database:", cartItems);
  
        if (cartItems.length === 0) {
          console.log("🛒 Giỏ hàng trống!");
          this.products = [];
          return;
        }
  
    //     // Lấy danh sách productId từ giỏ hàng
    //     const productIds = cartItems.map(item => item.productId);
  
    //     // Gọi API lấy thông tin sản phẩm dựa trên productId
    //     this.customerService.getProductsByIds(productIds).subscribe(
    //       (productDetails: CartItem[]) => {
    //         console.log("📦 Thông tin sản phẩm:", productDetails);
  
    //         // 🔄 Chuyển đổi `CartItem1` thành `CartItem`
    //         this.products = cartItems.map(cartItem => {
    //           const productDetail = productDetails.find(p => p.productId === cartItem.productId);
  
    //           return {
    //             productId: cartItem.productId,
    //             cartQuantity: cartItem.cartQuantity,
    //             category_id: productDetail?.category_id || '',
    //             Name: productDetail?.Name || 'Không có tên',
    //             Price: productDetail?.Price || 0,
    //             Image: productDetail?.Image || '',
    //             Description: productDetail?.Description || '',
    //             Origin: productDetail?.Origin || '',
    //             Uses: productDetail?.Uses || '',
    //             Store: productDetail?.Store || '',
    //             Quantity: productDetail?.Quantity || 0,
    //             Create_date: productDetail?.Create_date || '',
    //             Dimension: productDetail?.Dimension || '',
    //             Story: productDetail?.Story || '',
    //             ProductCare: productDetail?.ProductCare || '',
    //             ShippingReturn: productDetail?.ShippingReturn || '',
    //           } as CartItem;
    //         });
  
    //         this.updateCartPaymentSummary();
    //       },
    //       (error: any) => {
    //         console.error("❌ Lỗi khi lấy thông tin sản phẩm:", error);
    //       }
    //     );
    //   },
    //   (error: any) => {
    //     console.error("❌ Lỗi khi lấy giỏ hàng từ Database:", error);
    //     this.products = [];
      }
    );
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
      this.loadSelectedProducts();
      this.updateCartPaymentSummary();

      // Subscribe để lấy số điện thoại của người dùng khi họ đăng nhập
      this.userService.currentUserPhone$.subscribe((phone: string | null) => {
      this.currentUserPhone = phone;
      this.isUserLoggedIn = !!phone; // Đặt isUserLoggedIn dựa trên việc có phone hay không
    
      if (phone) {
        // Lấy ID khách hàng nếu có số điện thoại
        this.getCustomerId(phone);
        console.log("📢 Người dùng đã đăng nhập với số điện thoại:", phone);
      } else {
        // Nếu chưa đăng nhập, load giỏ hàng từ session
        console.log("⚠ Người dùng chưa đăng nhập, tải giỏ hàng từ session.");
        this.loadProducts();
      }
    });

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
    this.cartpaymentService.updateProductQuantity(productId, product.cartQuantity); 
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
          this.cartpaymentService.updateProductQuantity(productId, product.cartQuantity);
          this.updateCartPaymentSummary();
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

  
  // Xử lý khi người dùng nhấn nút Checkout
  onCheckout(): void {
    if (this.isUserLoggedIn) {
      this.router.navigate(['/payment-shipping']);
    } else {
      this.router.navigate(['/login-page'], { queryParams: { returnUrl: '/payment-shipping' } });
    }
  }

 }
import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartpaymentService } from '../services/cartpayment.service'; 
import { CartItem } from '../interfaces/cart'
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { CartItem1 } from '../interfaces/customer';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';  // Import forkJoin từ rxjs
import { ProductService } from '../services/product.service';



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
  products: CartItem[] = [];  // Danh sách sản phẩm trong giỏ hàng
  items: CartItem1[] = [];  // Danh sách sản phẩm trong giỏ hàng customer
  selectedProductIds: Set<string> = new Set();
  constructor(
    private cartService: CartService,
    public cartpaymentService: CartpaymentService,
    private userService: UserService,
    private customerService: CustomerService,
    private productService: ProductService,
    private router: Router
  ) {}

  total: number = 0; // Tổng giỏ hàng
  totalQuantity: number = 0; // Tổng số lượng sản phẩm trong giỏ hàng

  // Kiểm tra giỏ hàng có trống hay không
  get isEmpty(): boolean {
    return this.products.length === 0;
  }
  

  loadCartByPhone(phone: string) {
    console.log("📢 Gọi API lấy giỏ hàng với số điện thoại:", phone);
  
    // 📌 Lấy danh sách sản phẩm đã chọn từ cartpaymentService
    const selectedCartItems = this.cartpaymentService.getCartPaymentItems().map(item => ({
      productId: item.productId,
      cartQuantity: item.cartQuantity
    }));
    console.log("🛒 Sản phẩm đã chọn từ cartpaymentService:", selectedCartItems);
  
    // 📌 Gọi API lấy giỏ hàng từ Database
    this.customerService.getCartByPhone(phone).subscribe(
      (cartItems: CartItem1[]) => {
        console.log("✅ Giỏ hàng từ Database:", cartItems);
  
        if (cartItems.length === 0 && selectedCartItems.length === 0) {
          console.log("🛒 Giỏ hàng trống!");
          this.products = [];
          this.updateCartPaymentSummary();
          return;
        }
  
        // 🔀 Kết hợp giỏ hàng từ Database và cartpaymentService, loại bỏ sản phẩm trùng
        const combinedCartMap = new Map();
  
        // Thêm sản phẩm từ Database
        cartItems.forEach(item => {
          combinedCartMap.set(item.productId, item);
        });
  
        // Thêm sản phẩm từ cartpaymentService (nếu chưa có)
        selectedCartItems.forEach(item => {
          if (!combinedCartMap.has(item.productId)) {
            combinedCartMap.set(item.productId, item);
          }
        });
  
        const combinedCartItems = Array.from(combinedCartMap.values());
        console.log("🔀 Giỏ hàng kết hợp (loại trùng lặp):", combinedCartItems);
  
        // 📌 Cập nhật giỏ hàng mới lên server
        this.customerService.updateCustomerCart(phone, combinedCartItems).subscribe(
          () => console.log("✅ Giỏ hàng đã được cập nhật lên server."),
          error => console.error("❌ Lỗi khi cập nhật giỏ hàng lên server:", error)
        );
  
        // 📌 Gửi request lấy thông tin sản phẩm
        const productRequests = combinedCartItems.map(item =>
          this.productService.getProductDetails(item.productId).pipe(
            map(productDetails => {
              productDetails.cartQuantity = item.cartQuantity;
              return productDetails;
            })
          )
        );
  
        // 📌 Gọi API lấy chi tiết sản phẩm
        forkJoin(productRequests).subscribe(
          (products: CartItem[]) => {
            this.products = products; // Cập nhật danh sách sản phẩm
  
            // Cập nhật selectedProductIds và cartpaymentService nếu sản phẩm chưa tồn tại
            products.forEach(product => {
              const productId = product.productId.toString();
              if (!this.selectedProductIds.has(productId)) {
                this.selectedProductIds.add(productId);
                this.cartpaymentService.addToCartPayment(productId, product);
              }
            });
  
            this.updateCartPaymentSummary();
          },
          error => {
            console.error('❌ Lỗi khi lấy thông tin sản phẩm:', error);
          }
        );
      },
      error => {
        console.error('❌ Lỗi khi tải giỏ hàng từ database:', error);
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

      this.userService.currentUserPhone$.subscribe((phone: string | null) => {
        this.currentUserPhone = phone;
        this.isUserLoggedIn = !!phone;
      
        if (phone) {
          this.loadCartByPhone(phone);
  
          console.log("📢 Người dùng đã đăng nhập với số điện thoại:", phone);
        } else {
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
   // 🔥 Nếu khách hàng đã đăng nhập, cập nhật giỏ hàng lên server
   if (this.isUserLoggedIn && this.currentUserPhone) {
    this.updateCustomerCartOnServer();
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
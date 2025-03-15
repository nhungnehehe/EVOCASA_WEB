import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AppComponent } from '../app.component';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { SearchService } from '../services/search.service';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  quantity: number = 0;
  displayedQuantity: string = '';  // Initialize as empty string, not '0'
  currentUserName: string = '';
  isUserLoggedIn: boolean = false;
  currentUserPhone: string | null = null;


  searchTerm: string = '';  // Từ khóa tìm kiếm
  searchResults: any[] = [];  // Kết quả tìm kiếm

  constructor(
    private cartService: CartService,
    private appComponent: AppComponent,
    private customerService: CustomerService,
    private userService: UserService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
    // Theo dõi trạng thái đăng nhập
    this.userService.currentUserPhone$.subscribe((phone: string | null) => {
      this.isUserLoggedIn = !!phone;
      this.currentUserPhone = phone;
      this.updateCartQuantity();
    });

    // Lắng nghe thay đổi số lượng giỏ hàng
    this.cartService.cartCountChanged.subscribe(() => {
      this.updateCartQuantity();
    });
    // Lắng nghe sự kiện giỏ hàng thay đổi từ CustomerService
    this.customerService.getCartUpdatedListener().subscribe(() => {
      this.updateCartQuantity();
    });

    // Cập nhật số lượng giỏ hàng ban đầu
    this.updateCartQuantity();

    // Subscribe vào UserService để nhận currentUserName khi login cập nhật
    this.userService.currentUserName$.subscribe((name: string) => {
      this.currentUserName = name.toUpperCase();
    });
  }
  // Hàm tìm kiếm
  search(): void {
    if (this.searchTerm.trim()) {
      this.searchService.search(this.searchTerm).subscribe(
        (results) => {
          console.log("Dữ liệu tìm kiếm nhận được:", results);
          if (results.length === 0) {
            this.searchResults = [
              {
                name: "⚠️ No matching products found.",
                price: null,
                link: null,
                image: "assets/images/not-found.png", // Ảnh mặc định nếu không tìm thấy sản phẩm
                isPlaceholder: true
              }
            ];
          } else {
            this.searchResults = results.map((product) => {
              // Log mảng ảnh để kiểm tra
              console.log("Mảng ảnh của sản phẩm:", product.image);
              if (product.image && typeof product.image === 'string') {
                try {
                  const images = JSON.parse(product.image);  // Parse mảng nếu Image là chuỗi JSON
                  if (Array.isArray(images) && images.length > 0) {
                    product.image = images[0];  // Lấy hình ảnh đầu tiên từ mảng nếu mảng không rỗng
                  } else {
                    product.image = '';  // Nếu mảng ảnh rỗng, gán giá trị rỗng
                  }
                } catch (e) {
                  console.error('Error parsing images for product:', product.Name, e);
                  product.image = '';  // Nếu có lỗi khi parse, để hình ảnh rỗng
                }
              } else {
                product.image = '';  // Nếu không có ảnh, gán giá trị rỗng
              }
  
              console.log("Ảnh được chọn:", product.image);  // Kiểm tra ảnh đã được chọn
              return product;
            });
          }
        },
        (error) => {
          console.error("Lỗi khi tìm kiếm:", error);
          this.searchResults = [
            {
              name: "⚠️ No matching products found.",
              price: null,
              link: null,
              image: "assets/images/not-found.png", // Ảnh mặc định khi xảy ra lỗi
              isPlaceholder: true
            }
          ];
        }
      );
    } else {
      this.searchResults = [];
    }
  }


  selectProduct(product: any): void {
    // Ví dụ: Chuyển hướng đến trang chi tiết sản phẩm
    window.location.href = product.link;
  }

  updateCartQuantity(): void {
    if (this.isUserLoggedIn && this.currentUserPhone) {
      // Nếu đã đăng nhập, lấy số lượng từ giỏ hàng trong database
      this.customerService.getCartByPhone(this.currentUserPhone).subscribe(cart => {
        this.quantity = this.customerService.countTotalQuantity(cart);
        this.updateDisplayedQuantity();
      });
    } else {
      // Nếu chưa đăng nhập, lấy số lượng từ session cart
      this.cartService.getCartItems().subscribe(cart => {
        this.quantity = cart.reduce((total, item) => total + item.cartQuantity, 0); // Calculate total quantity
        this.updateDisplayedQuantity();
      });
    }
  }

  updateDisplayedQuantity(): void {
    if (this.quantity <= 0) {
      this.displayedQuantity = '';
    } else if (this.quantity > 99) {
      this.displayedQuantity = '99+';
    } else {
      this.displayedQuantity = this.quantity.toString();
    }
  }


  openSidebar(): void {
    this.appComponent.openSidebar();
  }
}
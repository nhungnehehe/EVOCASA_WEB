import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AppComponent } from '../app.component';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';


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


  constructor(
    private cartService: CartService,
    private appComponent: AppComponent,
    private customerService: CustomerService,
    private userService: UserService
  ) {}

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
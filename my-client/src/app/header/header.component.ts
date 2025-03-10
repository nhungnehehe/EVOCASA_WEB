import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AppComponent } from '../app.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']  // Dùng mảng như đã chỉ
})
export class HeaderComponent implements OnInit {
  quantity: number = 0;
  displayedQuantity: string = '0';
  currentUserName: string = '';

  constructor(
    private cartService: CartService,
    private appComponent: AppComponent,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Lắng nghe sự thay đổi số lượng trong giỏ hàng
    this.cartService.cartCountChanged.subscribe((count: number) => {
      this.quantity = count;
      this.updateDisplayedQuantity();
    });
    this.cartService.updateCartCount();

    // Subscribe vào UserService để nhận currentUserName khi login cập nhật
    this.userService.currentUserName$.subscribe((name: string) => {
      this.currentUserName = name;
    });
  }

  updateDisplayedQuantity(): void {
    if (this.quantity === 0) {
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
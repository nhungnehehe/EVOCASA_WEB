import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';
import { DatePipe } from '@angular/common';
import { CartItem1 } from '../interfaces/customer';
import { ProductService } from '../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Inject } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-manage-account',
  standalone: false,
  templateUrl: './manage-account.component.html',
  styleUrl: './manage-account.component.css'
})
export class ManageAccountComponent {
  currentUserName: string | null = null;
  currentUserPhone: string | null = null;
  customerInfo: any;
  formattedDOB: string | null = null;
  cartItems: CartItem1[] = [];  // Mảng giỏ hàng

  constructor(
    private router: Router,
    private userService: UserService,
    private customerService: CustomerService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private overlay: Overlay
  ) {}

  ngOnInit() {
    // Subscribe vào currentUserPhone$
    this.userService.currentUserPhone$.subscribe((phone: string) => {
      this.currentUserPhone = phone;
      if (this.currentUserPhone) {
        // Sau khi lấy số điện thoại, gọi API để lấy thông tin khách hàng
        this.customerService.getCustomerByPhone(this.currentUserPhone).subscribe(
          (data: any) => {
            this.customerInfo = data.data; // Lưu thông tin khách hàng vào biến
            this.currentUserName = this.customerInfo.Name; // Lưu tên người dùng

            this.formattedDOB = this.datePipe.transform(this.customerInfo.DOB, 'dd/MM/yyyy');

          },
          (error) => {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
          }
        );
      }
    });
  }

  signOut(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop',
      disableClose: false,
      autoFocus: true,
      // Prevent scroll strategy from blocking/unblocking scroll
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userService.clearCurrentUser(); 
        this.router.navigate(['/']);
      }
    });
  }
  

}

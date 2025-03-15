import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { OrderService } from '../services/order.service';
import { CustomerService } from '../services/customer.service';
import { Order } from '../interfaces/order';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
@Component({
  selector: 'app-order-tracking',
  standalone: false,
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent {
  currentUserName: string | null = null;
  currentUserPhone: string | null = null;
  customerInfo: any;
  orders: Order[] = []; 

  constructor (
    private router: Router,
    private userService: UserService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private overlay: Overlay
  ) {}

  ngOnInit() {
    this.userService.currentUserPhone$.subscribe((phone: string) => {
      this.currentUserPhone = phone;
      if (this.currentUserPhone) {
        this.customerService.getCustomerByPhone(this.currentUserPhone).subscribe(
          (data: any) => {
            this.customerInfo = data.data; 
            this.currentUserName = this.customerInfo.Name;

            // Gọi hàm để lấy danh sách đơn hàng chỉ khi đã có thông tin khách hàng
            this.fetchOrders(this.customerInfo._id);
          },
          (error) => {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
          }
        );
      }
    });
  }

  fetchOrders(customerId: string): void {
    this.orderService.getOrdersByCustomer(customerId).subscribe(
      (response: any) => {
        console.log("Raw API response:", response);
        if (response && response.success && response.data) {
          this.orders = response.data; // Chỉ lấy `data` từ API
        } else {
          this.orders = [];
        }
        console.log('Orders after processing:', this.orders);
      },
      (error) => {
        console.error('Lỗi khi lấy đơn hàng:', error);
      }
    );
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

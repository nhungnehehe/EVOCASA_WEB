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
import { HttpClient } from '@angular/common/http';

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

  editableUser: any = {};
  isEditing = false;
  emailError = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private customerService: CustomerService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private overlay: Overlay,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Lấy số điện thoại người dùng
    this.userService.currentUserPhone$.subscribe((phone: string) => {
      this.currentUserPhone = phone;
      if (this.currentUserPhone) {
        this.loadCustomerData();
      }
    });
  }
  private loadCustomerData() {
    this.customerService.getCustomerByPhone(this.currentUserPhone!).subscribe(
      (data: any) => {
        this.customerInfo = data.data;
        this.currentUserName = this.customerInfo.Name;
        this.formattedDOB = this.datePipe.transform(this.customerInfo.DOB, 'yyyy-MM-dd'); // Format để input date hiểu
      },
      (error) => {
        console.error("Lỗi khi lấy thông tin khách hàng:", error);
      }
    );
  }
   /** 🔹 Bật chế độ chỉnh sửa */
   editProfile() {
    this.isEditing = true;
    this.editableUser = { 
      ...this.customerInfo, 
      DOB: this.formattedDOB, // Giữ lại định dạng yyyy-MM-dd
      Gender: this.customerInfo?.Gender || "" 
    };
  }

  /** 🔹 Kiểm tra email hợp lệ */
  validateEmail(email: string): boolean {
    return email.includes('@');
  }

  /** 🔹 Lưu thông tin đã chỉnh sửa */
  saveProfile() {
    if (!this.validateEmail(this.editableUser.Mail)) {
      this.emailError = true;
      return;
    }

    // Gửi dữ liệu cập nhật
    this.customerService.updateCustomer(this.editableUser).subscribe(
      () => {
        this.isEditing = false;
        this.emailError = false;
        this.loadCustomerData(); // Gọi API để lấy dữ liệu mới
      },
      (error) => {
        console.error("Lỗi khi cập nhật thông tin:", error);
      }
    );
  }

  /** 🔹 Hủy chỉnh sửa */
  cancelEdit() {
    this.isEditing = false;
    this.emailError = false;
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

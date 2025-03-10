import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CartpaymentService } from '../services/cartpayment.service';

@Component({
  selector: 'app-payment-shipping',
  standalone: false,
  templateUrl: './payment-shipping.component.html',
  styleUrl: './payment-shipping.component.css'
})
export class PaymentShippingComponent implements OnInit {
  cities: { code: string, name: string }[] = [];
  selectedCity: string = '';
  district: string = '';

  totalQuantity: number = 0; // Biến lưu tổng số lượng sản phẩm
  total: number = 0; // Biến lưu tổng giá trị giỏ hàng
  cartItems: any[] = [];

  constructor(private http: HttpClient, private cartpaymentService: CartpaymentService) { }
  ngOnInit(): void {
    this.getCities();
    this.cartItems = this.cartpaymentService.getCartPaymentItems();
    this.totalQuantity = this.cartpaymentService.getTotalQuantity();
    this.total = this.cartpaymentService.getTotalAmount();
  }

  getCities(): void {
    this.http.get<any[]>('https://provinces.open-api.vn/api/p/')
      .subscribe(
        (data) => {
          this.cities = data.map(province => ({
            code: province.code,
            name: province.name
          }));
        },
        (error) => {
          console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
        }
      );
  }
}


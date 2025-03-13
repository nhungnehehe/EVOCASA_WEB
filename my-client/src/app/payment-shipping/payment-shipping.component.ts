import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CartpaymentService } from '../services/cartpayment.service';
import { CartService } from '../services/cart.service';
import { BuyNowItem } from '../interfaces/buynow';
import { ActivatedRoute } from '@angular/router';

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
  products: BuyNowItem[] = [];
  isBuyNow: boolean = false;  // Biến để xác định có phải "Buy Now" không

  constructor(private http: HttpClient, private cartpaymentService: CartpaymentService, private cartService: CartService, private route: ActivatedRoute) { }
  loadProducts(): void {
    if (this.isBuyNow) {
      // Nếu là Buy Now, lấy các sản phẩm từ BuyNowItems
      this.cartService.getBuyNowItems().subscribe({
        next: (data) => {
          this.products = data.map((product) => {
            // Kiểm tra nếu Image là chuỗi và không phải là mảng
            if (product.Image && typeof product.Image === 'string') {
              try {
                const images = JSON.parse(product.Image); // Parse mảng nếu Image là chuỗi JSON
                product.Image = images[0];  // Lấy hình ảnh đầu tiên từ mảng
              } catch (e) { 
                console.error('Error parsing images for product:', product.Name, e);
                product.Image = '';  // Nếu có lỗi, để hình ảnh rỗng
              }
            }
            return product;
          });
          this.updateTotal();
        },
        error: (err) => {
          console.error('Error loading Buy Now items:', err);
        }
      });
    } else {
      // Nếu không phải Buy Now, lấy các sản phẩm từ CartPaymentItems
      this.products = this.cartpaymentService.getCartPaymentItems(); // Thay vì gọi API, dùng getCartPaymentItems
      this.updateTotal();
    }
  }

  updateTotal(): void {
    this.totalQuantity = this.products.reduce((sum, item) => sum + item.cartQuantity, 0);
    this.total = this.products.reduce((sum, item) => sum + (item.Price * item.cartQuantity), 0);
  }
  
  
  ngOnInit(): void {
    this.getCities();
    this.route.queryParams.subscribe(params => {
      this.isBuyNow = params['buyNow'] === 'true';  // Kiểm tra nếu tham số buyNow=true
    });
    this.loadProducts();
    // 
    // this.totalQuantity = this.cartpaymentService.getTotalQuantity();
    // this.total = this.cartpaymentService.getTotalAmount();
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
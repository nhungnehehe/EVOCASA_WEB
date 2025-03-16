import { Component } from '@angular/core';
import { CartpaymentService } from '../services/cartpayment.service';
import { CheckoutDataService } from '../services/checkout-data.service';

@Component({
  selector: 'app-payment-confirm',
  standalone: false,
  templateUrl: './payment-confirm.component.html',
  styleUrl: './payment-confirm.component.css'
})
export class PaymentConfirmComponent {
  totalQuantity: number = 0; // Biến lưu tổng số lượng sản phẩm
  total: number = 0; // Biến lưu tổng giá trị giỏ hàng
  totalAmount: number = 0;
  saleTax: number = 0; // Biến lưu thuế bán hàng
  deliveryFee: number = 0; // Biến lưu phí giao hàng
  totalOrder: number = 0; // Biến lưu tổng giá trị đơn hàng
  cartItems: any[] = [];
  constructor(
    private cartpaymentService: CartpaymentService,
  private checkoutDataService: CheckoutDataService) { }
  ngOnInit(): void {
    this.cartItems = this.checkoutDataService.getCheckoutData();
    this.totalQuantity = this.cartpaymentService.getTotalQuantity();
    this.total = this.cartpaymentService.getTotalAmount();
    // Lấy tổng giá trị giỏ hàng
    const { saleTax, deliveryFee, totalOrder } = this.cartpaymentService.getTotalOrder();

    // Lưu các giá trị vào các biến
    // this.totalAmount = totalAmount;
    this.saleTax = saleTax;
    this.deliveryFee = deliveryFee;
    this.totalOrder = totalOrder;
  }
  
  getProductTotal(productId: string): number {
    return this.cartpaymentService.getProductTotal(productId);
  }
}

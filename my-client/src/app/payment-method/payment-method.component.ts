import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-method',
  standalone: false,
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  selectedPaymentMethod: string = 'Card'; // Default

  // Hàm xử lý sự kiện khi chọn phương thức thanh toán
  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

}

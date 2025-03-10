import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-detail',
  standalone: false,
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent {
    // Dữ liệu khách hàng (ví dụ)
    orders = [
      { id: '123456', amount: '1000$', quantity: 2, date: '03-02-2025', payment: 'VISA', status: 'Delivered' },
      { id: '123456', amount: '1000$', quantity: 2, date: '03-02-2025', payment: 'VISA', status: 'Delivered' },
      { id: '123456', amount: '1000$', quantity: 2, date: '03-02-2025', payment: 'VISA', status: 'Delivered' },
  ]
  
}

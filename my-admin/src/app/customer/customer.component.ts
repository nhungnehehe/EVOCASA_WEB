import { Component } from '@angular/core';

@Component({
  selector: 'app-customer',
  standalone: false,
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent {
  // Dữ liệu khách hàng (ví dụ)
  customers = [
    { id: '123456', name: 'Mark', gender: 'Male', email: 'mark@gmail.com', phone: '0832-XXX-XXX', amount: '1000$' },
    { id: '123457', name: 'John', gender: 'Male', email: 'john@gmail.com', phone: '0832-XXX-XXX', amount: '2000$' },
    { id: '123458', name: 'Anna', gender: 'Female', email: 'anna@gmail.com', phone: '0832-XXX-XXX', amount: '1500$' },
    { id: '123459', name: 'Emma', gender: 'Female', email: 'emma@gmail.com', phone: '0832-XXX-XXX', amount: '1800$' }
  ];

  // Thực hiện các thao tác như xóa hoặc chỉnh sửa khách hàng
  editCustomer(id: string) {
    console.log('Editing customer with ID:', id);
  }

  deleteCustomer(id: string) {
    console.log('Deleting customer with ID:', id);
    this.customers = this.customers.filter(customer => customer.id !== id);
  }
}

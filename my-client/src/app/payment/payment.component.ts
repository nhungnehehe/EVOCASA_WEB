import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  email: string = '';
  fullName: string = '';
  street: string = '';
  selectedCity: string = '';
  district: string = '';
  phone: string = '';

  cities: any[] = [];
  orderItems = [
    { image: 'image.png', name: 'Cement Coffee Table', price: '$3,982', quantity: 1, color: 'Light Beige' },
    { image: 'image.png', name: 'Cement Coffee Table', price: '$3,982', quantity: 1, color: 'Light Beige' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCities();
  }

  getCities(): void {
    this.http.get<any[]>('https://provinces.open-api.vn/api/p/').subscribe(
      (data) => {
        this.cities = data;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
      }
    );
  }
}

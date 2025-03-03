import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  cities: { code: string, name: string }[] = [];
  selectedCity: string = '';
  district: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCities();
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


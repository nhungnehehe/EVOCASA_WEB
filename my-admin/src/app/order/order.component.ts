import { Component } from '@angular/core';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  orders = [
    {
      id: 123450,
      customerid: '250228014',
      name: 'Nhung Pham',
      date: '27/02/2025',
      price: 680,
      status: 'Delivered',
    },
    {
      id: 123451,
      customerid: '250228014',
      name: 'Trang Phan',
      date: '28/02/2025',
      price: 750,
      status: 'In transit',
    },
    {
      id: 123452,
      customerid: '250228014',
      name: 'Huyen Nguyen',
      date: '28/02/2025',
      price: 980,
      status: 'Delivered',
    },
    {
      id: 123453,
      customerid: '250228014',
      name: 'Nhu Vu',
      date: '01/03/2025',
      price: 740,
      status: 'Delivered',
    },
    {
      id: 123460,
      customerid: '250228013',
      name: 'Minh Thao Le',
      date: '28/02/2025',
      price: 850,
      status: 'Completed',
    },
  ];
}

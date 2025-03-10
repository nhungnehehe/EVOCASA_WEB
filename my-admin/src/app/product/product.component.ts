import { Component } from '@angular/core';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  products = [
    {
      image: 123450,
      name: 'soft pillow',
      price: 680,
      category: 'soft goods',
      quantity: '20',
    },
    {
      image: 123455,
      name: 'home lamp',
      price: 900,
      category: 'lighting',
      quantity: '40',
    },
    {
      image: 123455,
      name: 'home lamp',
      price: 900,
      category: 'lighting',
      quantity: '40',
    },
    {
      image: 123455,
      name: 'home lamp',
      price: 900,
      category: 'lighting',
      quantity: '40',
    },
  ];
}

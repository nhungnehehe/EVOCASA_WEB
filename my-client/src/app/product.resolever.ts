import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { IProduct } from './interfaces/product';
import { ProductService } from './services/product.service';

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<IProduct[]> {
  constructor(private productService: ProductService) {}

  resolve(): Observable<IProduct[]> {
    return this.productService.getProducts();
  }
}
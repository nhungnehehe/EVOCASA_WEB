import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  products: any[] = []; // Danh sách sản phẩm
  errMessage: string = ''; // Biến để lưu thông báo lỗi

  constructor(
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Lấy danh sách sản phẩm từ API
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Products fetched successfully:', this.products);
      },
      error: (err) => {
        this.errMessage = 'Error fetching products. Please try again later.';
        console.error('Error:', err);
      }
    });
  }
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Process the data to fix image arrays
        this.products = data.map((product: any) => {
          // Handle Image if it's a JSON string
          if (product.Image && typeof product.Image === 'string') {
            try {
              product.Image = JSON.parse(product.Image);
            } catch (e) {
              product.Image = [];
              console.error('Error parsing product image:', e);
            }
          }
          return product;
        });
        
        console.log('Products fetched successfully:', this.products);
      },
      error: (err) => {
        this.errMessage = 'Error fetching products. Please try again later.';
        console.error('Error:', err);
      }
    });
  }
  // Add this method to your product.component.ts file
formatDimension(dimension: any): string {
  // If dimension is a string
  if (typeof dimension === 'string') {
    // Return it formatted, replacing \n with spaces or <br> tags
    return dimension.replace(/\n/g, ' ');
  }
  
  // If dimension is an object with Width, Height, and unit properties
  if (dimension && dimension.Width !== undefined && dimension.Height !== undefined) {
    return `${dimension.Width} × ${dimension.Height} ${dimension.unit || ''}`;
  }
  
  // Default case - return as is
  return dimension;
}
}
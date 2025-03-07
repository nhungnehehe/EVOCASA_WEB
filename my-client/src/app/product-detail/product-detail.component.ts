import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from '../interfaces/product';
import { ProductService } from '../services/product.service';

@Component({
    selector: 'app-product-detail',
    standalone: false,
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: IProduct | null = null;

  constructor(
      private route: ActivatedRoute,
      private productService: ProductService
  ) {}

  ngOnInit(): void {
      // Lấy tham số từ URL
      const identifier = this.route.snapshot.paramMap.get('identifier');
      if (identifier) {
          console.log('Received identifier:', identifier); // Kiểm tra giá trị
          this.getProductDetail(identifier);
      } else {
          console.error('Error: Product identifier is missing in route parameters.');
      }
  }

  getProductDetail(identifier: string): void {
      this.productService.getProductByIdentifier(identifier).subscribe(
          (res: IProduct) => {
              console.log('Product fetched:', res); // Kiểm tra dữ liệu trả về
              this.product = res;
          },
          error => {
              console.error('Error fetching product details', error);
          }
      );
  }

  // Hàm định dạng dimension
  formatDimension(dimension: any): string {
      if (typeof dimension === 'string') {
          return dimension.replace(/\n/g, ' ');
      }
      if (dimension && dimension.Width !== undefined && dimension.Height !== undefined) {
          return `${dimension.Width} × ${dimension.Height} ${dimension.unit || ''}`;
      }
      return dimension;
  }  
}

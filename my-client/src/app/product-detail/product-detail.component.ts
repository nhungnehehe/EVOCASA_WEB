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
  quantity: number = 1;
  selectedImage: string | null = null;
  isDescriptionExpanded: boolean = false;
  selectedTab: string = 'Story';
  starsArray: number[] = [];

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
              this.selectedImage = this.product.Image?.[0] || null;
              this.generateRandomRating();
          },
          error => {
              console.error('Error fetching product details', error);
          }
      );
  }

  // Tạo rating ngẫu nhiên từ 4 đến 5 sao
  generateRandomRating(): void {
      const randomRating = (Math.random() * (5 - 4) + 4).toFixed(1);
      this.starsArray = new Array(Math.round(Number(randomRating))).fill(1);
  }

  // Chọn ảnh hiển thị
  selectImage(image: string): void {
      this.selectedImage = image;
  }

  // Chuyển sang ảnh tiếp theo
  nextImage(): void {
      if (!this.product?.Image || this.product.Image.length === 0) return;
      const currentIndex = this.product.Image.indexOf(this.selectedImage || '');
      const nextIndex = (currentIndex + 1) % this.product.Image.length;
      this.selectedImage = this.product.Image[nextIndex];
  }

  // Thay đổi số lượng sản phẩm
  updateQuantity(amount: number): void {
      this.quantity = Math.max(1, this.quantity + amount);
  }

  // Thêm vào giỏ hàng
  addToCart(): void {
      console.log(`Added ${this.quantity} of ${this.product?.Name} to cart.`);
  }

  // Mua ngay
  buyNow(): void {
      console.log(`Buying ${this.quantity} of ${this.product?.Name} now.`);
  }

  // Ẩn/hiện mô tả sản phẩm
  toggleDescription(): void {
      this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  // Chọn tab (Story, Product Care, Shipping & Return)
  selectTab(tab: string): void {
      this.selectedTab = tab;
  }

  // Lấy nội dung của tab hiện tại
  getTabContent(): string {
      if (this.selectedTab === 'Story') return this.product?.Story || 'No story available.';
      if (this.selectedTab === 'ProductCare') return this.product?.ProductCare || 'No product care information available.';
      if (this.selectedTab === 'ShippingReturn') return this.product?.ShippingReturn || 'No shipping & return details available.';
      return '';
  }

  // Hàm định dạng kích thước sản phẩm
  formatDimension(dimension: any): string {
      if (typeof dimension === 'string') {
          return dimension.replace(/\n/g, ' ');
      }
      if (dimension && dimension.Width !== undefined && dimension.Height !== undefined) {
          return `${dimension.Width} × ${dimension.Height} ${dimension.unit || ''}`;
      }
      return 'No dimension provided.';
  }  
}

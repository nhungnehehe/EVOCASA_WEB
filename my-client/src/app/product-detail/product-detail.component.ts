import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { IProduct } from '../interfaces/product';
import { ProductService } from '../services/product.service';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';

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
  isDimensionsExpanded: boolean = false;
  errMessage: string = '';
  products: any[] = []; // 

  selectedTab: string = 'Story';
  starsArray: number[] = [];
  rating: number = 0;
  reviewCount: number = 0;
  pairWithProducts: IProduct[] = [];
  allProducts: IProduct[] = [];
  hoveredIndex: number = -1;
  hoveredPairProductIndex: number = -1;
  storyRandomImage: string = '';

  private routeSubscription!: Subscription;


  constructor(
      private route: ActivatedRoute,
      private productService: ProductService,
      private router: Router,
      private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Sử dụng paramMap.subscribe thay vì snapshot để lắng nghe thay đổi tham số route
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const identifier = params.get('identifier');
      
      // Đặt lại trạng thái component
      this.resetComponentState();
      this.initializeRandomStoryImage();
      
      // Tải dữ liệu mới
      if (identifier) {
        console.log('Loading product with identifier:', identifier);
        this.loadData(identifier);
      } else {
        console.error('Error: Product identifier is missing in route parameters.');
      }
    });
  }
  // Phương thức khởi tạo lại trạng thái
  resetComponentState(): void {
    this.product = null;
    this.selectedImage = null;
    this.quantity = 1;
    this.isDescriptionExpanded = false;
    this.isDimensionsExpanded = false;
    this.selectedTab = 'Story';
  }
  // Phương thức tải dữ liệu
  loadData(identifier: string): void {
    // Lấy tất cả sản phẩm trước
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        
        // Sau đó lấy chi tiết sản phẩm
        this.getProductDetail(identifier);
      },
      error: (err) => {
        console.error('Error fetching all products:', err);
      }
    });
  }
   // Đảm bảo dọn dẹp subscription khi component bị hủy
   ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
getProductDetail(identifier: string): void {
    this.productService.getProductByIdentifier(identifier).subscribe(
        (res: IProduct) => {
            console.log('Product fetched:', res);
            this.product = res;
            this.selectedImage = this.product.Image?.[0] || null;
            this.generateRandomRating();

            
            // Khi đã có sản phẩm hiện tại, lấy các sản phẩm ngẫu nhiên để "Pair with"
            this.generatePairWithProducts();
            this.initializeRandomStoryImage();
        },
        error => {
            console.error('Error fetching product details', error);
        }
    );
}
// Thêm phương thức mới để khởi tạo ảnh ngẫu nhiên cho tab Story
initializeRandomStoryImage(): void {
  if (this.product && this.product.Image && this.product.Image.length > 0) {
    const randomIndex = Math.floor(Math.random() * this.product.Image.length);
    this.storyRandomImage = this.product.Image[randomIndex];
    console.log('Story random image initialized:', this.storyRandomImage);
  }
}
generatePairWithProducts(): void {
  if (!this.allProducts || !this.product) return;
  
  // Lọc ra các sản phẩm khác với sản phẩm hiện tại
  const otherProducts = this.allProducts.filter(p => p._id !== this.product?._id);
  
  // Trộn ngẫu nhiên danh sách sản phẩm
  const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
  
  // Lấy 5 sản phẩm đầu tiên sau khi trộn (thay đổi từ 4 lên 5)
  this.pairWithProducts = shuffled.slice(0, 5);
  
  console.log("Pair with products count:", this.pairWithProducts.length);
}
/// Chỉnh sửa phương thức điều hướng để xử lý việc chuyển trang đến cùng một component
viewProductDetails(product: IProduct): void {
    if (product.Name) {
      const productName = encodeURIComponent(product.Name.trim());
      
      // Kiểm tra xem có phải đang ở cùng trang không
      if (this.router.url === `/product-detail/${productName}`) {
        // Nếu cùng trang, có thể buộc reload
        window.location.reload();
      } else {
        // Nếu khác trang, dùng router navigate
        this.router.navigate(['/product-detail', productName]);
      }
    } else {
      console.error('Error: Product name is missing');
    }
  }

 // Tạo rating trung bình ngẫu nhiên từ 4 đến 5 sao và số lượt đánh giá từ 10 đến 20
 generateRandomRating(): void {
    const randomRating = (Math.random() * (5 - 4) + 4).toFixed(1);
    this.rating = parseFloat(randomRating);
    this.starsArray = new Array(Math.round(this.rating)).fill(1);
    this.reviewCount = Math.floor(Math.random() * (20 - 10 + 1)) + 10; // random từ 10 đến 20
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

  // Get dimensions as an array of lines, one dimension per line
  getDimensionLines(dimension: any): string[] {
    if (!dimension) {
        return ['No dimensions available'];
    }
    
    if (typeof dimension === 'string') {
        // If it's a string, split by new lines or return as is
        return dimension.split('\n').filter(line => line.trim() !== '');
    }
    
    // Build dimension lines from available properties
    const dimensionLines = [];
    const unit = dimension.unit || 'in';
    
    if (dimension.Width !== undefined) {
        dimensionLines.push(`Width: ${dimension.Width} ${unit}`);
    }
    
    if (dimension.Length !== undefined) {
        dimensionLines.push(`Length: ${dimension.Length} ${unit}`);
    }
    
    if (dimension.Height !== undefined) {
        dimensionLines.push(`Height: ${dimension.Height} ${unit}`);
    }
    
    if (dimension.Depth !== undefined) {
        dimensionLines.push(`Depth: ${dimension.Depth} ${unit}`);
    }
    
    return dimensionLines.length > 0 
        ? dimensionLines 
        : ['No dimension details available'];
}  

toggleDimensions(): void {
  this.isDimensionsExpanded = !this.isDimensionsExpanded;
}
getRandomProductImage(): string {
  return this.storyRandomImage || (this.product?.Image?.[0] || '');
}

// Cập nhật các phương thức xử lý hover cho phần Pair with
onHoverPairProduct(index: number): void {
  this.hoveredPairProductIndex = index;
}

onHoverOutPairProduct(): void {
  this.hoveredPairProductIndex = -1;
}
addToCart(): void {
  if (!this.product || !this.product._id) {
      console.error('Cannot add to cart: Product is null or missing ID');
      return;
  }
  
  // Gọi service để thêm vào giỏ hàng
  this.cartService.addToCart(this.product._id, this.quantity).subscribe({
      next: (updatedCart) => {
          console.log(`Added ${this.quantity} of ${this.product?.Name} to cart.`);
          console.log('Updated cart:', updatedCart);
      },
      error: (error) => {
          console.error('Error adding product to cart:', error);
      }
  });

}
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { IProduct } from '../interfaces/product';
import { ProductService } from '../services/product.service';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { CustomerService } from '../services/customer.service';

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
    private userService: UserService,
    private customerService: CustomerService,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const identifier = params.get('identifier');
      this.resetComponentState();
      this.initializeRandomStoryImage();


      if (identifier) {
        console.log('Loading product with identifier:', identifier);
        this.loadData(identifier);
      } else {
        console.error('Error: Product identifier is missing in route parameters.');
      }
    });

    this.userService.currentUserPhone$.subscribe((phone: string | null) => {
      this.currentUserPhone = phone;
      this.isUserLoggedIn = !!phone; // true nếu có số điện thoại, false nếu không
  
      console.log("📢 Trạng thái đăng nhập:", this.isUserLoggedIn);
      console.log("📢 Số điện thoại hiện tại:", this.currentUserPhone);
    });
    
  }

  resetComponentState(): void {
    this.product = null;
    this.selectedImage = null;
    this.quantity = 1;
    this.isDescriptionExpanded = false;
    this.isDimensionsExpanded = false;
    this.selectedTab = 'Story';
  }

  loadData(identifier: string): void {

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;


        this.getProductDetail(identifier);
      },
      error: (err) => {
        console.error('Error fetching all products:', err);
      }
    });
  }

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


        this.generatePairWithProducts();
        this.initializeRandomStoryImage();
      },
      error => {
        console.error('Error fetching product details', error);
      }
    );
  }

  initializeRandomStoryImage(): void {
    if (this.product && this.product.Image && this.product.Image.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.product.Image.length);
      this.storyRandomImage = this.product.Image[randomIndex];
      console.log('Story random image initialized:', this.storyRandomImage);
    }
  }
  generatePairWithProducts(): void {
    if (!this.allProducts || !this.product) return;


    const otherProducts = this.allProducts.filter(p => p._id !== this.product?._id);


    const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());


    this.pairWithProducts = shuffled.slice(0, 5);

    console.log("Pair with products count:", this.pairWithProducts.length);
  }

  viewProductDetails(product: IProduct): void {
    if (product.Name) {
      const productName = encodeURIComponent(product.Name.trim());


      if (this.router.url === `/product-detail/${productName}`) {

        window.location.reload();
      } else {

        this.router.navigate(['/product-detail', productName]);
      }
    } else {
      console.error('Error: Product name is missing');
    }
  }


  generateRandomRating(): void {
    const randomRating = (Math.random() * (5 - 4) + 4).toFixed(1);
    this.rating = parseFloat(randomRating);
    this.starsArray = new Array(Math.round(this.rating)).fill(1);
    this.reviewCount = Math.floor(Math.random() * (20 - 10 + 1)) + 10; 
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }


  nextImage(): void {
    if (!this.product?.Image || this.product.Image.length === 0) return;
    const currentIndex = this.product.Image.indexOf(this.selectedImage || '');
    const nextIndex = (currentIndex + 1) % this.product.Image.length;
    this.selectedImage = this.product.Image[nextIndex];
  }


  updateQuantity(amount: number): void {
    this.quantity = Math.max(1, this.quantity + amount);
  }

  buyNow(): void {
    if (!this.product || !this.product._id) {
      console.error('Cannot add to cart: Product is null or missing ID');
      return;
    }

    this.cartService.buyNow(this.product._id, this.quantity).subscribe({
      next: (updatedCart) => {
        console.log(`Added ${this.quantity} of ${this.product?.Name} to cart.`);
        console.log('Updated cart:', updatedCart);
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
      }
    });
    this.router.navigate(['/payment-shipping'], { queryParams: { buyNow: 'true' } });
  }


  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }


  selectTab(tab: string): void {
    this.selectedTab = tab;
  }


  getTabContent(): string {
    if (this.selectedTab === 'Story') return this.product?.Story || 'No story available.';
    if (this.selectedTab === 'ProductCare') return this.product?.ProductCare || 'No product care information available.';
    if (this.selectedTab === 'ShippingReturn') return this.product?.ShippingReturn || 'No shipping & return details available.';
    return '';
  }


  getDimensionLines(dimension: any): string[] {
    if (!dimension) {
      return ['No dimensions available'];
    }

    if (typeof dimension === 'string') {

      return dimension.split('\n').filter(line => line.trim() !== '');
    }


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

  onHoverPairProduct(index: number): void {
    this.hoveredPairProductIndex = index;
  }

  onHoverOutPairProduct(): void {
    this.hoveredPairProductIndex = -1;
  }


  
  isUserLoggedIn: boolean = false;
  currentUserPhone: string | null = null;


  addToCart(): void {
    if (!this.product || !this.product._id) {
      console.error('Cannot add to cart: Product is null or missing ID');
      return;
    }
  
    if (this.isUserLoggedIn && this.currentUserPhone) {
      this.customerService.getCartByPhone(this.currentUserPhone).subscribe((cartItems) => {
        const existingItem = cartItems.find(item => item.productId === this.product?._id);
  
        if (existingItem) {
          existingItem.cartQuantity += this.quantity;
        } else if (this.product && this.product._id) {  // Kiểm tra trước khi push
          cartItems.push({ productId: this.product._id, cartQuantity: this.quantity });
        }
  
        if (this.currentUserPhone) {  // Kiểm tra phone trước khi gọi API
          this.customerService.updateCustomerCart(this.currentUserPhone, cartItems).subscribe({
            next: () => console.log(`✅ Updated cart for ${this.currentUserPhone}`),
            error: (error) => console.error('❌ Error updating cart:', error)
          });
        } else {
          console.error('❌ Error: currentUserPhone is null');
        }
      });
    } else {
      this.cartService.addToCart(this.product._id, this.quantity).subscribe({
        next: (updatedCart) => console.log(`Added ${this.quantity} of ${this.product?.Name} to cart.`, updatedCart),
        error: (error) => console.error('Error adding product to cart:', error)
      });
    }
  }
}
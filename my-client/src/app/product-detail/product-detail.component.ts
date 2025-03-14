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
  products: any[] = [];  

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
            next: () => console.log(` Updated cart for ${this.currentUserPhone}`),
            error: (error) => console.error(' Error updating cart:', error)
          });
        } else {
          console.error(' Error: currentUserPhone is null');
        }
      });
    } else {
      this.cartService.addToCart(this.product._id, this.quantity).subscribe({
        next: (updatedCart) => console.log(`Added ${this.quantity} of ${this.product?.Name} to cart.`, updatedCart),
        error: (error) => console.error('Error adding product to cart:', error)
      });
    }
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
    if (this.isUserLoggedIn) {
      this.router.navigate(['/payment-shipping'], { queryParams: { buyNow: 'true' } });
    } else {
      const confirmLogin = window.confirm("You need to log in to proceed with the payment. Would you like to log in now?");
      if (confirmLogin) {
        this.router.navigate(['/login-page'], { queryParams: { returnUrl: '/payment-shipping' } });
      }
    }
    
  }
}
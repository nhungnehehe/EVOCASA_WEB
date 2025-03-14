import { Injectable } from '@angular/core';
import { BuyNowItem } from '../interfaces/buynow';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutDataService {
  private checkoutData = new BehaviorSubject<BuyNowItem[]>([]);
  checkoutData$ = this.checkoutData.asObservable();

  setCheckoutData(products: BuyNowItem[]): void {
    this.checkoutData.next(products);
  }

  getCheckoutData(): BuyNowItem[] {
    return this.checkoutData.getValue();
  }

  clearCheckoutData(): void {
    this.checkoutData.next([]);
  }
}

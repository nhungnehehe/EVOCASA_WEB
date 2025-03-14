import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IProduct } from '../interfaces/product';
import { CartItem } from '../interfaces/cart';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3002/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.apiUrl).pipe(
      map(products => this.processProductImages(products)),
      catchError(this.handleError)
    );
  }

  getProductByIdentifier(identifier: string): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.apiUrl}/${encodeURIComponent(identifier)}`).pipe(
      map(product => this.processProductImage(product)),
      catchError(this.handleError)
    );
  }

  // Process product images for collections
  private processProductImages(products: IProduct[]): IProduct[] {
    return products.map(product => this.processProductImage(product));
  }

  // Process single product image
  private processProductImage(product: IProduct): IProduct {
    if (product.Image && typeof product.Image === 'string') {
      try {
        product.Image = JSON.parse(product.Image as unknown as string);
      } catch (e) {
        product.Image = [product.Image as unknown as string];
      }
    }
    return product;
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }


  // Thêm phương thức này để lấy thông tin sản phẩm cho giỏ hàng
  getProductDetails(productId: string): Observable<CartItem> {
    return this.http.get<IProduct>(`${this.apiUrl}/${encodeURIComponent(productId)}`).pipe(
      map(product => {
        // Chuyển đổi từ IProduct sang CartItem
        const cartItem: CartItem = {
          productId: product._id || productId,
          category_id: product.category_id || '',
          Name: product.Name || '',
          Price: product.Price || 0,
          Image: '',
          Description: product.Description || '',
          Origin: product.Origin || '',
          Uses: product.Uses || '',
          Store: product.Store || '',
          Quantity: product.Quantity || 0,     
          cartQuantity: 0,
          Create_date: product.Create_date || '',
          Dimension: '',  // Sẽ được cập nhật bên dưới
          Story: product.Story || '',
          ProductCare: product.ProductCare || '',
          ShippingReturn: product.ShippingReturn || ''
        };
        
        // Xử lý Dimension
        if (product.Dimension) {
          if (typeof product.Dimension === 'object') {
            const dim = product.Dimension;
            const parts = [];
            if (dim.Width) parts.push(`Width: ${dim.Width}`);
            if (dim.Length) parts.push(`Length: ${dim.Length}`);
            if (dim.Height) parts.push(`Height: ${dim.Height}`);
            if (dim.Depth) parts.push(`Depth: ${dim.Depth}`);
            
            cartItem.Dimension = parts.join(', ');
            if (dim.unit) cartItem.Dimension += ` ${dim.unit}`;
          } else {
            cartItem.Dimension = String(product.Dimension);
          }
        }
        
        // Xử lý Image
        if (product.Image) {
          if (typeof product.Image === 'string') {
            try {
              const images = JSON.parse(product.Image);
              cartItem.Image = Array.isArray(images) ? images[0] : images;
            } catch (e) {
              cartItem.Image = product.Image;
            }
          } else if (Array.isArray(product.Image) && product.Image.length > 0) {
            cartItem.Image = product.Image[0];
          }
        }
        
        return cartItem;
      }),
      catchError(this.handleError)
    );
  }
}
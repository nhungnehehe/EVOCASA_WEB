import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IProduct } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3002/products';
  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.apiUrl).pipe(
      map((products) => this.processProductImages(products)),
      catchError(this.handleError)
    );
  }

  getProductByIdentifier(identifier: string): Observable<IProduct> {
    return this.http
      .get<IProduct>(`${this.apiUrl}/${encodeURIComponent(identifier)}`)
      .pipe(
        map((product) => this.processProductImage(product)),
        catchError(this.handleError)
      );
  }

  // Thêm sản phẩm mới
  createProduct(product: IProduct): Observable<IProduct> {
    return this.http.post<IProduct>(this.apiUrl, product).pipe(
      map((product) => this.processProductImage(product)),
      catchError(this.handleError)
    );
  }

  // Cập nhật sản phẩm
  updateProduct(identifier: string, product: IProduct): Observable<IProduct> {
    return this.http
      .put<IProduct>(
        `${this.apiUrl}/${encodeURIComponent(identifier)}`,
        product
      )
      .pipe(
        map((product) => this.processProductImage(product)),
        catchError(this.handleError)
      );
  }

  // Xóa sản phẩm
  deleteProduct(identifier: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${encodeURIComponent(identifier)}`)
      .pipe(catchError(this.handleError));
  }

  // Process product images for collections
  private processProductImages(products: IProduct[]): IProduct[] {
    return products.map((product) => this.processProductImage(product));
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
}

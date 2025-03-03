
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, retry, catchError, throwError } from 'rxjs';
import { Category } from '../interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3002/categories';
  
  constructor(private _http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain;charset=utf8'
    );
    const requestOptions: Object = {
      headers: headers,
      responseType: 'text',
    };
    return this._http.get<any>(`${this.apiUrl}`, requestOptions).pipe(
      map((res) => JSON.parse(res) as Array<Category>),
      retry(3),
      catchError(this.handleError)
    );
  }
  
  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }

  getCategory(categoryId: string): Observable<Category> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain;charset=utf8'
    );
    const requestOptions: Object = {
      headers: headers,
      responseType: 'text',
    };
    return this._http.get<any>(`${this.apiUrl}/${categoryId}`, requestOptions).pipe(
      map((res) => JSON.parse(res) as Category),
      retry(3),
      catchError(this.handleError)
    );
  }

  putCategory(category: any): Observable<Category[]> {
    const headers = new HttpHeaders().set("Content-Type", "application/json;charset=utf-8")
    const requestOptions: Object = {
      headers: headers,
      responseType: "text"
    }
    return this._http.put<any>(`${this.apiUrl}`, JSON.stringify(category), requestOptions).pipe(
      map(res => JSON.parse(res) as Array<Category>),
      retry(3),
      catchError(this.handleError))
  }

  // Thêm các phương thức CRUD khác nếu cần
  createCategory(category: Category): Observable<Category> {
    const headers = new HttpHeaders().set("Content-Type", "application/json;charset=utf-8")
    const requestOptions: Object = {
      headers: headers,
      responseType: "text"
    }
    return this._http.post<any>(`${this.apiUrl}`, JSON.stringify(category), requestOptions).pipe(
      map(res => JSON.parse(res) as Category),
      retry(3),
      catchError(this.handleError))
  }

  deleteCategory(categoryId: string): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json;charset=utf-8")
    const requestOptions: Object = {
      headers: headers,
      responseType: "text"
    }
    return this._http.delete<any>(`${this.apiUrl}/${categoryId}`, requestOptions).pipe(
      map(res => JSON.parse(res)),
      retry(3),
      catchError(this.handleError))
  }
}
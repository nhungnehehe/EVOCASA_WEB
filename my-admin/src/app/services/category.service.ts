import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, retry, catchError, throwError } from 'rxjs';
import { Category } from '../interfaces/category';

interface CategoryHierarchy extends Category {
  children: CategoryHierarchy[];
}


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

  // Lấy tất cả các danh mục chính (parentCategory = null)
  getMainCategories(): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories => categories.filter(category => category.parentCategory === null))
    );
  }

  // Lấy tất cả các danh mục con của một danh mục cha
  getSubcategories(parentCategoryId: string): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories => categories.filter(category => 
        category.parentCategory === parentCategoryId
      ))
    );
  }

  // Lấy đường dẫn đầy đủ của một danh mục (breadcrumb)
  // Ví dụ: Art > Vintage
  getCategoryPath(categoryId: string): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories => {
        const path: Category[] = [];
        let currentCategory = categories.find(c => c._id === categoryId);
        
        if (!currentCategory) return path;
  
        path.unshift(currentCategory);
        
        while (currentCategory && currentCategory.parentCategory) {
          const parentId: string = currentCategory.parentCategory; // thêm kiểu dữ liệu string vào đây
          currentCategory = categories.find(c => c._id === parentId);
          if (currentCategory) {
            path.unshift(currentCategory);
          }
        }
        
        return path;
      })
    );
  }

  // Lấy cấu trúc phân cấp hoàn chỉnh của danh mục
  getCategoryHierarchy(): Observable<CategoryHierarchy[]> {
    return this.getCategories().pipe(
      map(categories => {
        const mainCategories = categories.filter(c => c.parentCategory === null);
        
        const buildHierarchy = (category: Category): CategoryHierarchy => {
          const children = categories.filter(c => 
            c.parentCategory === category._id
          );
          
          return {
            ...category,
            children: children.map(buildHierarchy)
          };
        };
        
        return mainCategories.map(buildHierarchy);
      })
    );
  }
}
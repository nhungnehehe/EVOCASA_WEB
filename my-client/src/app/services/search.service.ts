import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:3002'; // Địa chỉ của backend API

  constructor(private http: HttpClient) { }

  // Tìm kiếm toàn cục cho sản phẩm, blog và bộ sưu tập
  search(query: string): Observable<any[]> {
    const searchUrl = `${this.apiUrl}/search?q=${query}`;
    return this.http.get<any[]>(searchUrl);
  }
}

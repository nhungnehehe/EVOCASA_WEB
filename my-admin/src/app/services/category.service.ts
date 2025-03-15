import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, retry, catchError, throwError, tap } from 'rxjs';
import { Category } from '../interfaces/category';

interface CategoryHierarchy extends Category {
  children: CategoryHierarchy[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3002/categories';
  private baseUrl = 'http://localhost:3002';

  constructor(private _http: HttpClient) {}

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    console.log('Fetching categories from:', this.apiUrl);
    return this._http.get<any[]>(this.apiUrl).pipe(
      tap(response => console.log('Raw categories response:', response)),
      map(response => {
        // Transform to ensure all required fields are present
        return response.map(item => this.normalizeCategoryData(item));
      }),
      tap(categories => console.log('Processed categories:', categories)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single category by ID
   */
   getCategory(id: string): Observable<Category> {
    console.log(`Fetching category with ID: ${id}`);
    return this._http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('Raw category response:', response)),
      map(response => this.normalizeCategoryData(response)),
      map(category => this.processCategoryImage(category)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing category
   */
  putCategory(category: Category): Observable<Category[]> {
    console.log('Updating category:', category);
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    return this._http.put<any[]>(this.apiUrl, category, { headers }).pipe(
      tap(response => console.log('Category update response:', response)),
      map(response => response.map(item => this.normalizeCategoryData(item))),
      map(categories => this.processCategoryImages(categories)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new category
   */
  createCategory(category: Category): Observable<Category> {
    console.log('Creating new category:', category);
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    return this._http.post<any>(this.apiUrl, category, { headers }).pipe(
      tap(response => console.log('Category creation response:', response)),
      map(response => this.normalizeCategoryData(response)),
      map(category => this.processCategoryImage(category)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a category
   */
  deleteCategory(categoryId: string): Observable<any> {
    console.log(`Deleting category with ID: ${categoryId}`);
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    return this._http.delete<any>(`${this.apiUrl}/${categoryId}`, { headers }).pipe(
      tap(response => console.log('Category deletion response:', response)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * Get all main categories (with no parent)
   */
  getMainCategories(): Observable<Category[]> {
    console.log('Fetching main categories');
    return this.getCategories().pipe(
      map(categories => {
        const mainCats = categories.filter(category => category.parentCategory === null);
        console.log(`Found ${mainCats.length} main categories`);
        return mainCats;
      })
    );
  }

  /**
   * Get subcategories for a given parent category
   */
  getSubcategories(parentCategoryId: string): Observable<Category[]> {
    console.log(`Fetching subcategories for parent ID: ${parentCategoryId}`);
    return this.getCategories().pipe(
      map(categories => {
        const subCats = categories.filter(category => 
          category.parentCategory === parentCategoryId
        );
        console.log(`Found ${subCats.length} subcategories for parent ${parentCategoryId}`);
        return subCats;
      })
    );
  }

  /**
   * Get full path (breadcrumb) for a category
   */
  getCategoryPath(categoryId: string): Observable<Category[]> {
    console.log(`Building category path for ID: ${categoryId}`);
    return this.getCategories().pipe(
      map(categories => {
        const path: Category[] = [];
        let currentCategory = categories.find(c => c._id === categoryId);
        
        if (!currentCategory) {
          console.warn(`Category with ID ${categoryId} not found`);
          return path;
        }
  
        path.unshift(currentCategory);
        
        while (currentCategory && currentCategory.parentCategory) {
          const parentId: string | null = currentCategory.parentCategory;
          currentCategory = categories.find(c => c._id === parentId);
          if (currentCategory) {
            path.unshift(currentCategory);
          } else {
            console.warn(`Parent category with ID ${parentId} not found`);
          }
        }
        
        console.log(`Category path: ${path.map(c => c.name).join(' > ')}`);
        return path;
      })
    );
  }

  /**
   * Get complete category hierarchy
   */
  getCategoryHierarchy(): Observable<CategoryHierarchy[]> {
    console.log('Building category hierarchy');
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
        
        const hierarchy = mainCategories.map(buildHierarchy);
        console.log(`Built hierarchy with ${hierarchy.length} main categories`);
        return hierarchy;
      })
    );
  }

  /**
   * Normalize category data to ensure all fields are present
   */
  private normalizeCategoryData(item: any): Category {
    // Handle MongoDB ObjectId format if needed
    let id = item._id;
    if (typeof id === 'object' && id && '$oid' in id) {
      id = id.$oid;
    }
    
    return {
      id: item.id || id || '',
      _id: id || item.id || '',
      name: item.name || item.Name || 'Unnamed Category',
      description: item.description || item.Description || '',
      slug: item.slug || item.Slug || '',
      parentCategory: item.parentCategory || item.ParentCategory || null,
      image: item.image || item.Image || ''
    };
  }

  /**
   * Error handler for HTTP requests
   */
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.statusText || ''}\nMessage: ${error.message}`;
    }
    
    console.error('CategoryService Error:', errorMessage);
    console.error('Full error:', error);
    
    return throwError(() => new Error(errorMessage));
  }

  // Process multiple categories' images
  private processCategoryImages(categories: Category[]): Category[] {
    return categories.map(category => this.processCategoryImage(category));
  }
private processCategoryImage(category: Category): Category {
  const processedCategory = { ...category };

  // Nếu không có ảnh, sử dụng ảnh mặc định
  if (!processedCategory.image) {
    processedCategory.image = 'assets/images/category-placeholder.png';
    return processedCategory;
  }

  console.log('Processing image for category:', processedCategory.name);
  console.log('Raw image value:', processedCategory.image);

  try {
    let imagePath = processedCategory.image.trim();

    // 🔹 Trường hợp 1: Ảnh là base64 (data:image/png;base64,....)
    if (imagePath.startsWith('data:image')) {
      console.log('Image is a base64 encoded string.');
      return processedCategory; // Trả về ngay, không cần xử lý tiếp
    }

    // 🔹 Trường hợp 2: Ảnh là một URL đầy đủ
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('Image is a full URL.');
      return processedCategory;
    }

    // 🔹 Trường hợp 3: Ảnh được lưu dưới dạng JSON (mảng hoặc object)
    if (imagePath.startsWith('[') || imagePath.startsWith('{')) {
      console.log('Attempting to parse JSON image string.');
      const imageData = JSON.parse(imagePath);

      if (Array.isArray(imageData) && imageData.length > 0) {
        // Lấy ảnh đầu tiên trong mảng nếu tồn tại
        imagePath = imageData.find(img => typeof img === 'string' && img.trim().length > 0) || '';
      } else if (typeof imageData === 'object' && imageData !== null) {
        // Nếu là object, tìm thuộc tính có chứa đường dẫn ảnh
        const possibleKeys = ['path', 'url', 'src', 'file'];
        for (const key of possibleKeys) {
          if (imageData[key] && typeof imageData[key] === 'string') {
            imagePath = imageData[key].trim();
            break;
          }
        }
      }
    }

    // 🔹 Trường hợp 4: Ảnh là một đường dẫn tương đối
    if (imagePath.startsWith('/')) {
      processedCategory.image = `${this.baseUrl}${imagePath}`;
    } else if (!imagePath.startsWith('http')) {
      processedCategory.image = `${this.baseUrl}/${imagePath}`;
    } else {
      processedCategory.image = imagePath;
    }

    console.log('Final processed image:', processedCategory.image);
  } catch (error) {
    console.error('Error processing category image:', error);
    processedCategory.image = 'assets/images/category-placeholder.png';
  }

  return processedCategory;
}
}
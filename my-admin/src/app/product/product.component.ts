import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { IProduct } from '../interfaces/product';
import { Category } from '../interfaces/category';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  products: IProduct[] = [];
  categories: Category[] = [];
  filteredProducts: IProduct[] = []; // Danh sách sản phẩm hiển thị trên trang
  errorMessage: string = '';
  Math = Math;

  // Phân trang
  currentPage: number = 1;
  itemsPerPage: number = 5; // Số sản phẩm mỗi trang
  totalItems: number = 0; // Tổng số sản phẩm
  totalPages: number = 0; // Tổng số trang
  pageNumbers: number[] = []; // Mảng số trang để hiển thị

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories(); // Đảm bảo danh mục được tải trước
  }

  // Load danh sách sản phẩm
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: IProduct[]) => {
        this.products = data;
        this.totalItems = this.products.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePageNumbers();
        this.mapCategoryNames(); // Ánh xạ tên danh mục sau khi tải sản phẩm
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Error loading products:', err);
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any[]) => {
        console.log('Raw categories data:', data);
        console.log('First category sample:', data[0]);
        
        // Transform category data with flexible property name handling
        this.categories = data.map(cat => {
          // Handle properties that might be capitalized differently
          const formattedCat: Category = {
            _id: cat._id || cat.id || cat._id?.$oid,
            id: cat.id || cat._id || '',
            name: cat.name || cat.Name || 'Unnamed Category',
            description: cat.description || cat.Description || '',
            slug: cat.slug || cat.Slug || '',
            parentCategory: cat.parentCategory || cat.ParentCategory || null,
            image: cat.image || cat.Image || ''
          };
          
          // Handle ObjectId format if present
          if (typeof formattedCat._id === 'object' && formattedCat._id && '$oid' in formattedCat._id) {
            formattedCat._id = formattedCat._id.$oid;
          }
          
          return formattedCat;
        });
        
        console.log('Processed categories:', this.categories);
        console.log('Category IDs:', this.categories.map(c => c._id));
        this.loadProducts(); // Load products after categories
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load categories';
        console.error('Error loading categories:', err);
      },
    });
  }
  mapCategoryNames(): void {
    console.log('🟢 Categories:', this.categories);
    console.log('🟢 Products:', this.products);
  
    if (!this.products.length || !this.categories.length) {
      console.warn('No products or categories available for mapping');
      return;
    }
  
    // Create a categoryMap for faster lookups by ID with more variants
    const categoryMap: { [key: string]: string } = {};
    this.categories.forEach(category => {
      // Debug each category's structure
      console.log('Processing category:', category);
      console.log('Category ID type:', typeof category._id);
      
      // Check for Name vs name (case sensitivity in property names)
      const categoryName = category.name || (category as any).Name || 'Unnamed';
      
      if (category._id) {
        // Store the ID in multiple formats
        if (typeof category._id === 'string') {
          categoryMap[category._id] = categoryName;
          // Store lowercase version for case-insensitive matching
          categoryMap[category._id.toLowerCase()] = categoryName;
        } else if (typeof category._id === 'object') {
          if ('$oid' in category._id) {
            categoryMap[category._id.$oid] = categoryName;
            // Store lowercase version
            categoryMap[category._id.$oid.toLowerCase()] = categoryName;
          }
        }
        
        // Always store stringified version
        categoryMap[String(category._id)] = categoryName;
        categoryMap[String(category._id).toLowerCase()] = categoryName;
      }
    });
  
    console.log('📊 Category Map:', categoryMap);
  
    // Check first product's category_id format for debugging
    if (this.products.length > 0) {
      const firstProduct = this.products[0];
      console.log('First product category_id:', firstProduct.category_id);
      console.log('First product category_id type:', typeof firstProduct.category_id);
      console.log('First product category_id stringified:', JSON.stringify(firstProduct.category_id));
    }
  
    this.products.forEach((product) => {
      let categoryFound = false;
      
      if (product.category_id) {
        // Try various formats
        const categoryIdStr = typeof product.category_id === 'string' 
          ? product.category_id 
          : (product.category_id as any).$oid || String(product.category_id);
        
        console.log(`Looking for category match for product "${product.Name}" with ID: ${categoryIdStr}`);
        
        // Try direct match
        if (categoryMap[categoryIdStr]) {
          product.category_name = categoryMap[categoryIdStr];
          categoryFound = true;
          console.log(`✅ Direct match found: ${product.category_name}`);
        }
        // Try lowercase match
        else if (categoryMap[categoryIdStr.toLowerCase()]) {
          product.category_name = categoryMap[categoryIdStr.toLowerCase()];
          categoryFound = true;
          console.log(`✅ Case-insensitive match found: ${product.category_name}`);
        } 
        // Try all keys for potential partial matches
        else {
          const categoryKeys = Object.keys(categoryMap);
          for (const key of categoryKeys) {
            if (key.includes(categoryIdStr) || categoryIdStr.includes(key)) {
              product.category_name = categoryMap[key];
              categoryFound = true;
              console.log(`✅ Partial match found: ${key} -> ${product.category_name}`);
              break;
            }
          }
        }
      }
  
      if (!categoryFound) {
        console.warn(`⚠️ No category found for product: ${product.Name} with ID: ${JSON.stringify(product.category_id)}`);
        // Output all category IDs for comparison
        console.log('Available category IDs:', Object.keys(categoryMap));
        product.category_name = 'Unknown';
      }
    });
    
    // After mapping categories, update display
    this.processProductImages();
    this.updateFilteredProducts();
  }

  // Hàm xử lý hình ảnh sản phẩm
  processProductImages(): void {
    this.products.forEach(product => {
      // Đảm bảo Image là một mảng
      if (typeof product.Image === 'string') {
        try {
          product.Image = JSON.parse(product.Image);
        } catch (e) {
          console.error(`Error parsing image for product ${product.Name}:`, e);
          product.Image = [];
        }
      } else if (!Array.isArray(product.Image)) {
        product.Image = [];
      }
    });
  }

  // Cập nhật danh sách sản phẩm hiển thị theo trang
  updateFilteredProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredProducts = this.products.slice(startIndex, endIndex);
    console.log(`Showing products ${startIndex+1} to ${Math.min(endIndex, this.totalItems)} of ${this.totalItems}`);
  }

  // Cập nhật mảng số trang
  updatePageNumbers(): void {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumbers.push(i);
    }
    console.log('Page numbers updated:', this.pageNumbers);
  }

  // Chuyển đến trang cụ thể
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateFilteredProducts();
    }
  }

  // Trang trước
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateFilteredProducts();
    }
  }

  // Trang sau
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateFilteredProducts();
    }
  }

  // Hàm xử lý các chức năng cơ bản
  addProduct(): void {
    const newProduct: IProduct = {
      Name: 'New Product',
      Price: 100,
      Description: 'A new product description',
      Origin: 'Unknown',
      Uses: 'General use',
      Store: 'Default Store',
      Quantity: 10,
      Create_date: new Date(),
      Image: [],
      category_id: 'default-category-id',
    };
    this.productService.createProduct(newProduct).subscribe({
      next: (product) => {
        this.products.push(product);
        this.totalItems = this.products.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePageNumbers();
        this.updateFilteredProducts();
        alert('Product added successfully.');
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Error adding product:', err);
      },
    });
  }

  viewProduct(product: IProduct): void {
    alert(`Viewing product: ${product.Name}`);
  }

  editProduct(product: IProduct): void {
    alert(`Editing product: ${product.Name}`);
    const updatedProduct = { ...product, Price: product.Price + 10 };
    this.productService
      .updateProduct(product._id || '', updatedProduct)
      .subscribe({
        next: (updated) => {
          const index = this.products.findIndex((p) => p._id === updated._id);
          if (index !== -1) this.products[index] = updated;
          this.updateFilteredProducts();
          alert('Product updated successfully.');
        },
        error: (err) => {
          this.errorMessage = err.message;
          console.error('Error updating product:', err);
        },
      });
  }

  deleteProduct(identifier: string): void {
    if (
      confirm(`Are you sure you want to delete product with ID ${identifier}?`)
    ) {
      this.productService.deleteProduct(identifier).subscribe({
        next: () => {
          this.products = this.products.filter((p) => p._id !== identifier);
          this.totalItems = this.products.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.updatePageNumbers();
          this.updateFilteredProducts();
          alert('Product deleted successfully.');
        },
        error: (err) => {
          this.errorMessage = err.message;
          console.error('Error deleting product:', err);
        },
      });
    }
  }
  
  // Thêm hàm filterProducts
  filterProducts(): void {
    alert('Filter function chưa được triển khai!');
  }
  // Add this new method to your component class
getLastItemIndex(): number {
  return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
}
}
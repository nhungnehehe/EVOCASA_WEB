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
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.productService.getProducts().subscribe({
          next: (products) => {
            this.products = products;
            this.mapCategoryNames();
          },
        });
      },
    });
  }

  // Load danh sách sản phẩm
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: IProduct[]) => {
        this.products = data;
        this.loadCategories(); // Gọi loadCategories để đảm bảo danh mục được tải trước
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Error loading products:', err);
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.mapCategoryNames(); // Ánh xạ lại category_name sau khi danh mục đã tải xong
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Error loading categories:', err);
      },
    });
  }

  mapCategoryNames(): void {
    console.log('🟢 Categories:', this.categories);
    console.log('🟢 Products:', this.products);

    console.log('🔄 Mapping categories to products...');
    if (this.products.length && this.categories.length) {
      this.products.forEach((product) => {
        const category = this.categories.find(
          (c) => String(c._id) === String(product.category_id)
        );

        console.log(
          `🔎 Product: ${product.Name}, category_id: ${product.category_id}, 
          Found Category: ${category ? category.name : 'Not Found'}`
        );

        product.category_name = category ? category.name : 'Unknown';
      });
      this.updateFilteredProducts();
    }
  }

  // Cập nhật danh sách sản phẩm hiển thị theo trang
  updateFilteredProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredProducts = this.products.slice(startIndex, endIndex);
  }

  // Cập nhật mảng số trang
  updatePageNumbers(): void {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumbers.push(i);
    }
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
}

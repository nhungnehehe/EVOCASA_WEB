import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { Category } from '../../interfaces/category';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
    product = new Product();
    selectedFiles: File[] = []; // Ảnh đã chọn để upload
    previewImages: string[] = []; // Ảnh xem trước
    maxImages: number = 5; // Giới hạn số ảnh có thể tải lên
    categories: Category[] = []; // Lưu danh sách category từ API

    public setProduct(p: Product) {
      this.product = p;
    }

    ngOnInit() {
      this.product.category_id = "";
      this.product.Image = this.product.Image || []; // Đảm bảo Images luôn là một mảng
      this.loadMainCategories();
  }
    constructor(
      private ProductService: ProductService, 
      private CategoryService: CategoryService,
      private router: Router, 
      private activateRoute: ActivatedRoute) {}
  
    
  //  Gọi API để lấy danh sách danh mục chính
   loadMainCategories() {
    this.CategoryService.getMainCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.errMessage = 'Error loading main categories')
    });
  }

  //  Lấy ID của category dựa vào tên
  getCategoryIdByName(categoryName: string): string | null {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.id : null;
  }
    errMessage: string = '';

  // Xử lý khi chọn file ảnh
  onFilesSelected(event: any) {
    if (event.target.files && event.target.files.length) {
      for (let file of event.target.files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.product.Image.push(e.target.result); // Đẩy URL vào mảng ảnh
        };
        reader.readAsDataURL(file); // Đọc file ảnh dưới dạng URL
      }
    }
  }

  triggerFileInput() {
    document.getElementById('file-upload')?.click();
  }
  
  // Xóa ảnh theo index
  removeImage(index: number) {
    if (this.product.Image && this.product.Image.length > index) {
      this.product.Image.splice(index, 1); // Xóa ảnh theo index
    }
  }

  
    postProduct() {
      this.ProductService.createProduct(this.product).subscribe({
        next: (data) => {
          this.product = data;
          alert('Product added successfully');
          this.goBack();
        },
        error: (err) => {
          this.errMessage = err.error?.message || 'Error adding product';
        }
      });
    }
  
    goBack() {
      this.router.navigate(['/admin-product']);
    }
}

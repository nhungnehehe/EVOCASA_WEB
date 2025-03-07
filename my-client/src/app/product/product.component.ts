import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service'; 
import { IProduct } from '../interfaces/product';
import {Router} from '@angular/router';


@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  products: any[] = []; // Danh sách sản phẩm
  errMessage: string = ''; // Biến để lưu thông báo lỗi
  lastCategory: string | null = null;
  hovered: boolean = false; // Thêm thuộc tính hovered để kiểm tra trạng thái hover
  hoveredIndex: number = -1; // Thêm thuộc tính hoveredIndex để xác định ảnh đang được hover

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((product: any) => {
          if (product.Image && typeof product.Image === 'string') {
            try {
              product.Image = JSON.parse(product.Image); // Ensure it is an array of image URLs
            } catch (e) {
              console.error("Error parsing images for product:", product.Name, e);
              product.Image = []; // Fallback if parsing fails
            }
          }
          return product;
        });
      },
      error: (err) => {
        this.errMessage = 'Error fetching products. Please try again later.';
        console.error('Error:', err);
      }
    });
    this.initializeMenu()
  }
  // Check if product.Image is an array, and parse if necessary
loadProducts(): void {
  this.productService.getProducts().subscribe({
    next: (data) => {
      this.products = data.map((product: any) => {
        if (product.Image && typeof product.Image === 'string') {
          try {
            product.Image = JSON.parse(product.Image);
          } catch (e) {
            console.error("Error parsing images for product:", product.Name, e);
            product.Image = [];
          }
        }
        return product;
      });
    },
    error: (err) => {
      this.errMessage = 'Error fetching products. Please try again later.';
    }
  });
}


  // Update hoveredIndex only when hovered over a product with more than one image
// Update hoveredIndex only when hovered over a product with more than one image
onHover(index: number): void {
  // If the product has more than 1 image, set the hovered index to the next one
  if (this.products[index].Image.length > 1) {
    this.hoveredIndex = 1;  // Show the second image (index 1) when hovering
  }
}

// Reset the hoveredIndex when the hover ends
onHoverOut(): void {
  this.hoveredIndex = -1;  // Reset to the main image
}


// Initialize the menu, hiding second-level categories
initializeMenu(): void {
  const level2s = document.querySelectorAll('.level2');
  level2s.forEach((submenu: any) => submenu.style.display = 'none');
}

// Toggle opacity and active class for categories and subcategories
toggleOpacity(category: string): void {
  const allCategories = document.querySelectorAll('.category, .subcategory');
  allCategories.forEach((item: any) => item.classList.remove('active'));

  const firstLevelCategory = this.getFirstLevelCategory(category);
  if (firstLevelCategory) {
    firstLevelCategory.classList.add('active');
  }

  const subCategory = document.querySelector(`.subcategory[onclick="toggleSubMenu('${category}')"]`);
  if (subCategory) {
    subCategory.classList.add('active');
  }
}

// Find the first-level category based on the selected subcategory
getFirstLevelCategory(category: string): any {
  if (category === 'kitchen-accessories' || category === 'serving-dishes' || category === 'barware' || category === 'utensils' || category === 'candleholders' || category === 'glassware') {
    return document.querySelector('.category[onclick="toggleSubMenu(\'dining-entertaining\')"]');
  }
  if (category === 'tables' || category === 'seating' || category === 'casegoods') {
    return document.querySelector('.category[onclick="toggleSubMenu(\'furniture\')"]');
  }
  if (category === 'vases-vessels' || category === 'decorative-objects' || category === 'bowls-dishes' || category === 'mirrors' || category === 'utility' || category === 'bath-accessories') {
    return document.querySelector('.category[onclick="toggleSubMenu(\'decor\')"]');
  }
  if (category === 'pillows') {
    return document.querySelector('.category[onclick="toggleSubMenu(\'soft-goods\')"]');
  }
  if (category === 'table-lamps') {
    return document.querySelector('.category[onclick="toggleSubMenu(\'lighting\')"]');
  }
  if (category === 'vintage' || category === 'artisan') {
    return document.querySelector('.category[onclick="toggleSubMenu(\'art\')"]');
  }
  return null;
}

// Toggle submenus and update the category display
toggleSubMenu(category: string): void {
  this.toggleOpacity(category);

  const allCategories = document.querySelectorAll('.category, .subcategory');
  allCategories.forEach((item: any) => item.classList.remove('active'));

  if (category === 'all') {
    const level2s = document.querySelectorAll('.level2');
    level2s.forEach((submenu: any) => submenu.style.display = 'none');
    this.lastCategory = null;
    return;
  }

  const casegoodsTitle = document.getElementById('all-title');
  const categories: any = {
    'all': 'All',
    'furniture': 'Furniture',
    'decor': 'Decor',
    'dining-entertaining': 'Dining & Entertaining',
    'soft-goods': 'Soft Goods',
    'lighting': 'Lighting',
    'art': 'Art'
  };

  const subcategories: any = {
    'tables': 'Tables',
    'seating': 'Seating',
    'casegoods': 'Casegoods',
    'vases-vessels': 'Vases & Vessels',
    'decorative-objects': 'Decorative Objects',
    'bowls-dishes': 'Bowls & Dishes',
    'mirrors': 'Mirrors',
    'utility': 'Utility',
    'bath-accessories': 'Bath Accessories',
    'kitchen-accessories': 'Kitchen Accessories',
    'serving-dishes': 'Serving Dishes',
    'barware': 'Barware',
    'utensils': 'Utensils',
    'candleholders': 'Candleholders',
    'glassware': 'Glassware',
    'pillows': 'Pillows',
    'table-lamps': 'Table Lamps',
    'vintage': 'Vintage',
    'artisan': 'Artisan'
  };

  // Check if casegoodsTitle is not null
  if (casegoodsTitle) {
    if (categories[category]) {
      casegoodsTitle.textContent = categories[category];

      if (this.lastCategory && this.lastCategory !== category) {
        const prevMenu = document.getElementById(this.lastCategory);
        if (prevMenu) {
          prevMenu.style.display = 'none';
        }
      }

      const menu = document.getElementById(category);
      if (menu) {
        menu.style.display = 'flex';
      }

      this.lastCategory = category;

      const firstLevelCategory = document.querySelector(`.category[onclick="toggleSubMenu('${category}')"]`);
      if (firstLevelCategory) {
        firstLevelCategory.classList.add('active');
      }
    } else if (subcategories[category]) {
      casegoodsTitle.textContent = subcategories[category];
      const subCategory = document.querySelector(`.subcategory[onclick="toggleSubMenu('${category}')"]`);
      if (subCategory) {
        subCategory.classList.add('active');
      }

      const firstLevelCategory = this.getFirstLevelCategory(category);
      if (firstLevelCategory) {
        firstLevelCategory.classList.add('active');
      }
    }
  }
}
  viewProductDetails(product: IProduct): void {
    if (product.Name) {
      const productName=encodeURIComponent(product.Name.trim());
      this.router.navigate(['/product', productName]);
    } else {
      console.error('Error: Product name is missing');

    }
  }

}
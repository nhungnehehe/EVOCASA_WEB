import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { ProductService } from '../services/product.service'; 
import { IProduct } from '../interfaces/product';
import { Router } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../interfaces/category';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  encapsulation: ViewEncapsulation.Emulated 
})
export class ProductComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  allProducts: any[] = [];

  categories: Category[] = [];
  mainCategories: Category[] = [];
  // Map slug -> name
  categoryMapping: { [key: string]: string } = {};
  // Map slug -> description
  categoryDescriptionMapping: { [key: string]: string } = {};
  // Map subcategory slug -> parent category slug
  categoryHierarchy: { [key: string]: string } = {};
  // Map slug -> _id
  categoryIdMapping: { [key: string]: string } = {};
  // Map _id -> slug
  categorySlugMapping: { [key: string]: string } = {};

  errMessage: string = '';
  lastCategory: string | null = null;
  hovered: boolean = false;
  hoveredIndex: number = -1;
  categoriesLoaded: boolean = false;
  currentCategoryId: string = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadCategories(); // Tải categories trước khi tạo menu
    this.loadProducts();
    this.initializeMenu();
  }

  ngAfterViewInit(): void {
    // Chờ cho đến khi categories được tải kèm mainCategories
    const intervalId = setInterval(() => {
      if (this.categoriesLoaded && this.mainCategories.length > 0) {
        this.initializeMenu();
        this.setupCategoryMenu();
        clearInterval(intervalId);
        console.log('Setup category menu completed');
      }
    }, 300);
    setTimeout(() => {
      clearInterval(intervalId);
      if (!this.categoriesLoaded) {
        console.warn('Timeout reached, categories might not be loaded!');
      }
    }, 5000);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data.map((product: any) => {
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
        this.filteredProducts = [...this.allProducts];
        this.products = this.filteredProducts;
        console.log(`Loaded ${this.products.length} products`);
      },
      error: (err) => {
        this.errMessage = 'Error fetching products. Please try again later.';
        console.error('Error loading products:', err);
      }
    });
  }

  // Chuyển đổi dữ liệu Category theo đúng interface của bạn
  loadCategories(): void {
    console.log('Loading categories...');
    this.categoryService.getCategories().subscribe({
      next: (data: any[]) => {
        // Mapping dữ liệu: chuyển từ { Name, Slug, Description, ParentCategory, … } sang { name, slug, description, parentCategory, … }
        this.categories = data.map(cat => {
          return {
            _id: cat._id, // giả sử _id ở đây là string
            name: cat.Name,
            description: cat.Description,
            slug: cat.Slug,
            parentCategory: cat.ParentCategory ? (cat.ParentCategory.$oid || cat.ParentCategory) : null
          } as Category;
        });
        console.log('Categories loaded:', this.categories.length);

        // Xây dựng mapping
        this.categories.forEach(category => {
          this.categoryMapping[category.slug] = category.name;
          this.categoryDescriptionMapping[category.slug] = category.description;
          this.categoryIdMapping[category.slug] = category._id;
          this.categorySlugMapping[category._id] = category.slug;
        });


        this.categories.forEach(category => {
          if (category.parentCategory) {
            const parentCategory = this.categories.find(c => c._id === category.parentCategory);
            if (parentCategory) {
              this.categoryHierarchy[category.slug] = parentCategory.slug;
            }
          }
        });

        this.mainCategories = this.categories.filter(category => category.parentCategory === null);
        console.log('Main categories:', this.mainCategories);
        this.categoriesLoaded = true;
      },
      error: (err) => {
        this.errMessage = 'Error fetching categories. Please try again later.';
        console.error('Error loading categories:', err);
        this.categoriesLoaded = true;
      }
    });
  }

  filterProductsByCategory(categorySlug: string): void {
    if (categorySlug === 'all') {
      this.filteredProducts = [...this.allProducts];
      this.products = this.filteredProducts;
      return;
    }
  
    const selectedCategoryId = this.categoryIdMapping[categorySlug];
    if (!selectedCategoryId) {
      console.error(`Category ID not found for slug: ${categorySlug}`);
      return;
    }
  
    const isMainCategory = this.mainCategories.some(cat => cat._id === selectedCategoryId);
    if (isMainCategory) {
      console.log(`Filtering products for main category: ${categorySlug}`);
      const subCategoryIds = this.categories
        .filter(cat => cat.parentCategory === selectedCategoryId)
        .map(cat => cat._id);
      this.filteredProducts = this.allProducts.filter(product => {
        const prodCatId: string = product.category_id;
        return subCategoryIds.includes(prodCatId);
      });
    } else {
      console.log(`Filtering products for subcategory: ${categorySlug}`);
      this.filteredProducts = this.allProducts.filter(product => {

        return product.category_id === selectedCategoryId;
      });
    }
    console.log(`Found ${this.filteredProducts.length} products for category ${categorySlug}`);
    this.products = this.filteredProducts;
  }

  setupCategoryMenu(): void {
    console.log('Setting up category menu...');
    console.log('Main categories:', this.mainCategories);
    const menuContainer = this.el.nativeElement.querySelector('#menu-list');
    if (!menuContainer) {
      console.error('Menu container not found!');
      return;
    }
    if (!this.mainCategories.length) {
      console.warn('No main categories found!');
      return;
    }
    // Xóa bỏ các phần tử con cũ của .level1 (ngoại trừ nút "All")
    const level1 = this.el.nativeElement.querySelector('.level1');
    if (level1) {
      const children = Array.from(level1.children);
      for (let i = children.length - 1; i >= 0; i--) {
        if (i > 0) {
          level1.removeChild(children[i]);
        }
      }
      // Tạo lại các nút cho main category
      this.mainCategories.forEach(category => {
        const mainCategoryEl = this.renderer.createElement('div');
        this.renderer.addClass(mainCategoryEl, 'category');
        this.renderer.setProperty(mainCategoryEl, 'textContent', category.name);
        this.renderer.listen(mainCategoryEl, 'click', () => {
          this.toggleSubMenu(category.slug);
        });
        this.renderer.appendChild(level1, mainCategoryEl);
      });
    }
    // Xóa các submenu cũ (level2)
    const oldSubMenus = this.el.nativeElement.querySelectorAll('.level2');
    oldSubMenus.forEach((submenu: any) => {
      if (submenu.parentNode) {
        submenu.parentNode.removeChild(submenu);
      }
    });
    // Tạo submenu cho từng main category dựa trên subcategories
    this.mainCategories.forEach(category => {
      const subMenuContainer = this.renderer.createElement('div');
      this.renderer.setAttribute(subMenuContainer, 'id', category.slug);
      this.renderer.addClass(subMenuContainer, 'level2');
      const subcategories = this.getSubcategoriesForCategory(category._id);
      console.log(`Subcategories for ${category.name}:`, subcategories);
      subcategories.forEach(subcat => {
        const subcategoryEl = this.renderer.createElement('div');
        this.renderer.addClass(subcategoryEl, 'subcategory');
        this.renderer.setProperty(subcategoryEl, 'textContent', subcat.name);
        this.renderer.listen(subcategoryEl, 'click', () => {
          this.toggleSubMenu(subcat.slug);
        });
        this.renderer.appendChild(subMenuContainer, subcategoryEl);
      });
      this.renderer.appendChild(menuContainer, subMenuContainer);
    });
    console.log('Category menu setup completed');
  }

  getSubcategoriesForCategory(categoryId: string): Category[] {
    return this.categories.filter(cat => cat.parentCategory === categoryId);
  }

  initializeMenu(): void {
    const level2s = document.querySelectorAll('.level2');
    level2s.forEach((submenu: any) => submenu.style.display = 'none');
  }

  toggleOpacity(category: string): void {
    const allElements = document.querySelectorAll('.category, .subcategory');
    allElements.forEach((el: any) => el.classList.remove('active'));
    if (this.categoryHierarchy[category]) {
      const parentSlug = this.categoryHierarchy[category];
      const parentName = this.categoryMapping[parentSlug];
      const catEls = document.querySelectorAll('.category');
      catEls.forEach((el: any) => {
        if (el.textContent === parentName) {
          el.classList.add('active');
        }
      });
      const subEls = document.querySelectorAll('.subcategory');
      subEls.forEach((el: any) => {
        if (el.textContent === this.categoryMapping[category]) {
          el.classList.add('active');
        }
      });
    } else {
      const catEls = document.querySelectorAll('.category');
      catEls.forEach((el: any) => {
        if (el.textContent === this.categoryMapping[category]) {
          el.classList.add('active');
        }
      });
    }
  }

  toggleSubMenu(category: string): void {
    console.log('Toggle submenu for:', category);
    this.toggleOpacity(category);
    this.filterProductsByCategory(category);
    // Cập nhật tiêu đề lớn và mô tả
    if (category === 'all') {
      const level2s = document.querySelectorAll('.level2');
      level2s.forEach((submenu: any) => submenu.style.display = 'none');
      this.lastCategory = null;
      const titleEl = document.getElementById('all-title');
      if (titleEl) {
        titleEl.textContent = 'Shop All';
      }
      const descEl = document.getElementById('category-description');
      if (descEl) {
        descEl.textContent = '';
      }
      return;
    }
    const titleEl = document.getElementById('all-title');
    if (titleEl) {
      // Cập nhật tiêu đề theo tên category
      titleEl.textContent = this.categoryMapping[category] || 'All';
    }
    const descEl = document.getElementById('category-description');
    if (descEl) {
      // Lấy description từ mapping hoặc từ categories
      let descriptionText = this.categoryDescriptionMapping[category] || '';
      // Nếu đây là subcategory, bạn có thể lấy description của nó
      if (!descriptionText) {
        const selectedCategory = this.categories.find(cat => cat.slug === category);
        if (selectedCategory) {
          descriptionText = selectedCategory.description;
        }
      }
      descEl.textContent = descriptionText;
    }
    const isMainCategory = this.mainCategories.some(cat => cat.slug === category);
    if (isMainCategory) {
      console.log('Is main category. Showing submenu.');
      if (this.lastCategory && this.lastCategory !== category) {
        const prevMenu = document.getElementById(this.lastCategory);
        if (prevMenu) {
          prevMenu.style.display = 'none';
        }
      }
      const menu = document.getElementById(category);
      if (menu) {
        console.log('Found submenu element. Setting display to flex.');
        menu.style.display = 'flex';
        this.lastCategory = category;
      } else {
        console.warn(`Submenu element with id #${category} not found!`);
      }
    } else {
      console.log('Is subcategory.');
    }
  }

  onHover(index: number): void {
    if (this.products[index].Image && this.products[index].Image.length > 1) {
      this.hoveredIndex = 1;
    }
  }

  onHoverOut(): void {
    this.hoveredIndex = -1;
  }

  viewProductDetails(product: IProduct): void {
    if (product.Name) {
      const productName = encodeURIComponent(product.Name.trim());
      this.router.navigate(['/product', productName]);
    } else {
      console.error('Error: Product Name is missing');
    }
  }
}
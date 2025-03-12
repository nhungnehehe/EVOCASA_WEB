import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { ProductService } from '../services/product.service'; 
import { IProduct } from '../interfaces/product';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { Category } from '../interfaces/category';
import { Location } from '@angular/common';

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
  categoryMapping: { [key: string]: string } = {};
  categoryDescriptionMapping: { [key: string]: string } = {};
  categoryHierarchy: { [key: string]: string } = {};
  categoryIdMapping: { [key: string]: string } = {};
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
    private route: ActivatedRoute,
    private location: Location,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data: any) => {
      this.allProducts = data.products.map((product: any) => {
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
      console.log(`Loaded ${this.products.length} products (via resolver)`);
      
      this.loadCategories();
    });
    
    this.initializeMenu();
  }

  ngAfterViewInit(): void {
  const intervalId = setInterval(() => {
    if (this.categoriesLoaded && this.mainCategories.length > 0) {
      this.setupCategoryMenu();
      setTimeout(() => {
        this.handleRouteParams(); 
        console.log('Applied active states to category menu');
      }, 50);
      
      clearInterval(intervalId);
      console.log('Setup category menu completed');
    }
  }, 100);
  
  setTimeout(() => {
    clearInterval(intervalId);
    if (!this.categoriesLoaded) {
      console.warn('Timeout reached, categories might not be loaded!');
      this.handleRouteParams();
    }
  }, 2000);
}

private handleRouteParams(): void {
  const mainCategoryParam = this.route.snapshot.paramMap.get('mainCategory');
  const subCategoryParam = this.route.snapshot.paramMap.get('subCategory');
  
  if (mainCategoryParam) {
    const mainCat = this.categories.find(cat => 
      cat.slug.toLowerCase() === mainCategoryParam.toLowerCase());
    
    if (mainCat) {
      console.log('Found main category in params:', mainCat.name);
      
      this.showSubmenu(mainCat.slug);
      setTimeout(() => {
        this.activateCategory(mainCat.slug);
      }, 0);
      
      if (subCategoryParam) {
        const subCat = this.categories.find(cat => 
          cat.slug.toLowerCase() === subCategoryParam.toLowerCase());
        
        if (subCat) {
          console.log('Found subcategory in params:', subCat.name);
          
          setTimeout(() => {
            this.activateSubcategory(subCat.slug);
          }, 0);
          
          this.filterProductsByCategory(subCat.slug);
          
          this.updateTitleAndDescription(subCat.slug);
          
          this.lastCategory = mainCat.slug;
          return;
        }
      }
      
      this.filterProductsByCategory(mainCat.slug);
      
      this.updateTitleAndDescription(mainCat.slug);
      this.lastCategory = mainCat.slug;
    }
  }
}

private activateCategory(categorySlug: string): void {
  setTimeout(() => {
    const catElements = document.querySelectorAll('.category');
    catElements.forEach((el: any) => {
      el.classList.remove('active');
      if (el.textContent === this.categoryMapping[categorySlug]) {
        el.classList.add('active');
        console.log('Activated main category:', el.textContent);
      }
    });
  }, 0);
}

private activateSubcategory(subcategorySlug: string): void {
  setTimeout(() => {
    const subcatElements = document.querySelectorAll('.subcategory');
    subcatElements.forEach((el: any) => {
      el.classList.remove('active');
      if (el.textContent === this.categoryMapping[subcategorySlug]) {
        el.classList.add('active');
        console.log('Activated subcategory:', el.textContent);
      }
    });
  }, 0);
}
  
private showSubmenu(categorySlug: string): void {
  setTimeout(() => {
    const allSubmenus = document.querySelectorAll('.level2');
    allSubmenus.forEach((menu: any) => {
      menu.style.display = 'none';
    });
    const submenu = document.getElementById(categorySlug);
    if (submenu) {
      submenu.style.display = 'flex';
      this.lastCategory = categorySlug;
      console.log('Showed submenu for:', categorySlug);
    } else {
      console.warn(`Submenu for ${categorySlug} not found in DOM yet`);
    }
  }, 0);
}
  
  private updateTitleAndDescription(categorySlug: string): void {
    const titleEl = document.getElementById('all-title');
    if (titleEl) {
      titleEl.textContent = this.categoryMapping[categorySlug] || 'All';
    }
    
    const descEl = document.getElementById('category-description');
    if (descEl) {
      descEl.textContent = this.categoryDescriptionMapping[categorySlug] || '';
    }
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

  loadCategories(): void {
    console.log('Loading categories...');
    this.categoryService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data.map(cat => {
          return {
            _id: cat._id,
            name: cat.Name,
            description: cat.Description,
            slug: cat.Slug,
            parentCategory: cat.ParentCategory ? (cat.ParentCategory.$oid || cat.ParentCategory) : null
          } as Category;
        });
        console.log('Categories loaded:', this.categories.length);
  
        this.categories.forEach(category => {
          this.categoryMapping[category.slug] = category.name;
          this.categoryDescriptionMapping[category.slug] = category.description;
          this.categoryIdMapping[category.slug] = category._id;
          this.categorySlugMapping[category._id] = category.slug;
        });
  
        this.categories.forEach(category => {
          if (category.parentCategory) {
            const parent = this.categories.find(c => c._id === category.parentCategory);
            if (parent) {
              this.categoryHierarchy[category.slug] = parent.slug;
            }
          }
        });
  
        this.mainCategories = this.categories.filter(cat => cat.parentCategory === null);
        console.log('Main categories:', this.mainCategories);
        this.categoriesLoaded = true;
        this.handleRouteParams();
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
    console.log('Filtering by slug:', categorySlug, '-> selectedCategoryId:', selectedCategoryId);
    
    if (!selectedCategoryId) {
      console.error(`Category ID not found for slug: ${categorySlug}`);
      return;
    }
    
    const isMainCategory = this.mainCategories.some(cat => cat.slug === categorySlug);
    
    if (isMainCategory) {
      console.log(`Filtering products for main category: ${categorySlug}`);
      
      const subCategoryIds = this.categories
        .filter(cat => cat.parentCategory === selectedCategoryId)
        .map(cat => cat._id);
        
      console.log('Sub categories IDs:', subCategoryIds);
    
      this.filteredProducts = this.allProducts.filter(product => {
        if (!product.category_id) return false;
        const prodCatId = product.category_id.toString();
        return prodCatId === selectedCategoryId || 
               subCategoryIds.some(id => id.toString() === prodCatId);
      });
    } else {
      console.log(`Filtering products for subcategory: ${categorySlug}`);
      this.filteredProducts = this.allProducts.filter(product => {
        if (!product.category_id) return false;
        return product.category_id.toString() === selectedCategoryId.toString();
      });
    }
    
    console.log(`Found ${this.filteredProducts.length} products for category ${categorySlug}`);
    this.products = this.filteredProducts;
  }

  setupCategoryMenu(): void {
    console.log('Setting up category menu...');
    const menuContainer = this.el.nativeElement.querySelector('#menu-list');
    if (!menuContainer) {
      console.error('Menu container not found!');
      return;
    }
    if (!this.mainCategories.length) {
      console.warn('No main categories found!');
      return;
    }

    const oldSubMenus = this.el.nativeElement.querySelectorAll('.level2');
    oldSubMenus.forEach((submenu: any) => {
      if (submenu.parentNode) {
        submenu.parentNode.removeChild(submenu);
      }
    });
    
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
  
    const categoryElements = this.el.nativeElement.querySelectorAll('.category');
    categoryElements.forEach((el: any) => {
      this.renderer.listen(el, 'mouseenter', () => {
        const categorySlug = this.getCategorySlugFromText(el.textContent);
        if (categorySlug) {
          const allSubmenus = document.querySelectorAll('.level2');
          allSubmenus.forEach((menu: any) => {
            menu.style.display = 'none';
          });
          
          const submenu = document.getElementById(categorySlug);
          if (submenu) {
            submenu.style.display = 'flex';
          }
        }
      });
    });
    
    this.renderer.listen(menuContainer, 'mouseleave', () => {
      if (!this.lastCategory) {
        const allSubmenus = document.querySelectorAll('.level2');
        allSubmenus.forEach((menu: any) => {
          menu.style.display = 'none';
        });
      } else {
        const allSubmenus = document.querySelectorAll('.level2');
        allSubmenus.forEach((menu: any) => {
          menu.style.display = 'none';
        });
        
        const activeSubmenu = document.getElementById(this.lastCategory);
        if (activeSubmenu) {
          activeSubmenu.style.display = 'flex';
        }
      }
    });
    
    console.log('Category menu setup completed');
  }

  private getCategorySlugFromText(text: string): string | null {
    if (text === 'All') return 'all';
    
    const category = this.mainCategories.find(c => c.name === text);
    return category ? category.slug : null;
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
    if (category === 'all') {
      const catElements = document.querySelectorAll('.category, .subcategory');
      catElements.forEach((el: any) => {
        el.classList.remove('active');
      });
      
      const allCatElement = this.el.nativeElement.querySelector('.category');
      if (allCatElement) {
        allCatElement.classList.add('active');
      }
      
      const level2s = document.querySelectorAll('.level2');
      level2s.forEach((submenu: any) => submenu.style.display = 'none');
      
      this.lastCategory = null;
      const titleEl = document.getElementById('all-title');
      if (titleEl) { titleEl.textContent = 'Shop All'; }
      
      const descEl = document.getElementById('category-description');
      if (descEl) { descEl.textContent = ''; }
      
      this.filterProductsByCategory('all');
      this.location.go('/product');
      return;
    }
  
    const isMainCategory = this.mainCategories.some(cat => cat.slug === category);
    
    if (isMainCategory) {

      this.activateCategory(category);
      this.showSubmenu(category);
      this.filterProductsByCategory(category);
      this.updateTitleAndDescription(category);
      

      this.location.go(`/product/${category}`);
    } else {

      const parentSlug = this.categoryHierarchy[category];
      
      if (parentSlug) {
        this.activateCategory(parentSlug);
        this.activateSubcategory(category);
        this.showSubmenu(parentSlug);
        this.filterProductsByCategory(category);
        this.updateTitleAndDescription(category);

        this.location.go(`/product/${parentSlug}/${category}`);
      }
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
      this.router.navigate(['/product-detail', productName]);
    } else {
      console.error('Error: Product Name is missing');
    }
  }
}
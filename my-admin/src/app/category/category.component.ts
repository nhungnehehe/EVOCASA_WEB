import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { Category } from '../interfaces/category';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  mainCategories: Category[] = [];
  subCategories: { [key: string]: Category[] } = {};

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    console.log('Category component initialized');
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('Categories fetched successfully:', data);
        this.categories = data;
        
        // Organize into main categories and subcategories
        this.mainCategories = this.categories.filter(cat => cat.parentCategory === null);
        console.log('Main categories:', this.mainCategories);
        
        // Get subcategories for each main category
        this.mainCategories.forEach(mainCat => {
          const mainCatId = this.getCategoryIdAsString(mainCat._id);
          const subs = this.categories.filter(cat => {
            const parentId = this.getCategoryIdAsString(cat.parentCategory);
            return parentId === mainCatId;
          });
          
          if (subs.length > 0) {
            this.subCategories[mainCatId] = subs;
          }
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load categories';
        console.error('Error fetching categories:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Helper method to convert ID to string format regardless of type
   */
  getCategoryIdAsString(id: string | { $oid: string } | null): string {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && '$oid' in id) return id.$oid;
    return '';
  }

  /**
   * Get image URL with fallback
   */
  getCategoryImageUrl(category: Category): string {
    if (category.image && category.image.trim() !== '') {
      return category.image;
    }
    return 'assets/images/category-placeholder.png'; // Fallback image
  }

  /**
   * Get subcategories for a given parent category
   */
  getSubcategories(parentId: string | { $oid: string }): Category[] {
    const parentIdStr = this.getCategoryIdAsString(parentId);
    return this.subCategories[parentIdStr] || [];
  }

  /**
   * Add a new category
   */
  addCategory(): void {
    const newCategory: Category = {
      id: '',
      _id: '',
      name: 'New Category',
      description: 'Description for new category',
      slug: 'new-category',
      parentCategory: null,
      image: ''
    };
    
    this.categoryService.createCategory(newCategory).subscribe({
      next: (result) => {
        console.log('Category created:', result);
        this.categories.push(result);
        this.organizeCategories();
        alert('Category created successfully!');
      },
      error: (err) => {
        console.error('Error creating category:', err);
        alert('Failed to create category: ' + (err.message || 'Unknown error'));
      }
    });
  }

  /**
   * Delete a category
   */
  deleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      const categoryId = this.getCategoryIdAsString(category._id);
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          console.log('Category deleted:', category);
          const deletedId = this.getCategoryIdAsString(category._id);
          this.categories = this.categories.filter(c => 
            this.getCategoryIdAsString(c._id) !== deletedId
          );
          this.organizeCategories();
          alert('Category deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting category:', err);
          alert('Failed to delete category: ' + (err.message || 'Unknown error'));
        }
      });
    }
  }

  /**
   * Edit a category
   */
  editCategory(category: Category): void {
    // Could open a dialog or navigate to edit page
    console.log('Editing category:', category);
    alert(`Edit functionality for "${category.name}" will be implemented soon.`);
  }

  /**
   * Organize categories into main categories and subcategories
   */
  private organizeCategories(): void {
    this.mainCategories = this.categories.filter(cat => cat.parentCategory === null);
    
    this.subCategories = {};
    this.mainCategories.forEach(mainCat => {
      const mainCatId = this.getCategoryIdAsString(mainCat._id);
      const subs = this.categories.filter(cat => {
        const parentId = this.getCategoryIdAsString(cat.parentCategory);
        return parentId === mainCatId;
      });
      
      if (subs.length > 0) {
        this.subCategories[mainCatId] = subs;
      }
    });
  }
}
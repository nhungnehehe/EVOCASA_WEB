import { Component } from '@angular/core';

import { OnInit } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { Category } from '../interfaces/category';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  categories: Category[] = []; // Define a property to store categories

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.fetchCategories(); // Fetch categories when the component initializes
  }

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('Categories fetched:', data);  // Log data để kiểm tra cấu trúc dữ liệu
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }
}
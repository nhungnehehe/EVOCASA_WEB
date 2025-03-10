import { Component } from '@angular/core';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  categories = [
    {
      image: 123450,
      name: 'Soft Goods',
      id: 'PC001',
      description:
        'Soft goods is made from  raw silk fabric on one side. It includes a plush down feather blend insert for exceptional comfort and support.',
    },
    {
      image: 123450,
      name: 'Lighting',
      id: 'PC002',
      description:
        'Explore our curated collection of vintage and artisanal lamps, designed to add warmth, character, and elegance to any space.',
    },
    {
      image: 123450,
      name: 'Furniture',
      id: 'PC003',
      description:
        'A curated selection of timeless furniture, blending history and craftsmanship to bring character and sophistication to your space.',
    },
    {
      image: 123450,
      name: 'Furniture',
      id: 'PC003',
      description:
        'A curated selection of timeless furniture, blending history and craftsmanship to bring character and sophistication to your space.',
    },
  ];
}

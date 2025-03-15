import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: false,
  // imports: [CommonModule, RouterModule]
})
export class FooterComponent implements OnInit {
  currentYear: number;
  
  constructor() {
    this.currentYear = new Date().getFullYear();
  }
  
  ngOnInit(): void {
  }
}
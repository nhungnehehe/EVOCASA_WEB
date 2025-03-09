import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  banners = [
    { image: 'assets/banner1.jpg' },
    { image: 'assets/banner2.jpg' },
    { image: 'assets/banner3.jpg' }
  ];
  
  currentIndex = 0;
  totalSlides = this.banners.length;
  slideWidth = 1525;
  interval: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  showSlide(index: number) {
    this.currentIndex = index;
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
  }

  startAutoSlide() {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private currentIndex = 0;
  private totalSlides = 3;
  private interval: any;

  constructor() {}

  initSlider(): void {
    this.startAutoSlide();
  }

  changeSlide(index: number): void {
    this.currentIndex = index;
    this.updateSlide();
    this.startAutoSlide(); 
  }

  private updateSlide(): void {
    const slider = document.querySelector('.banner-slider') as HTMLElement;
    if (slider) {
      slider.style.transform = `translateX(-${this.currentIndex * 100}vw)`;
    }
    this.updateDots();
  }

  private updateDots(): void {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  startAutoSlide(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
      this.updateSlide();
    }, 3000); 
  }

  stopAutoSlide(): void {
    if (this.interval) clearInterval(this.interval);
  }
}

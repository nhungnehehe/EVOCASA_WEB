import { AfterViewInit, Component, OnDestroy  } from '@angular/core';
import { BannerService } from '../services/banner.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements AfterViewInit, OnDestroy {

  constructor(private bannerService: BannerService) {}

  ngAfterViewInit(): void {
    this.bannerService.initSlider();
  }

  changeSlide(index: number): void {
    this.bannerService.changeSlide(index);
  }

  ngOnDestroy(): void {
    this.bannerService.stopAutoSlide();
  }
}
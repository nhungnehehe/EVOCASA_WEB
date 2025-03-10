import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-popup',
  standalone: false,
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent implements OnInit {
  isVisible = false; // Ẩn pop-up mặc định

  ngOnInit(): void {
    // Hiển thị popup sau 10 giây
    setTimeout(() => {
      this.isVisible = true;
    }, 10000);
  }

  closePopup(): void {
    this.isVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
      const popup = document.querySelector('.popup-container');
      if (this.isVisible && popup && !popup.contains(event.target as Node)) {
          this.closePopup();
      }
  }
}


import { Component, OnInit } from '@angular/core';

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

      // Sau khi popup xuất hiện, đặt timeout để tự đóng sau 10 giây
      setTimeout(() => {
        this.closePopup();
      }, 10000);

    }, 10000);
  }

  closePopup(): void {
    this.isVisible = false;
  }
}


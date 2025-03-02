import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  quantity: number = 1;

  changeQuantity(action: string): void {
    if (action === 'increase') {
      this.quantity++;
    } else if (action === 'decrease' && this.quantity > 1) {
      this.quantity--;
    }
  }
}

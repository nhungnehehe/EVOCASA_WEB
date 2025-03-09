import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog1',
  standalone: false,
  templateUrl: './blog1.component.html',
  styleUrl: './blog1.component.css',
})
export class Blog1Component implements OnInit {
  ngOnInit() {
    this.initScrollReveal();
  }

  private initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    document.querySelectorAll('.reveal').forEach((element) => {
      observer.observe(element);
    });
  }
}

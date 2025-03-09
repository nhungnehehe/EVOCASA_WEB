import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog2',
  standalone: false,
  templateUrl: './blog2.component.html',
  styleUrl: './blog2.component.css',
})
export class Blog2Component implements OnInit {
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

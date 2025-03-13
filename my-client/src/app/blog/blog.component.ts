import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit {

  truncateContent(content: string): string {
    return content.slice(0, 200) + '...';
  }

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
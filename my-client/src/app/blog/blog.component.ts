import { Component, OnInit } from '@angular/core';
import jsonData from '../../assets/blog.json';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit {
  blogs: any[] = jsonData.map((blog) => ({
    id: blog._id.$oid,
    title: blog.title,
    content: blog.content,
    thumbnail: blog.thumbnail,
    images: blog.images,
  }));

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

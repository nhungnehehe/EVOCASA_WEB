import { Component } from '@angular/core';
import jsonData from '../../assets/blog.json';
@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent {
  blogs: any[] = jsonData.map((blog) => ({
    id: blog._id.$oid,
    title: blog.title,
    content: blog.content,
    thumbnail: blog.thumbnail,
    images: blog.images,
  }));

  truncateContent(content: string): string {
    return content.slice(0, 150) + '...';
  }
}

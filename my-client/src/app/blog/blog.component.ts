import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface BlogPost {
  _id: { $oid: string };
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  images: string[];
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit {
  blogPosts: BlogPost[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<BlogPost[]>('assets/blog-data.json').subscribe(
      (data) => {
        this.blogPosts = data;
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu blog:', error);
      }
    );
  }
}

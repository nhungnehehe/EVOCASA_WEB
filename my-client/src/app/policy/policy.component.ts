import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-policy',
  standalone: false,
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.css',
})
export class PolicyComponent {
  currentSection: string = 'privacy'; // Mặc định hiển thị Privacy Policy
  id: string = '';
  selectedListItem: HTMLElement | null = null;
  constructor(private route: ActivatedRoute, private router: Router) {}

  faqs = [
    {
      question: 'What type of products does EvoCasa offer?',
      answer:
        'EvoCasa is designed for middle- and high-income customers who appreciate a refined, sophisticated lifestyle. Our products cater to those who value quality, creativity, and elegance in their living spaces, while seeking furniture and decor that’s both functional and aesthetically pleasing.',
      expanded: false,
    },
    {
      question: 'What makes EvoCasa different from other furniture brands?',
      answer:
        'EvoCasa stands out with its unique blend of minimalist design, high functionality, and a touch of vintage-inspired elegance. We prioritize quality, using premium materials to create durable, timeless pieces that enhance your living space. Our focus on simplicity, innovation, and sustainability sets us apart, appealing to those who value both style and substance in their homes.',
      expanded: false,
    },
    {
      question: 'What is EvoCasa’s vision?',
      answer:
        'Our vision is to become the leading brand in minimalist, functional, and innovative home solutions. We aim to transform living spaces into modern, harmonious environments that evolve with our customers’ needs, all while committing to sustainability and eco-friendly practices for a positive impact on both people and the planet.',
      expanded: false,
    },
    {
      question: 'How does EvoCasa ensure product quality?',
      answer:
        'We use premium materials and sophisticated designs crafted by a team of experts who understand both trends and functionality. Every piece is built to last, offering durability and long-term value, so you can enjoy your EvoCasa products for years to come.',
      expanded: false,
    },
    {
      question:
        'Why are EvoCasa products priced higher than some other brands?',
      answer:
        'Our prices reflect the premium quality, creative designs, and durable materials we use. We focus on crafting pieces that combine elegance, functionality, and longevity—offering exceptional value for customers who prioritize lasting style over mass-market alternatives.',
      expanded: false,
    },
    {
      question: 'Does EvoCasa ship internationally?',
      answer:
        'We’re working to expand our reach! Currently, our shipping options depend on your location—please check our shipping page or contact customer support for the latest details. We aim to bring EvoCasa’s style to homes worldwide as we grow.',
      expanded: false,
    },
    {
      question:
        'How can I stay updated on EvoCasa’s latest products and offers?',
      answer:
        'Sign up for our newsletter on the website or follow us on social media for the latest updates on new arrivals, exclusive offers, and design inspiration. We’d love to keep you connected to the EvoCasa community!',
      expanded: false,
    },
    {
      question: 'What inspires EvoCasa’s designs?',
      answer:
        'Our designs are inspired by a fusion of minimalist principles and vintage elegance, created by a team passionate about trends and craftsmanship. We aim to craft pieces that are both timeless and innovative, helping your home evolve into a space that’s uniquely yours.',
      expanded: false,
    },
    {
      question: 'How does EvoCasa stay competitive in the furniture market?',
      answer:
        'We leverage our strengths—unique designs, high-quality materials, and a focus on sustainability—while embracing opportunities like the rise of e-commerce and the growing demand for stylish home decor. We’re always innovating to meet our customers’ evolving needs.',
      expanded: false,
    },
  ];

  scrollToFragment(fragment: string): void {
    setTimeout(() => {
      const element = document.getElementById(fragment);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 20, // Căn chỉnh để hiện từ đầu (có thể tăng/giảm số này)
          behavior: 'smooth',
        });
      }
    }, 100); // Delay nhẹ để đảm bảo cuộn chính xác
  }

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        this.id = fragment; // Cập nhật tab active
        this.scrollToFragment(fragment);

        // 🟢 Đánh dấu trên navbar
        this.tabChange(fragment);
      }
    });
  }

  tabChange(ids: string, event?: Event) {
    this.id = ids;
    this.router.navigate([], {
      fragment: ids, // Cập nhật URL fragment
      queryParamsHandling: 'preserve', // Giữ nguyên các query parameters khác (nếu có)
    });

    if (event) {
      this.addSelectedClass(event.target as HTMLElement);
    }
  }

  addSelectedClass(selectedListItem: HTMLElement) {
    if (this.selectedListItem) {
      this.selectedListItem.classList.remove('selected');
    }
    selectedListItem.classList.add('selected');
    this.selectedListItem = selectedListItem;
  }

  toggleFaq(faq: any) {
    faq.expanded = !faq.expanded;
  }
}

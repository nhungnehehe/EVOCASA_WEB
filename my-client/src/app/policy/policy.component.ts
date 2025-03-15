import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-policy',
  standalone: false,
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.css'
})
export class PolicyComponent {
  currentSection: string = 'privacy'; // Mặc định hiển thị Privacy Policy
  id: string = '';
  selectedListItem: HTMLElement | null = null;
  constructor(private route: ActivatedRoute, private router: Router) {}

  faqs = [
    { 
      question: 'How will my plant arrive?', 
      answer: 'Your plant will arrive carefully packaged to ensure it arrives safely. We take extra precautions to protect your plant during transit by using specially designed boxes and protective materials to keep the plant secure and maintain ideal conditions. The soil is also secured to prevent any spillage, ensuring your plant arrives in perfect condition.', 
      expanded: false 
    },
    { 
      question: 'What if my order is a gift?', 
      answer: 'We offer gift options during checkout, including a personalized note that you can include with your order. Additionally, we do not include pricing information in our shipments, so the recipient won’t see the cost of the gift. Our packaging is designed to make a positive impression, adding an extra touch to your gift.', 
      expanded: false 
    },
    { 
      question: 'Do I have to repot my plant once it arrives?', 
      answer: 'It is not necessary to repot your plant immediately. However, if you choose to do so, we recommend waiting at least two weeks for the plant to acclimate to its new environment. Repotting can be beneficial if the plant outgrows its container or if you prefer a different aesthetic. Always ensure the new pot has proper drainage to avoid waterlogging.', 
      expanded: false 
    },
    { 
      question: 'What type of plant care support do you provide?', 
      answer: 'We provide ongoing support via our website, including a detailed plant care guide with instructions for watering, light requirements, and troubleshooting common issues. Our customer service team is also available to answer any questions you may have. We believe that plant care is an ongoing journey, and we’re here to support you every step of the way.', 
      expanded: false 
    },
    { 
      question: 'My plant arrived healthy but now it’s not doing well. What should I do?', 
      answer: 'If your plant was healthy upon arrival but is now experiencing issues, don’t worry! Our plant care experts are available to provide guidance and troubleshoot. Common issues like leaf drop or yellowing can be caused by changes in light or watering habits. Contact our support team for specific advice tailored to your plant’s needs.', 
      expanded: false 
    },
    { 
      question: 'My plant arrived damaged, what do I do?', 
      answer: 'Please contact us immediately with a photo of the damage. We understand how important it is for you to receive a healthy, beautiful plant, and we will work with you to make it right. We may provide a replacement or work out a solution based on the condition of the plant.', 
      expanded: false 
    },
    { 
      question: 'Why does my planter not have a drainage hole?', 
      answer: 'Our planters are designed without drainage holes to protect surfaces from water damage. However, we recommend using a layer of pebbles or stones at the bottom of the pot to create a drainage reservoir, allowing excess water to flow below the roots. Alternatively, you may use an inner plastic pot with drainage to ensure proper plant health.', 
      expanded: false 
    },
    { 
      question: 'What if I’m interested in placing a large order?', 
      answer: 'For large orders (quantities greater than 25) or corporate gifting inquiries, please fill out our contact form, and our team will reach out to discuss your specific needs. We offer special services for bulk orders, including volume discounts, customized packaging, and personalized assistance.', 
      expanded: false 
    },
    { 
      question: 'What payment options do you offer?', 
      answer: 'We accept multiple payment options at checkout, including major credit cards (Visa, MasterCard, American Express), debit cards, and digital payment methods like PayPal. We are committed to providing a secure, convenient, and flexible checkout experience to meet your payment preferences.', 
      expanded: false 
    },
    { 
      question: 'Why does my plant look different from the website?', 
      answer: 'Plants are unique and may vary slightly from the images on our website. We use high-quality photography to represent our plants, but individual variations in color, shape, and size are natural and reflect the plant’s individuality. We believe each plant is special, and these differences add to its charm.', 
      expanded: false 
    },
    { 
      question: 'Why is my discount not working at checkout?', 
      answer: 'Discounts may have limitations based on certain products, expiration dates, or minimum order requirements. Please review the terms and conditions for your specific discount. If you continue to experience issues, our customer support team is here to help troubleshoot and ensure you receive any eligible discount.', 
      expanded: false 
    },
    { 
      question: 'Does The Sill carry products from other brands?', 
      answer: 'Yes, we offer select products from trusted partners. These products are carefully curated to complement our offerings and provide you with a wide range of high-quality items, including planters, plant accessories, and care products. Our commitment is to offer products that meet our quality standards.', 
      expanded: false 
    },
  ];

  scrollToFragment(fragment: string): void {
    setTimeout(() => {
      const element = document.getElementById(fragment);
      if (element) {
        window.scrollTo({ 
          top: element.offsetTop - 20, // Căn chỉnh để hiện từ đầu (có thể tăng/giảm số này)
          behavior: 'smooth' 
        });
      }
    }, 100); // Delay nhẹ để đảm bảo cuộn chính xác
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
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
      queryParamsHandling: 'preserve' // Giữ nguyên các query parameters khác (nếu có)
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

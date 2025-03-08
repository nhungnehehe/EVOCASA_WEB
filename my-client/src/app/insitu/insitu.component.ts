import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-insitu',
  standalone: false,
  templateUrl: './insitu.component.html',
  styleUrl: './insitu.component.css'
})
export class InsituComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
    // Thêm Bootstrap script nếu cần
    this.loadExternalScripts();
  }

  ngAfterViewInit(): void {
    // Gọi các hàm JavaScript sau khi view đã được khởi tạo
    this.initializeShopTheLook();
  }

  // Hàm tải các script bổ sung nếu cần
  private loadExternalScripts(): void {
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js';
    bootstrapScript.async = true;
    document.body.appendChild(bootstrapScript);
  }

  // Chuyển các hàm từ script JavaScript sang methods của component
  private initializeShopTheLook(): void {
    const productDots = document.querySelectorAll('.circle-checkbox');
    
    // Giữ nguyên các hàm chức năng
    const positionProductInfo = (checkbox: Element, product: Element): void => {
      if (!checkbox || !product) return;
       
      // Get position relative to the container instead of window
      const container = checkbox.closest('.shop-the-look__image-wrapper');
      if (!container) return;
      
      const checkboxRect = checkbox.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
       
      // Position product info to the right of checkbox but within container bounds
      const productWidth = 300; // Set fixed width for calculation
      const productHeight = 160; // Set fixed height for calculation
       
      // Calculate position relative to container
      let left = checkboxRect.left - containerRect.left + 20;
      let top = checkboxRect.top - containerRect.top + 20;
       
      // Check if product would go off right edge and adjust if needed
      if (left + productWidth > containerRect.width) {
        left = left - productWidth - 40; // Position to the left of checkbox
      }
       
      // Check if product would go off bottom edge and adjust if needed
      if (top + productHeight > containerRect.height) {
        top = top - productHeight - 40; // Position above checkbox
      }
       
      // Set position with absolute positioning
      (product as HTMLElement).style.position = 'absolute';
      (product as HTMLElement).style.top = `${top}px`;
      (product as HTMLElement).style.left = `${left}px`;
       
      // Make sure product is visible for debugging
      (product as HTMLElement).style.zIndex = '100';
      (product as HTMLElement).style.opacity = '1';
    };
    
    // Preload product images để hiển thị nhanh hơn
    const preloadProductImages = (): void => {
      const productImages = document.querySelectorAll('.product-thumbnail');
      productImages.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          const newImg = new Image();
          newImg.src = src;
        }
      });
    };
    
    // Preload images when DOM is loaded
    preloadProductImages();
    
    // Handle click event for each checkbox - Sử dụng arrow function
    productDots.forEach(dot => {
      dot.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        
        const targetId = dot.getAttribute('aria-controls');
        if (!targetId) return;
        
        const targetProduct = document.getElementById(targetId);
        if (!targetProduct) return;
        
        const expanded = dot.getAttribute('aria-expanded') === 'true';
        
        // Close all product info first
        document.querySelectorAll('.shop-the-look__product').forEach(product => {
          product.classList.remove('is-open');
        });
        
        document.querySelectorAll('.circle-checkbox').forEach(d => {
          d.classList.remove('is-active');
          d.setAttribute('aria-expanded', 'false');
        });
        
        if (!expanded) {
          // Position product info before displaying
          positionProductInfo(dot, targetProduct);
          
          // Force a reflow before adding the class to ensure animation works properly
          void targetProduct.offsetWidth;
          
          // Then display product info
          targetProduct.classList.add('is-open');
          dot.classList.add('is-active');
          dot.setAttribute('aria-expanded', 'true');
        }
      });
    });
    
    // Close all product info when clicking outside - Sử dụng arrow function
    document.addEventListener('click', (event: Event) => {
      if (!(event.target as Element).closest('.circle-checkbox') && 
          !(event.target as Element).closest('.shop-the-look__product')) {
        document.querySelectorAll('.shop-the-look__product').forEach(product => {
          product.classList.remove('is-open');
        });
        
        document.querySelectorAll('.circle-checkbox').forEach(dot => {
          dot.classList.remove('is-active');
          dot.setAttribute('aria-expanded', 'false');
        });
      }
    });
    
    // Prevent closing product info when clicking on it - Sử dụng arrow function
    document.querySelectorAll('.shop-the-look__product').forEach(product => {
      product.addEventListener('click', (event: Event) => {
        event.stopPropagation();
      });
    });
    
    // Handle ripple effects
    productDots.forEach((dot, index) => {
      const rippleContainer = dot.querySelector('.ripple-container');
      if (rippleContainer) {
        (rippleContainer as HTMLElement).style.animationDelay = `${index * 5}s`;
      }
    });
    
    // Image reveal effect
    const revealImage = (element: Element): void => {
      element.classList.add('revealed');
      const img = element.querySelector('img.scan-effect');
      if (img) {
        setTimeout(() => {
          img.classList.add('revealed');
        }, 200);
      }
      
      // Remove "is-open" class from all products initially
      const products = element.querySelectorAll('.shop-the-look__product');
      products.forEach(product => {
        product.classList.remove('is-open');
      });
      
      // Set initial positions for checkboxes after image reveal
      const checkboxes = element.querySelectorAll('.circle-checkbox');
      checkboxes.forEach((checkbox, index) => {
        const targetId = checkbox.getAttribute('aria-controls');
        if (!targetId) return;
        
        const targetProduct = document.getElementById(targetId);
        
        if (targetProduct) {
          positionProductInfo(checkbox, targetProduct);
          
          // Only apply is-active to the first checkbox after a shorter delay
          if (index === 0) {
            setTimeout(() => {
              checkbox.classList.add('is-active');
              checkbox.setAttribute('aria-expanded', 'true');
              
              // Force a reflow before adding the class to ensure animation works properly
              void targetProduct.offsetWidth;
              
              targetProduct.classList.add('is-open');
            }, 800); // Giảm xuống 800ms để hiệu ứng xuất hiện nhanh hơn
          }
        }
      });
    };
    
    // Activate effect for first image when page loads
    setTimeout(() => {
      const firstImage = document.querySelector('.image-wrapper');
      if (firstImage) revealImage(firstImage);
    }, 500);
    
    // Set up Intersection Observer to display images when scrolling
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach(item => {
      if (!item.classList.contains('revealed')) {
        observer.observe(item);
      }
    });
    
    // Update product info position when window is resized - Sử dụng arrow function
    window.addEventListener('resize', () => {
      const activeCheckbox = document.querySelector('.circle-checkbox.is-active');
      if (activeCheckbox) {
        const targetId = activeCheckbox.getAttribute('aria-controls');
        if (!targetId) return;
        
        const targetProduct = document.getElementById(targetId);
        if (targetProduct && targetProduct.classList.contains('is-open')) {
          positionProductInfo(activeCheckbox, targetProduct);
        }
      }
    });
  }
}
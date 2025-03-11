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

    this.loadExternalScripts();
  }

  ngAfterViewInit(): void {

    this.initializeShopTheLook();
  }


  private loadExternalScripts(): void {
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js';
    bootstrapScript.async = true;
    document.body.appendChild(bootstrapScript);
  }


  private initializeShopTheLook(): void {
    const productDots = document.querySelectorAll('.circle-checkbox');
    

    const positionProductInfo = (checkbox: Element, product: Element): void => {
      if (!checkbox || !product) return;
       

      const container = checkbox.closest('.shop-the-look__image-wrapper');
      if (!container) return;
      
      const checkboxRect = checkbox.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
       
  
      const productWidth = 300; 
      const productHeight = 160; 
       

      let left = checkboxRect.left - containerRect.left + 20;
      let top = checkboxRect.top - containerRect.top + 20;
       
 
      if (left + productWidth > containerRect.width) {
        left = left - productWidth - 5; 
      }
       

      if (top + productHeight > containerRect.height) {
        top = top - productHeight - 5; 
      }
       
      (product as HTMLElement).style.position = 'absolute';
      (product as HTMLElement).style.top = `${top}px`;
      (product as HTMLElement).style.left = `${left}px`;
       

      (product as HTMLElement).style.zIndex = '100';
      (product as HTMLElement).style.opacity = '1';
    };
    

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
    

    preloadProductImages();
    

    productDots.forEach(dot => {
      dot.addEventListener('click', (event: Event) => {
        event.stopPropagation();
        
        const targetId = dot.getAttribute('aria-controls');
        if (!targetId) return;
        
        const targetProduct = document.getElementById(targetId);
        if (!targetProduct) return;
        
        const expanded = dot.getAttribute('aria-expanded') === 'true';

        document.querySelectorAll('.shop-the-look__product').forEach(product => {
          product.classList.remove('is-open');
        });
        
        document.querySelectorAll('.circle-checkbox').forEach(d => {
          d.classList.remove('is-active');
          d.setAttribute('aria-expanded', 'false');
        });
        
        if (!expanded) {

          positionProductInfo(dot, targetProduct);
          

          void targetProduct.offsetWidth;
          

          targetProduct.classList.add('is-open');
          dot.classList.add('is-active');
          dot.setAttribute('aria-expanded', 'true');
        }
      });
    });
    

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
    

    document.querySelectorAll('.shop-the-look__product').forEach(product => {
      product.addEventListener('click', (event: Event) => {
        event.stopPropagation();
      });
    });
    

    productDots.forEach((dot, index) => {
      const rippleContainer = dot.querySelector('.ripple-container');
      if (rippleContainer) {
        (rippleContainer as HTMLElement).style.animationDelay = `${index * 5}s`;
      }
    });
    

    const revealImage = (element: Element): void => {
      element.classList.add('revealed');
      const img = element.querySelector('img.scan-effect');
      if (img) {
        setTimeout(() => {
          img.classList.add('revealed');
        }, 200);
      }
      

      const products = element.querySelectorAll('.shop-the-look__product');
      products.forEach(product => {
        product.classList.remove('is-open');
      });

      const checkboxes = element.querySelectorAll('.circle-checkbox');
      checkboxes.forEach((checkbox, index) => {
        const targetId = checkbox.getAttribute('aria-controls');
        if (!targetId) return;
        
        const targetProduct = document.getElementById(targetId);
        
        if (targetProduct) {
          positionProductInfo(checkbox, targetProduct);
          
          if (index === 0) {
            setTimeout(() => {
              checkbox.classList.add('is-active');
              checkbox.setAttribute('aria-expanded', 'true');
              

              void targetProduct.offsetWidth;
              
              targetProduct.classList.add('is-open');
            }, 800); 
          }
        }
      });
    };
    

    setTimeout(() => {
      const firstImage = document.querySelector('.image-wrapper');
      if (firstImage) revealImage(firstImage);
    }, 500);
    

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
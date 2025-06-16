import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-musk',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="musk-container">
      <h2 class="section-title">منتجات المسك</h2>
      <div class="products-grid">
        <div class="product-card" *ngFor="let product of muskProducts">
          <div class="product-image">
            <img [src]="product.image" [alt]="product.name">
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">{{ product.price }} ريال</p>
            <button class="add-to-cart">أضف إلى السلة</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .musk-container {
      padding: 2rem 0;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      color: var(--text-color);
      margin-bottom: 3rem;
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      right: 50%;
      transform: translateX(50%);
      width: 80px;
      height: 4px;
      background: var(--gradient-gold);
      border-radius: 2px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background: var(--card-bg);
      border-radius: 15px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .product-image {
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: contains;
      transition: transform 0.5s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.1);
    }

    .product-info {
      padding: 1.5rem;
      text-align: center;
    }

    .product-info h3 {
      font-size: 1.3rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .price {
      color: var(--primary-color);
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .add-to-cart {
      background: var(--gradient-gold);
      color: var(--dark-bg);
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .add-to-cart:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
    }
  `]
})
export class MuskComponent {
  muskProducts = [
    {
      id: 1,
      name: 'مسك طبيعي',
      price: 1200,
      image: '/assets/images/مسك.png'
    },
    {
      id: 2,
      name: 'مسك أبيض',
      price: 1500,
      image: '/assets/images/مسك.png'
    },
    {
      id: 3,
      name: 'مسك أسود',
      price: 1800,
      image: '/assets/images/مسك.png'
    }
  ];
} 
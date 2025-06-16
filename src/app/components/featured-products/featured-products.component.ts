import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { scrollAnimation } from '../../utils/animations';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-featured-products',
  templateUrl: './featured-products.component.html',
  styleUrls: ['./featured-products.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [scrollAnimation]
})
export class FeaturedProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.productService.getProducts().subscribe(allProducts => {
      // Get first 4 products or less if there are fewer
      this.products = allProducts.slice(0, 3);
    });
  }

  getProductImage(product: Product): string {
    return product.images?.[0]?.imageUrl || '/assets/images/placeholder.jpg';
  }
  //add to cart
  addToCart(product: Product) {
    this.cartService.addItem({ product, quantity: 1 });
    this.toastr.success(`تمت إضافة ${product.title} إلى السلة`, 'تم الإضافة');
  }
} 
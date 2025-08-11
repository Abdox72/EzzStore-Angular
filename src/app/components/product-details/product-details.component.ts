import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  selectedImageIndex: number = 0;
  isAddingToCart: boolean = false;
  staticFiles:string = environment.staticFiles;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(Number(id)).subscribe(
        product => {
          this.product = product;
          if (product.images && product.images.length > 0) {
            this.selectedImageIndex = 0;
          }
        }
      );
    }
  }

  increaseQuantity() {
    const stck = this.product?.stock;
    if (this.quantity < (stck ?? 0) ) {
      this.quantity++;
    } else {
      this.toastr.warning('عذراً، الكمية المطلوبة غير متوفرة في المخزون', 'تنبيه');
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  addToCart() {
    if (this.product && this.quantity > 0) {
      this.isAddingToCart = true;
      this.cartService.addItem({ product: this.product, quantity: this.quantity });
      
      setTimeout(() => {
        this.isAddingToCart = false;
        this.toastr.success(`تمت إضافة ${this.quantity} من ${this.product?.title} إلى السلة`, 'تم الإضافة');
      }, 1000);
    }
  }

  getCurrentImage(): string {
    if (!this.product) return '';
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images[this.selectedImageIndex].imageUrl;
    }
    return '/assets/images/placeholder.jpg';
  }

  getStockStatus(): { text: string; class: string } {
    if (!this.product) return { text: '', class: '' };
    
    if (this.product.stock === 0) {
      return { text: 'نفذت الكمية', class: 'out-of-stock' };
    } else if (this.product.stock <= 5) {
      return { text: 'آخر ' + this.product.stock + ' قطع', class: 'low-stock' };
    } else {
      return { text: 'متوفر', class: 'in-stock' };
    }
  }
}
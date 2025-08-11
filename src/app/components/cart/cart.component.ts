import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  private subscriptions: Subscription[] = [];
  staticFiles:string = environment.staticFiles;


  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.cartService.getCartItems().subscribe(items => {
        this.cartItems = items;
      }),
      this.cartService.getTotalItems().subscribe(total => {
        this.totalItems = total;
      }),
      this.cartService.getTotalPrice().subscribe(total => {
        this.totalPrice = total;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
    this.toastr.success('تم تحديث الكمية بنجاح', 'تم التحديث');
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
    this.toastr.success('تم حذف المنتج من السلة', 'تم الحذف');
  }

  clearCart() {
    this.cartService.clearCart();
    this.toastr.success('تم مسح السلة بنجاح', 'تم المسح');
  }

  checkout() {
    if (this.cartItems.length === 0) {
      this.toastr.warning('السلة فارغة، يرجى إضافة منتجات أولاً', 'تنبيه');
      return;
    }
    
    // Redirect to checkout page
    this.router.navigate(['/checkout']);
  }
} 
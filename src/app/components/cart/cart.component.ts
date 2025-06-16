import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private cartService: CartService,
    private toastr: ToastrService
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

  // handleImageError(event: Event) {
  //   const imgElement = event.target as HTMLImageElement;
  //   imgElement.src = '/assets/images/placeholder.jpg';
  // }

  checkout() {
    // Prepare WhatsApp message
    const message = this.prepareWhatsAppMessage();
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp business number - replace with your actual number
    const whatsappNumber = '+201157895731';
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Show success message
    this.toastr.success('سيتم تحويلك إلى واتساب لإتمام الطلب', 'جاري التحويل');
    
    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear the cart after redirecting
    this.clearCart();
  }

  private prepareWhatsAppMessage(): string {
    const orderItems = this.cartItems.map(item => 
      `- ${item.product.title} (${item.quantity} × ${item.product.price} دينار)`
    ).join('\n');

    return `مرحباً، أود تقديم طلب جديد:\n\n${orderItems}\n\nالمجموع الكلي: ${this.totalPrice} دينار`;
  }
} 
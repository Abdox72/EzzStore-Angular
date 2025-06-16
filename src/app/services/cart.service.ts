import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../interfaces/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private readonly CART_STORAGE_KEY = 'ezz_cart';

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage() {
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      this.cartItems.next(JSON.parse(storedCart));
    }
  }

  private saveCartToStorage(items: CartItem[]) {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  addItem(item: CartItem) {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(
      cartItem => cartItem.product.id === item.product.id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      currentItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      currentItems.push(item);
    }

    this.cartItems.next(currentItems);
    this.saveCartToStorage(currentItems);
  }

  updateQuantity(productId: number, quantity: number) {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(
      item => item.product.id === productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        currentItems.splice(itemIndex, 1);
      } else {
        currentItems[itemIndex].quantity = quantity;
      }
      this.cartItems.next(currentItems);
      this.saveCartToStorage(currentItems);
    }
  }

  removeItem(productId: number) {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(
      item => item.product.id !== productId
    );
    this.cartItems.next(updatedItems);
    this.saveCartToStorage(updatedItems);
  }

  clearCart() {
    this.cartItems.next([]);
    this.saveCartToStorage([]);
  }

  getTotalItems(): Observable<number> {
    return new Observable<number>(observer => {
      this.cartItems.subscribe(items => {
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        observer.next(total);
      });
    });
  }

  getTotalPrice(): Observable<number> {
    return new Observable<number>(observer => {
      this.cartItems.subscribe(items => {
        const total = items.reduce(
          (sum, item) => sum + (item.product.price * item.quantity),
          0
        );
        observer.next(total);
      });
    });
  }
}

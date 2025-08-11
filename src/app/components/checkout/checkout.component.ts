import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { PaymentService, PaymentRequest } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  selectedPaymentMethod: 'whatsapp' | 'stripe' | 'paypal' = 'whatsapp';
  isLoading = false;
  stripe: any;
  cardElement: any;
  paymentIntent: any;
  staticFiles:string = environment.staticFiles;

  
  // Form data
  customerInfo = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private orderService: OrderService,
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

    // Initialize Stripe if payment method is stripe
    if (this.selectedPaymentMethod === 'stripe') {
      this.initializeStripe();
    }

    // Pre-fill customer info if user is logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.customerInfo.name = currentUser.name || '';
      this.customerInfo.email = currentUser.email || '';
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onPaymentMethodChange() {
    if (this.selectedPaymentMethod === 'stripe') {
      setTimeout(() => this.initializeStripe(), 0);
    }
  }
  

  private initializeStripe() {
    // Initialize Stripe (you'll need to add Stripe.js to index.html)
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(environment.stripe.publishableKey);
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card');
      this.cardElement.mount('#card-element');
    }
  }

  async processPayment() {
    if (this.selectedPaymentMethod === 'whatsapp') {
      this.processWhatsAppOrder();
    } else if (this.selectedPaymentMethod === 'stripe') {
      await this.processStripePayment();
    } else if (this.selectedPaymentMethod === 'paypal') {
      await this.processPayPalPayment();
    }
  }

  private processWhatsAppOrder() {
    // Create order first
    const orderData = {
      customerName: this.customerInfo.name,
      customerEmail: this.customerInfo.email,
      customerPhone: this.customerInfo.phone,
      customerAddress: this.customerInfo.address,
      customerCity: this.customerInfo.city,
      customerPostalCode: this.customerInfo.postalCode,
      totalAmount: this.totalPrice,
      paymentMethod: 'whatsapp',
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        // Prepare WhatsApp message
        const message = this.prepareWhatsAppMessage();
        const encodedMessage = encodeURIComponent(message);
        
        // WhatsApp business number - replace with your actual number
        const whatsappNumber = '+201157895731';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Show success message
        this.toastr.success('تم إنشاء الطلب بنجاح! سيتم تحويلك إلى واتساب', 'تم إنشاء الطلب');
        
        // Clear the cart
        this.cartService.clearCart();
        
        // Redirect to WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Navigate back to home
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.toastr.error('خطأ في إنشاء الطلب', 'خطأ');
      }
    });
  }

  private async processStripePayment() {
    if (!this.stripe || !this.cardElement) {
      this.toastr.error('خطأ في تهيئة نظام الدفع', 'خطأ');
      return;
    }

    this.isLoading = true;

    try {
      // Create payment intent
      const paymentRequest: PaymentRequest = {
        amount: this.totalPrice * 100, // Convert to cents
        currency: 'usd',
        description: `Order for ${this.customerInfo.name}`,
        customerEmail: this.customerInfo.email
      };

      this.paymentService.createPaymentIntent(paymentRequest).subscribe({
        next: (intent) => {
          this.paymentIntent = intent;
          
          // Confirm payment with Stripe
          this.stripe.confirmCardPayment(intent.clientSecret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                name: this.customerInfo.name,
                email: this.customerInfo.email
              }
            }
          }).then((result: any) => {
            if (result.error) {
              this.toastr.error(result.error.message, 'خطأ في الدفع');
            } else {
              if (result.paymentIntent.status === 'succeeded') {
               // Create order after successful payment
                const orderData = {
                    customerName: this.customerInfo.name,
                    customerEmail: this.customerInfo.email,
                    customerPhone: this.customerInfo.phone,
                    customerAddress: this.customerInfo.address,
                    customerCity: this.customerInfo.city,
                    customerPostalCode: this.customerInfo.postalCode,
                    totalAmount: this.totalPrice,
                    paymentMethod: 'stripe',
                    items: this.cartItems.map(item => ({
                      productId: item.product.id,
                      quantity: item.quantity
                    }))
                };

               this.orderService.createOrder(orderData).subscribe({
                 next: (order) => {
                   this.toastr.success('تم الدفع وإنشاء الطلب بنجاح!', 'نجح الدفع');
                   this.cartService.clearCart();
                   this.router.navigate(['/home']);
                 },
                 error: (error) => {
                   this.toastr.error('تم الدفع ولكن حدث خطأ في إنشاء الطلب', 'خطأ');
                 }
               });
             }
            }
            this.isLoading = false;
          });
        },
        error: (error) => {
          this.toastr.error('خطأ في إنشاء عملية الدفع', 'خطأ');
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.toastr.error('خطأ في معالجة الدفع', 'خطأ');
      this.isLoading = false;
    }
  }

  private async processPayPalPayment() {
    this.isLoading = true;

    try {
      // Create PayPal order
      const orderData = {
        customerName: this.customerInfo.name,
        customerEmail: this.customerInfo.email,
        customerPhone: this.customerInfo.phone,
        customerAddress: this.customerInfo.address,
        customerCity: this.customerInfo.city,
        customerPostalCode: this.customerInfo.postalCode,
        totalAmount: this.totalPrice,
        paymentMethod: "paypal",
        items: this.cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        // Add ReturnUrl and CancelUrl
        returnUrl: `${window.location.origin}/paypal-callback`,
        cancelUrl: `${window.location.origin}/checkout`
      };
      this.orderService.createPayPalOrder(orderData).subscribe({
        next: (paypalOrder) => {
          // Redirect to PayPal for payment
          if (paypalOrder.approvalUrl) {
            localStorage.setItem('order_data', JSON.stringify(orderData));
            window.location.href = paypalOrder.approvalUrl;
          } else {
            this.toastr.error('خطأ في إنشاء طلب PayPal', 'خطأ');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('PayPal order creation error:', error);
          this.toastr.error('خطأ في إنشاء طلب PayPal', 'خطأ');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('PayPal processing error:', error);
      this.toastr.error('خطأ في معالجة دفع PayPal', 'خطأ');
      this.isLoading = false;
    }
  }

  private prepareWhatsAppMessage(): string {
    const orderItems = this.cartItems.map(item => 
      `- ${item.product.title} (${item.quantity} × ${item.product.price} دينار)`
    ).join('\n');

    const customerInfo = `
معلومات العميل:
الاسم: ${this.customerInfo.name}
البريد الإلكتروني: ${this.customerInfo.email}
الهاتف: ${this.customerInfo.phone}
العنوان: ${this.customerInfo.address}
المدينة: ${this.customerInfo.city}
الرمز البريدي: ${this.customerInfo.postalCode}
`;

    return `مرحباً، أود تقديم طلب جديد:

${orderItems}

${customerInfo}

المجموع الكلي: ${this.totalPrice} دينار`;
  }

  isFormValid(): boolean {
    if (this.selectedPaymentMethod === 'whatsapp') {
      return !!(this.customerInfo.name && this.customerInfo.email && this.customerInfo.phone);
    } else if (this.selectedPaymentMethod === 'paypal') {
      return !!(this.customerInfo.name && this.customerInfo.email && this.customerInfo.phone && 
             this.customerInfo.address && this.customerInfo.city);
    } else {
      return !!(this.customerInfo.name && this.customerInfo.email && this.customerInfo.phone && 
             this.customerInfo.address && this.customerInfo.city);
    }
  }
}
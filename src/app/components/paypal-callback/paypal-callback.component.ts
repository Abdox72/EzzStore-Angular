import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-paypal-callback',
  templateUrl: './paypal-callback.component.html',
  styleUrls: ['./paypal-callback.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PaypalCallbackComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private toastr: ToastrService,
    private cartService: CartService,
    private authServic: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['token'];
      
      if (orderId) {
        this.capturePayPalOrder(orderId);
      } else {
        this.handleError('لم يتم العثور على معرف الطلب');
      }
    });
  }
  
  private capturePayPalOrder(orderId: string): void {
    this.orderService.capturePayPalOrder(orderId).subscribe({
    next: (response) => {
      if (!response) return;
      let orderLoc = localStorage.getItem('order_data');
      const orderData = orderLoc ? JSON.parse(orderLoc) : [];
      console.log(orderData)
      this.orderService.createOrder(orderData).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
          this.toastr.success('تم الدفع وإنشاء الطلب بنجاح!', 'نجح الدفع');
          this.cartService.clearCart();
          localStorage.removeItem('order_data'); // امسح البيانات
          setTimeout(() => this.router.navigate(['/home']), 3000);
        },
        error: () => {
          this.handleError('تم الدفع ولكن فشل إنشاء الطلب');
        }
      });
    },
    error: (error) => {
      this.handleError('حدث خطأ أثناء تأكيد الدفع');
    }
    });
  }


  private handleError(message: string): void {
    this.isLoading = false;
    this.isSuccess = false;
    this.errorMessage = message;
    this.toastr.error(message, 'خطأ');
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
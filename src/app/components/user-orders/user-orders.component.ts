import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { OrderTrackingComponent } from '../order-tracking/order-tracking.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, OrderTrackingComponent],
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.css']
})
export class UserOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  loading = false;
  error = '';
  cancelForm: FormGroup;
  refundForm: FormGroup;
  showCancelForm = false;
  showRefundForm = false;
  showTracking = false;
  
  // للبحث
  searchTerm = '';
  searchSubject = new Subject<string>();
  currentStatusFilter = 'all';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.cancelForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.refundForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadUserOrders();
    
    // إعداد البحث مع تأخير
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  loadUserOrders(): void {
    this.loading = true;
    this.error = '';
    
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'حدث خطأ في تحميل الطلبات';
        this.loading = false;
        console.error('Error loading orders:', error);
      }
    });
  }
  
  // وظائف البحث والتصفية
  searchOrders(): void {
    this.searchSubject.next(this.searchTerm);
  }
  
  filterByStatus(): void {
    this.applyFilters();
  }
  
  applyFilters(): void {
    let result = [...this.orders];
    
    // تطبيق فلتر الحالة
    if (this.currentStatusFilter !== 'all') {
      result = result.filter(order => order.orderStatus === this.currentStatusFilter);
    }
    
    // تطبيق البحث
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toString().includes(term) || 
        (order.customerName && order.customerName.toLowerCase().includes(term)) ||
        this.getStatusText(order.orderStatus).toLowerCase().includes(term) ||
        this.getPaymentMethodText(order.paymentMethod).toLowerCase().includes(term)
      );
    }
    
    this.filteredOrders = result;
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.showCancelForm = false;
    this.showRefundForm = false;
    this.showTracking = false;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.showCancelForm = false;
    this.showRefundForm = false;
    this.showTracking = false;
    this.cancelForm.reset();
    this.refundForm.reset();
  }

  canCancel(order: Order): boolean {
    return order.orderStatus === 'pending' && !order.isCancelled;
  }

  // تم إزالة وظيفة canRefund لأن استرداد الطلب مسموح فقط للأدمن

  canTrack(order: Order): boolean {
    return order.orderStatus === 'shipped' && !!order.trackingNumber;
  }

  // داخل UserOrdersComponent

  showCancelOrderForm(order?: Order): void {
    if (order) this.selectOrder(order);
    this.showCancelForm = true;
    this.showRefundForm = false;
    this.showTracking = false;
  }

  showTrackingView(order?: Order): void {
    if (order) this.selectOrder(order);
    this.showTracking = true;
    this.showCancelForm = false;
    this.showRefundForm = false;
  }

  // تم إزالة وظيفة showRefundOrderForm لأن استرداد الطلب مسموح فقط للأدمن



  cancelOrder(): void {
    if (this.cancelForm.valid && this.selectedOrder) {
      const reason = this.cancelForm.get('reason')?.value;
      
      this.orderService.cancelOrder(String(this.selectedOrder.id), reason).subscribe({
        next: (updatedOrder) => {
          // Update the order in the list
          const index = this.orders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
          
          this.selectedOrder = updatedOrder;
          this.showCancelForm = false;
          this.showRefundForm = false;
          this.showTracking = false;
          this.cancelForm.reset();
          
          // Show success message
          alert('تم إلغاء الطلب بنجاح');
        },
        error: (error) => {
          this.error = 'حدث خطأ في إلغاء الطلب';
          console.error('Error cancelling order:', error);
        }
      });
    }
  }

  // تم إزالة وظيفة refundOrder لأن استرداد الطلب مسموح فقط للأدمن

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      case 'refunded': return 'status-refunded';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'hourglass_empty';
      case 'confirmed': return 'check_circle';
      case 'processing': return 'autorenew';
      case 'shipped': return 'local_shipping';
      case 'delivered': return 'inventory';
      case 'cancelled': return 'cancel';
      case 'refunded': return 'currency_exchange';
      default: return 'help';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'whatsapp': return 'واتساب';
      case 'stripe': return 'بطاقة ائتمان';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  }

  formatDate(dateString: string): string {
return new Date(dateString).toLocaleDateString('ar-SA', { calendar: 'gregory' });
  }

  getTotalItems(order: Order): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }
}

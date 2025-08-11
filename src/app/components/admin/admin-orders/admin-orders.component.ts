import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  loading = false;
  error = '';

  // Filter properties
  statusFilter = '';
  paymentStatusFilter = '';
  searchTerm = '';

  // Form properties
  statusForm: FormGroup;
  trackingForm: FormGroup;
  refundForm: FormGroup;
  paymentStatusForm: FormGroup;

  // Status options
  orderStatuses = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'confirmed', label: 'تم التأكيد' },
    { value: 'shipped', label: 'تم الشحن' },
    { value: 'delivered', label: 'تم التوصيل' },
    { value: 'cancelled', label: 'تم الإلغاء' }
  ];

  paymentStatusOptions = [
    { value: 'all', label: 'جميع حالات الدفع' },
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'paid', label: 'تم الدفع' },
    { value: 'failed', label: 'فشل الدفع' },
    { value: 'refunded', label: 'تم الاسترداد' }
  ];

  paymentStatuses = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'paid', label: 'تم الدفع' },
    { value: 'failed', label: 'فشل الدفع' },
    { value: 'refunded', label: 'تم الاسترداد' }
  ];

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder
  ) {
    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });

    this.trackingForm = this.fb.group({
      trackingNumber: ['', Validators.required],
      carrier: ['', Validators.required]
    });

    this.refundForm = this.fb.group({
      reason: ['', Validators.required]
    });

    this.paymentStatusForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل في تحميل الطلبات';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.statusFilter || order.orderStatus === this.statusFilter;
      const matchesPaymentStatus = !this.paymentStatusFilter || order.paymentStatus === this.paymentStatusFilter;
      const matchesSearch = !this.searchTerm || 
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toString().includes(this.searchTerm);

      return matchesStatus && matchesPaymentStatus && matchesSearch;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPaymentStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.statusForm.patchValue({ status: order.orderStatus });
    this.paymentStatusForm.patchValue({ status: order.paymentStatus });
    this.trackingForm.patchValue({ 
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || ''
    });
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder || !this.statusForm.valid) return;

    const newStatus = this.statusForm.get('status')?.value;
    this.loading = true;

    this.orderService.updateOrderStatus(this.selectedOrder.id, newStatus).subscribe({
      next: (updatedOrder) => {
        // Update the order in the list
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.applyFilters();
        this.loading = false;
        this.selectedOrder = null;
        this.statusForm.reset();
      },
      error: (err) => {
        this.error = 'فشل في تحديث حالة الطلب';
        this.loading = false;
        console.error('Error updating order status:', err);
      }
    });
  }

  updateTrackingInfo(): void {
    if (!this.selectedOrder || !this.trackingForm.valid) return;

    const trackingData = this.trackingForm.value;
    this.loading = true;

    this.orderService.updateTrackingInfo(this.selectedOrder.id, trackingData).subscribe({
      next: (updatedOrder) => {
        // Update the order in the list
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.applyFilters();
        this.loading = false;
        this.selectedOrder = null;
        this.trackingForm.reset();
      },
      error: (err) => {
        this.error = 'فشل في تحديث معلومات التتبع';
        this.loading = false;
        console.error('Error updating tracking info:', err);
      }
    });
  }

  refundOrder(): void {
    if (!this.selectedOrder || !this.refundForm.valid) return;

    const reason = this.refundForm.get('reason')?.value;
    this.loading = true;

    this.orderService.refundOrder(this.selectedOrder.id, reason).subscribe({
      next: (refundedOrder) => {
        // Update the order in the list
        const index = this.orders.findIndex(o => o.id === refundedOrder.id);
        if (index !== -1) {
          this.orders[index] = refundedOrder;
        }
        this.applyFilters();
        this.loading = false;
        this.selectedOrder = null;
        this.refundForm.reset();
      },
      error: (err) => {
        this.error = 'فشل في استرداد الطلب';
        this.loading = false;
        console.error('Error refunding order:', err);
      }
    });
  }

  updatePaymentStatus(): void {
    if (!this.selectedOrder || !this.paymentStatusForm.valid) return;

    const newStatus = this.paymentStatusForm.get('status')?.value;
    this.loading = true;

    this.orderService.updatePaymentStatus(String(this.selectedOrder.id), newStatus).subscribe({
      next: (updatedOrder) => {
        // Update the order in the list
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.applyFilters();
        this.loading = false;
        this.selectedOrder = null;
        this.paymentStatusForm.reset();
      },
      error: (err) => {
        this.error = 'فشل في تحديث حالة الدفع';
        this.loading = false;
        console.error('Error updating payment status:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'completed';
      case 'shipped':
        return 'shipped';
      case 'confirmed':
        return 'confirmed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'failed':
        return 'failed';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'paid':
        return 'مدفوع';
      case 'failed':
        return 'فشل';
      case 'refunded':
        return 'مسترد';
      default:
        return status;
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'stripe':
        return 'Stripe';
      case 'paypal':
        return 'PayPal';
      case 'whatsapp':
        return 'واتساب';
      default:
        return method;
    }
  }

  clearSelection(): void {
    this.selectedOrder = null;
    this.statusForm.reset();
    this.trackingForm.reset();
    this.refundForm.reset();
    this.paymentStatusForm.reset();
  }

  canUpdateStatus(order: Order): boolean {
    return order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';
  }

  canUpdatePaymentStatus(order: Order): boolean {
    return !order.isRefunded;
  }

  canRefund(order: Order): boolean {
    return order.paymentStatus === 'paid' && !order.isRefunded;
  }

  canAddTracking(order: Order): boolean {
    return order.orderStatus === 'confirmed' || order.orderStatus === 'shipped';
  }
}

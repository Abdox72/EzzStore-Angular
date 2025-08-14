import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse, OrderFilterParameters } from '../interfaces/pagination';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItem[];
  
  // New fields for tracking
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Cancellation and refund fields
  isCancelled: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  isRefunded: boolean;
  refundedAt?: string;
  refundReason?: string;
  
  // PayPal fields
  paypalOrderId?: string;
  paypalTransactionId?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  totalAmount: number;
  paymentMethod: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

// New interfaces for admin order management
export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateTrackingRequest {
  trackingNumber: string;
  carrier: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface RefundOrderRequest {
  reason: string;
}

// PayPal interfaces
export interface CreatePayPalOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  totalAmount: number;
  items: {
    productId: number;
    quantity: number;
  }[];
  returnUrl: string;
  cancelUrl: string;
}

export interface CapturePayPalOrderRequest {
  orderId: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Existing methods
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  placeOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.createOrder(orderData);
  }

  // New methods for admin order management
  getAllOrders(status?: string, paymentStatus?: string): Observable<Order[]> {
    let url = `${this.apiUrl}/admin/all`;
    const params: string[] = [];
    
    if (status) params.push(`status=${status}`);
    if (paymentStatus) params.push(`paymentStatus=${paymentStatus}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<Order[]>(url);
  }

  getPaginatedOrders(filterParams: OrderFilterParameters): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams()
      .set('pageNumber', filterParams.pageNumber.toString())
      .set('pageSize', filterParams.pageSize.toString());

    if (filterParams.searchTerm) {
      params = params.set('searchTerm', filterParams.searchTerm);
    }
    if (filterParams.sortBy) {
      params = params.set('sortBy', filterParams.sortBy);
    }
    if (filterParams.sortDescending !== undefined) {
      params = params.set('sortDescending', filterParams.sortDescending.toString());
    }
    if (filterParams.status) {
      params = params.set('status', filterParams.status);
    }
    if (filterParams.paymentStatus) {
      params = params.set('paymentStatus', filterParams.paymentStatus);
    }
    if (filterParams.paymentMethod) {
      params = params.set('paymentMethod', filterParams.paymentMethod);
    }
    if (filterParams.startDate) {
      params = params.set('startDate', filterParams.startDate.toISOString());
    }
    if (filterParams.endDate) {
      params = params.set('endDate', filterParams.endDate.toISOString());
    }
    if (filterParams.minAmount) {
      params = params.set('minAmount', filterParams.minAmount.toString());
    }
    if (filterParams.maxAmount) {
      params = params.set('maxAmount', filterParams.maxAmount.toString());
    }
    if (filterParams.customerName) {
      params = params.set('customerName', filterParams.customerName);
    }
    if (filterParams.customerEmail) {
      params = params.set('customerEmail', filterParams.customerEmail);
    }

    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/admin/paginated`, { params });
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  updatePaymentStatus(orderId: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${environment.apiUrl}/orders/${orderId}/payment-status`, { status });
  }

  updateTrackingInfo(id: number, trackingData: UpdateTrackingRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/tracking`, trackingData);
  }

  refundOrder(id: number, reason: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/refund`, { reason });
  }

  // User order actions
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  cancelOrder(orderId: string, reason: string): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders/${orderId}/cancel`, { reason });
  }

  // PayPal methods
  createPayPalOrder(orderData: CreatePayPalOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/paypal/create`, orderData);
  }

  capturePayPalOrder(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/paypal/capture`, { orderId });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { OrderService, Order } from '../../../services/order.service';
import { Product } from '../../../interfaces/product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalProducts = 0;
  totalCategories = 0;
  totalUsers = 0;
  totalOrders = 0;
  recentOrders: Order[] = [];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load products count
    this.productService.getProducts().subscribe(products => {
      this.totalProducts = products.length;
    });

    // Load categories count
    this.productService.getCategories().subscribe(categories => {
      this.totalCategories = categories.length;
    });

    // Load users count
    this.userService.getUsers().subscribe(users => {
      this.totalUsers = users.length;
    });

    // Load orders count and recent orders
    this.orderService.getOrders().subscribe(orders => {
      this.totalOrders = orders.length;
      this.recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'delivered':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'قيد الانتظار';
    }
  }
}
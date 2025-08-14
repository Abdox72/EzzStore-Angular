import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { OrderService, Order } from '../../../services/order.service';
import { DashboardService } from '../../../services/dashboard.service';
import { Product } from '../../../interfaces/product';
import { DashboardStatistics, DateRange } from '../../../interfaces/dashboard';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: DashboardStatistics | null = null;
  loading = false;
  error = '';
  
  // Date range filter
  dateRangeForm: FormGroup;
  selectedDateRange: DateRange | null = null;
  staticFiles:string = environment.staticFiles;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private orderService: OrderService,
    private dashboardService: DashboardService,
    private fb: FormBuilder
  ) {
    this.dateRangeForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboardStatistics().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل في تحميل بيانات لوحة التحكم';
        this.loading = false;
        console.error('Error loading dashboard data:', err);
      }
    });
  }

  onDateRangeSubmit(): void {
    if (this.dateRangeForm.valid) {
      const formValue = this.dateRangeForm.value;
      this.selectedDateRange = {
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate)
      };

      this.loadDashboardDataByDateRange();
    }
  }

  loadDashboardDataByDateRange(): void {
    if (!this.selectedDateRange) return;

    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboardStatisticsByDateRange(this.selectedDateRange).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل في تحميل بيانات لوحة التحكم';
        this.loading = false;
        console.error('Error loading dashboard data by date range:', err);
      }
    });
  }

  resetDateRange(): void {
    this.dateRangeForm.reset();
    this.selectedDateRange = null;
    this.loadDashboardData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      case 'shipped':
        return 'shipped';
      case 'confirmed':
        return 'confirmed';
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
      case 'shipped':
        return 'تم الشحن';
      case 'confirmed':
        return 'مؤكد';
      default:
        return 'قيد الانتظار';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-kw', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  }

  getRevenueChartData(): any[] {
    return this.dashboardData?.revenueChart || [];
  }

  getOrderStatusChartData(): any[] {
    return this.dashboardData?.orderStatusChart || [];
  }

  getTopProductsData(): any[] {
    return this.dashboardData?.topProducts || [];
  }
}
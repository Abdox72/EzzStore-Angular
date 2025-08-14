import { Order } from '../services/order.service';

export interface DashboardStatistics {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  recentOrders: Order[];
  revenueChart: RevenueChartData[];
  orderStatusChart: OrderStatusChartData[];
  topProducts: TopProductData[];
}

export interface RevenueChartData {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface OrderStatusChartData {
  status: string;
  count: number;
  color: string;
}

export interface TopProductData {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  imageUrl: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
} 
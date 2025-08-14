import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStatistics, DateRange } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(`${this.apiUrl}/statistics`);
  }

  getDashboardStatisticsByDateRange(dateRange: DateRange): Observable<DashboardStatistics> {
    return this.http.post<DashboardStatistics>(`${this.apiUrl}/statistics/date-range`, dateRange);
  }

  getRevenueChart(days: number = 30): Observable<any[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<any[]>(`${this.apiUrl}/revenue-chart`, { params });
  }

  getOrderStatusChart(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/order-status-chart`);
  }

  getTopProducts(count: number = 5): Observable<any[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<any[]>(`${this.apiUrl}/top-products`, { params });
  }
} 
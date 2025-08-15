import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatAskRequest {
  question: string;
}

export interface ChatAskResponse {
  success: boolean;
  answer: string;
  queryType: string;
  errorMessage?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  ask(question: string): Observable<ChatAskResponse> {
    const body: ChatAskRequest = { question };
    return this.http.post<ChatAskResponse>(`${this.apiUrl}/ask`, body);
  }

  // Optional: direct endpoints if needed later
  getTopSelling(category?: string): Observable<ChatAskResponse> {
    const url = category ? `${this.apiUrl}/top-selling?category=${encodeURIComponent(category)}` : `${this.apiUrl}/top-selling`;
    return this.http.get<ChatAskResponse>(url);
  }

  getLowestPrice(category?: string): Observable<ChatAskResponse> {
    const url = category ? `${this.apiUrl}/lowest-price?category=${encodeURIComponent(category)}` : `${this.apiUrl}/lowest-price`;
    return this.http.get<ChatAskResponse>(url);
  }

  getHighestStock(category?: string): Observable<ChatAskResponse> {
    const url = category ? `${this.apiUrl}/highest-stock?category=${encodeURIComponent(category)}` : `${this.apiUrl}/highest-stock`;
    return this.http.get<ChatAskResponse>(url);
  }

  getCategoryStatistics(): Observable<ChatAskResponse> {
    return this.http.get<ChatAskResponse>(`${this.apiUrl}/category-statistics`);
  }

  getProductCount(): Observable<ChatAskResponse> {
    return this.http.get<ChatAskResponse>(`${this.apiUrl}/product-count`);
  }

  getTotalRevenue(): Observable<ChatAskResponse> {
    return this.http.get<ChatAskResponse>(`${this.apiUrl}/total-revenue`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatbotRequest {
  message: string;
  conversation_id?: string;
  context?: any;
}

export interface ChatbotResponse {
  reply: string;
  conversation_id?: string;
  suggestions?: string[];
  context?: any;
}

export interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    productId?: string;
    categoryId?: string;
    imageUrl?: string;
    links?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) { }

  sendMessage(message: string, conversationId?: string, context?: any): Observable<ChatbotResponse> {
    const request: ChatbotRequest = { 
      message,
      conversation_id: conversationId,
      context: context
    };
    return this.http.post<ChatbotResponse>(`${this.apiUrl}`, request);
  }
  
  // استخراج البيانات الوصفية من الرسالة
  extractMetadata(message: string): ChatMessage['metadata'] {
    const metadata: ChatMessage['metadata'] = {};
    
    // استخراج معرفات المنتجات
    const productMatches = message.match(/#product:(\d+)/g);
    if (productMatches && productMatches.length > 0) {
      metadata.productId = productMatches[0].replace('#product:', '');
    }
    
    // استخراج معرفات الفئات
    const categoryMatches = message.match(/#category:(\d+)/g);
    if (categoryMatches && categoryMatches.length > 0) {
      metadata.categoryId = categoryMatches[0].replace('#category:', '');
    }
    
    // استخراج الروابط
    const urlMatches = message.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatches && urlMatches.length > 0) {
      metadata.links = urlMatches;
    }
    
    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }
}
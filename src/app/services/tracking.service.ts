import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TrackingLocation {
  lat: number;
  lng: number;
  description: string;
  timestamp: string;
  status: string; // 'shipped', 'in_transit', 'out_for_delivery', 'estimated_delivery'
}

export interface ShipmentTracking {
  trackingNumber: string;
  carrier: string;
  currentLocation: TrackingLocation;
  estimatedDelivery: string;
  route: TrackingLocation[];
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor(private http: HttpClient) { }

  /**
   * Get tracking information for a shipment
   * @param trackingNumber The tracking number of the shipment
   * @param carrier The carrier (shipping company)
   * @returns Observable of ShipmentTracking
   */
  getTrackingInfo(trackingNumber: string, carrier: string): Observable<ShipmentTracking> {
    // Try to get real tracking data from the API
    if (environment.production) {
      return this.http.get<ShipmentTracking>(`${environment.apiUrl}/tracking?number=${trackingNumber}&carrier=${carrier}`);
    } else {
      // For development, use mock data
      return of(this.getMockTrackingData(trackingNumber, carrier));
    }
  }

  /**
   * Generate mock tracking data for demonstration
   * In a real application, this would be replaced with actual API calls
   */
  private getMockTrackingData(trackingNumber: string, carrier: string): ShipmentTracking {
    // Create a shipment that started 3 days ago and will be delivered tomorrow
    const now = new Date();
    
    // Shipping origin (3 days ago)
    const shippedDate = new Date(now);
    shippedDate.setDate(now.getDate() - 3);
    
    // First transit point (2 days ago)
    const transitDate1 = new Date(now);
    transitDate1.setDate(now.getDate() - 2);
    
    // Second transit point (yesterday)
    const transitDate2 = new Date(now);
    transitDate2.setDate(now.getDate() - 1);
    
    // Current location (today)
    const currentDate = new Date(now);
    
    // Estimated delivery (tomorrow)
    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + 1);
    
    // Create route with realistic coordinates for Saudi Arabia
    // For a real application, these would come from the tracking API
    const route: TrackingLocation[] = [
      {
        lat: 24.7136, 
        lng: 46.6753, // Riyadh coordinates
        description: 'تم شحن الطلب من مستودع الرياض',
        timestamp: shippedDate.toISOString(),
        status: 'shipped'
      },
      {
        lat: 24.9406, 
        lng: 46.3694, // Al Kharj
        description: 'وصل الطلب إلى مركز التوزيع في الخرج',
        timestamp: transitDate1.toISOString(),
        status: 'in_transit'
      },
      {
        lat: 25.4302, 
        lng: 45.9716, // Al Majma'ah
        description: 'في الطريق إلى وجهته النهائية عبر المجمعة',
        timestamp: transitDate2.toISOString(),
        status: 'in_transit'
      },
      {
        lat: 26.0853, 
        lng: 45.3694, // Shaqra
        description: 'جاري التوصيل في منطقة شقراء',
        timestamp: currentDate.toISOString(),
        status: 'out_for_delivery'
      },
      {
        lat: 26.3126, 
        lng: 43.7695, // Unaizah
        description: 'الوجهة النهائية - عنيزة',
        timestamp: deliveryDate.toISOString(),
        status: 'estimated_delivery'
      }
    ];
    
    // Determine current location based on time of day
    // This makes the tracking more dynamic
    const hour = now.getHours();
    let currentLocationIndex = 3; // Default to out_for_delivery
    
    if (hour < 8) {
      currentLocationIndex = 2; // Early morning, still in transit
    } else if (hour > 18) {
      currentLocationIndex = 4; // Evening, closer to destination
    }
    
    return {
      trackingNumber,
      carrier,
      currentLocation: route[currentLocationIndex],
      estimatedDelivery: deliveryDate.toISOString(),
      route
    };
  }
}
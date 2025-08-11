import { Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { TrackingService, ShipmentTracking } from '../../services/tracking.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../../services/order.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CancellationDialogComponent, RefundDialogComponent } from '../dialogs';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  trackingInfo: ShipmentTracking | null = null;
  loading = false;
  error = false;
  
  // Google Maps properties
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private polyline: google.maps.Polyline | null = null;
  private refreshInterval: any = null;
  @Input() order!: Order;
  
  trackingSteps: any[] = [];
  
  constructor(
    private trackingService: TrackingService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initializeTrackingSteps();
    
    // تهيئة تاريخ التسليم المتوقع إذا كانت بيانات التتبع متوفرة
    if (this.trackingInfo) {
      this.ngZone.run(() => {
        this.updateEstimatedDeliveryDate();
      });
    }
  }
  
  ngAfterViewInit(): void {
    if (this.order.trackingNumber && this.order.carrier && this.order.orderStatus === 'shipped') {
      this.loadTrackingInfo();
    }
  }
  
  loadTrackingInfo(): void {
    if (!this.order.trackingNumber || !this.order.carrier) return;
    
    this.loading = true;
    this.error = false;
    
    this.trackingService.getTrackingInfo(this.order.trackingNumber, this.order.carrier)
      .subscribe({
        next: (data) => {
          this.trackingInfo = data;
          this.loading = false;
          
          // تنفيذ التغييرات داخل NgZone لضمان تحديث واجهة المستخدم بشكل صحيح
          this.ngZone.run(() => {
            // تحديث تاريخ التسليم المتوقع
            this.updateEstimatedDeliveryDate();
            
            // Load Google Maps after we have tracking data
            setTimeout(() => this.loadGoogleMapsScript(), 500);
          });
        },
        error: (err) => {
          console.error('Error loading tracking info:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }
  
  private initializeTrackingSteps(): void {
    const steps = [
      { 
        status: 'pending', 
        title: 'تم الطلب', 
        description: 'تم استلام طلبك بنجاح',
        icon: 'shopping_cart',
        completed: true
      },
      { 
        status: 'confirmed', 
        title: 'تم التأكيد', 
        description: 'تم تأكيد طلبك',
        icon: 'check_circle',
        completed: this.order.orderStatus === 'confirmed' || 
                  this.order.orderStatus === 'shipped' || 
                  this.order.orderStatus === 'delivered'
      },
      { 
        status: 'shipped', 
        title: 'تم الشحن', 
        description: `تم شحن طلبك عبر ${this.order.carrier || 'شركة الشحن'}`,
        icon: 'local_shipping',
        completed: this.order.orderStatus === 'shipped' || 
                  this.order.orderStatus === 'delivered'
      },
      { 
        status: 'delivered', 
        title: 'تم التوصيل', 
        description: 'تم توصيل طلبك بنجاح',
        icon: 'home',
        completed: this.order.orderStatus === 'delivered'
      }
    ];
    
    this.trackingSteps = steps;
  }
  
  getStepClass(step: any): string {
    return step.completed ? 'step-completed' : 'step-pending';
  }

  getIconClass(step: any): string {
    return step.completed ? 'icon-completed' : 'icon-pending';
  }

  getStepDate(status: string): string | null {
    if (status === 'pending') return this.order.createdAt || null;
    if (status === 'confirmed') return this.order.updatedAt || null;
    if (status === 'shipped') return this.order.shippedAt || null;
    if (status === 'delivered') return this.order.deliveredAt || null;
    return null;
  }

  formatDate(date: Date | null | string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory' 
    });
  }
  
  // تخزين قيمة تاريخ التسليم المتوقع
  private _estimatedDeliveryDate: string = 'غير متوفر';
  
  // تحديث قيمة تاريخ التسليم المتوقع عند تغير بيانات التتبع
  private updateEstimatedDeliveryDate(): void {
    if (this.trackingInfo && this.trackingInfo.estimatedDelivery) {
      this._estimatedDeliveryDate = this.formatDate(this.trackingInfo.estimatedDelivery);
    } else {
      this._estimatedDeliveryDate = 'غير متوفر';
    }
  }
  
  // استرجاع القيمة المخزنة مسبقًا
  getEstimatedDeliveryDate(): string {
    return this._estimatedDeliveryDate;
  }
  
  refreshTracking(): void {
    if (!this.order.trackingNumber || !this.order.carrier) return;
    
    this.loading = true;
    
    this.trackingService.getTrackingInfo(this.order.trackingNumber, this.order.carrier)
      .subscribe({
        next: (data) => {
          this.trackingInfo = data;
          this.loading = false;
          
          // تنفيذ التغييرات داخل NgZone لضمان تحديث واجهة المستخدم بشكل صحيح
          this.ngZone.run(() => {
            // تحديث تاريخ التسليم المتوقع
            this.updateEstimatedDeliveryDate();
            
            // Update map if it exists
            if (this.map) {
              this.clearMapOverlays();
              this.updateMapOverlays();
            }
          });
          
          // Update tracking steps based on new data
          this.initializeTrackingSteps();
        },
        error: (err) => {
          console.error('Error loading tracking info:', err);
          this.loading = false;
        }
      });
  }
  
  contactSupport(): void {
    // Implementation for contacting support
    console.log('Contact support for tracking number:', this.order.trackingNumber);
    // This could open a chat window, redirect to support page, etc.
  }
  
  // Google Maps methods
  initMap(): void {
    if (!this.trackingInfo || !this.mapContainerRef) return;
    
    // Center the map on the current location
    const currentLocation = this.trackingInfo.currentLocation;
    const mapOptions: google.maps.MapOptions = {
      center: { lat: currentLocation.lat, lng: currentLocation.lng },
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };
    
    this.map = new google.maps.Map(this.mapContainerRef.nativeElement, mapOptions);
    this.updateMapOverlays();
    
    // Set up auto-refresh every 5 minutes
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      this.refreshTracking();
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  updateMapOverlays(): void {
    if (!this.map || !this.trackingInfo) return;
    
    // Clear existing markers and polyline
    this.clearMapOverlays();
    
    const route = this.trackingInfo.route;
    const path: google.maps.LatLngLiteral[] = [];
    
    // Add markers for each point in the route
    route.forEach((location, index) => {
      // Ensure coordinates are valid
      if (isNaN(location.lat) || isNaN(location.lng)) {
        console.error('Invalid coordinates:', location);
        return;
      }
      
      const position = { lat: location.lat, lng: location.lng };
      path.push(position);
      
      // Determine marker icon based on status
      let iconUrl = 'assets/icons/default-marker.svg';
      
      switch (location.status) {
        case 'shipped':
          iconUrl = 'assets/icons/shipped-marker.svg';
          break;
        case 'in_transit':
          iconUrl = 'assets/icons/transit-marker.svg';
          break;
        case 'out_for_delivery':
          iconUrl = 'assets/icons/delivery-marker.svg';
          break;
        case 'estimated_delivery':
          iconUrl = 'assets/icons/destination-marker.svg';
          break;
      }
      
      // Create marker options
      const markerOptions: google.maps.MarkerOptions = {
        position,
        map: this.map,
        title: location.description,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(32, 32)
        }
      };
      
      // Add animation if this is the current location
      if (location.status === 'out_for_delivery') {
        markerOptions.animation = google.maps.Animation.BOUNCE;
      }
      
      const marker = new google.maps.Marker(markerOptions);
      
      this.markers.push(marker);
      
      // Add info window for each marker
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h4>${location.description}</h4>
            <p>${this.formatDate(location.timestamp)}</p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        if (this.map) {
          infoWindow.open({
            map: this.map,
            anchor: marker
          });
        }
      });
      
      // Auto-open info window for current location
      if (location.status === 'out_for_delivery' && this.map) {
        infoWindow.open({
          map: this.map,
          anchor: marker
        });
      }
    });
    
    // Add polyline connecting all points
    this.polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: this.map
    });
    
    // Fit bounds to show all markers
    if (this.map && path.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      this.map.fitBounds(bounds);
    }
  }
  
  clearMapOverlays(): void {
    // Clear markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    
    // Clear polyline
    if (this.polyline) {
      this.polyline.setMap(null);
      this.polyline = null;
    }
  }
  
  loadGoogleMapsScript(): void {
    if (window.google && window.google.maps) {
      this.initMap();
      return;
    }
    
    const apiKey = environment.google.mapsApiKey;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return;
    }
    
    const script = document.createElement('script');
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&loading=async`;
    
    // Define callback in global scope
    (window as any).initMap = () => this.initMap();
    
    document.head.appendChild(script);
  }

  // New methods for order actions
  trackProduct(): void {
    if (!this.order.trackingNumber || !this.order.carrier) {
      this.snackBar.open('لا يوجد معلومات تتبع متاحة لهذا الطلب', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    // If tracking info is already loaded, just refresh the map
    if (this.trackingInfo) {
      this.refreshTracking();
      return;
    }

    // Otherwise load tracking info
    this.loadTrackingInfo();
  }

  canCancelOrder(): boolean {
    // Can only cancel orders that are pending or confirmed (not shipped or delivered)
    // And not already cancelled or refunded
    return (
      (this.order.orderStatus === 'pending' || this.order.orderStatus === 'confirmed') &&
      !this.order.isCancelled &&
      !this.order.isRefunded
    );
  }

  cancelOrder(): void {
    if (!this.canCancelOrder()) {
      this.snackBar.open('لا يمكن إلغاء هذا الطلب', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    // Open dialog to confirm cancellation and get reason
    const dialogRef = this.dialog.open(CancellationDialogComponent, {
      width: '400px',
      direction: 'rtl'
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.processCancellation(reason);
      }
    });
  }

  private processCancellation(reason: string): void {
    this.orderService.cancelOrder(String(this.order.id), reason).subscribe({
      next: (updatedOrder) => {
        // Update the local order object
        this.order = updatedOrder;
        
        this.snackBar.open('تم إلغاء الطلب بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        this.snackBar.open('حدث خطأ أثناء إلغاء الطلب', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  canRequestRefund(): boolean {
    // Can request refund if order is delivered and not already refunded or cancelled
    return (
      this.order.orderStatus === 'delivered' &&
      !this.order.isRefunded &&
      !this.order.isCancelled
    );
  }

  requestRefund(): void {
    if (!this.canRequestRefund()) {
      this.snackBar.open('لا يمكن استرداد المبلغ لهذا الطلب', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    // Open dialog to confirm refund and get reason
    const dialogRef = this.dialog.open(RefundDialogComponent, {
      width: '400px',
      direction: 'rtl'
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.processRefund(reason);
      }
    });
  }

  private processRefund(reason: string): void {
    this.orderService.refundOrder(this.order.id, reason).subscribe({
      next: (updatedOrder) => {
        // Update the local order object
        this.order = updatedOrder;
        
        this.snackBar.open('تم تقديم طلب استرداد المبلغ بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      error: (err) => {
        console.error('Error requesting refund:', err);
        this.snackBar.open('حدث خطأ أثناء طلب استرداد المبلغ', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }
}

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TrackingService } from './tracking.service';
import { environment } from '../../environments/environment';

describe('TrackingService', () => {
  let service: TrackingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrackingService]
    });
    service = TestBed.inject(TrackingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock tracking data', () => {
    const trackingNumber = 'TRACK123456';
    const carrier = 'DHL';

    service.getTrackingInfo(trackingNumber, carrier).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.trackingNumber).toBe(trackingNumber);
      expect(data.carrier).toBe(carrier);
      expect(data.route.length).toBeGreaterThan(0);
      expect(data.currentLocation).toBeTruthy();
    });

    // No HTTP request should be made since we're using mock data
    httpMock.expectNone(`${environment.apiUrl}/tracking?number=${trackingNumber}&carrier=${carrier}`);
  });

  it('should generate a route with at least 3 points', () => {
    const trackingNumber = 'TRACK123456';
    const carrier = 'DHL';

    service.getTrackingInfo(trackingNumber, carrier).subscribe(data => {
      expect(data.route.length).toBeGreaterThanOrEqual(3);
      
      // Check that the route has proper structure
      data.route.forEach(location => {
        expect(location.lat).toBeDefined();
        expect(location.lng).toBeDefined();
        expect(location.description).toBeDefined();
        expect(location.timestamp).toBeDefined();
        expect(location.status).toBeDefined();
      });
    });
  });

  it('should include current location in the tracking data', () => {
    const trackingNumber = 'TRACK123456';
    const carrier = 'DHL';

    service.getTrackingInfo(trackingNumber, carrier).subscribe(data => {
      expect(data.currentLocation).toBeDefined();
      expect(data.currentLocation.lat).toBeDefined();
      expect(data.currentLocation.lng).toBeDefined();
      expect(data.currentLocation.description).toBeDefined();
      expect(data.currentLocation.status).toBeDefined();
    });
  });

  it('should include estimated delivery date in the tracking data', () => {
    const trackingNumber = 'TRACK123456';
    const carrier = 'DHL';

    service.getTrackingInfo(trackingNumber, carrier).subscribe(data => {
      expect(data.estimatedDelivery).toBeDefined();
      // Check that it's a valid date string
      expect(new Date(data.estimatedDelivery).toString()).not.toBe('Invalid Date');
    });
  });
});
// Type definitions for Google Maps JavaScript API
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    fitBounds(bounds: LatLngBounds): void;
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getDiv(): Element;
    getZoom(): number;
    setCenter(latlng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    styles?: Array<{
      featureType?: string;
      elementType?: string;
      stylers: Array<{[key: string]: string | number | boolean}>;
    }>;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
    toString(): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    isEmpty(): boolean;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    getPosition(): LatLng;
    setMap(map: Map | null): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
    setTitle(title: string): void;
    setVisible(visible: boolean): void;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map | null;
    title?: string;
    icon?: string | Icon;
    label?: string | MarkerLabel;
    draggable?: boolean;
    visible?: boolean;
    animation?: Animation;
  }

  interface Icon {
    url: string;
    size?: Size;
    scaledSize?: Size;
    origin?: Point;
    anchor?: Point;
  }

  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }

  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  enum Animation {
    BOUNCE = 1,
    DROP = 2
  }

  class Polyline {
    constructor(opts?: PolylineOptions);
    getPath(): MVCArray<LatLng>;
    setMap(map: Map | null): void;
    setPath(path: MVCArray<LatLng> | LatLng[] | LatLngLiteral[]): void;
  }

  interface PolylineOptions {
    path?: MVCArray<LatLng> | LatLng[] | LatLngLiteral[];
    geodesic?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    map?: Map;
  }

  class MVCArray<T> {
    constructor(array?: T[]);
    getArray(): T[];
    getAt(i: number): T;
    getLength(): number;
    insertAt(i: number, elem: T): void;
    removeAt(i: number): T;
    setAt(i: number, elem: T): void;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    close(): void;
    getContent(): string | Element;
    getPosition(): LatLng;
    open(options?: InfoWindowOpenOptions | Map, anchor?: MVCObject): void;
    setContent(content: string | Element): void;
    setPosition(position: LatLng | LatLngLiteral): void;
  }
  
  interface InfoWindowOpenOptions {
    map?: Map;
    anchor?: MVCObject;
  }

  interface InfoWindowOptions {
    content?: string | Element;
    position?: LatLng | LatLngLiteral;
    maxWidth?: number;
  }

  class MVCObject {
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  interface MapsEventListener {
    remove(): void;
  }

  enum MapTypeId {
    ROADMAP = 'roadmap',
    SATELLITE = 'satellite',
    HYBRID = 'hybrid',
    TERRAIN = 'terrain'
  }
}
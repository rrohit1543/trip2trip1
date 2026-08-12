// Google Maps API Loader & Geocoding Helper

declare global {
  interface Window {
    google: any;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDemoTripMandiMapsApiKey2026';

let isScriptLoading = false;
let isScriptLoaded = false;

export function loadGoogleMapsApi(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;

    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      resolve((window as any).google.maps);
      return;
    }

    if (isScriptLoaded) {
      if ((window as any).google && (window as any).google.maps) resolve((window as any).google.maps);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if ((window as any).google && (window as any).google.maps) resolve((window as any).google.maps);
      });
      return;
    }

    isScriptLoading = true;
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps script loaded but google.maps is undefined'));
      }
    };

    script.onerror = (err) => {
      isScriptLoading = false;
      reject(err);
    };

    document.head.appendChild(script);
  });
}

// Custom Bus Marker SVG Icon for Google Maps
export function createGoogleBusMarkerIcon(color = '#ef4444'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2"/>
      <path d="M7 19v2M17 19v2"/>
      <circle cx="7.5" cy="15.5" r="1.5" fill="#ffffff"/>
      <circle cx="16.5" cy="15.5" r="1.5" fill="#ffffff"/>
      <path d="M4 11h16M6 6v3M18 6v3"/>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

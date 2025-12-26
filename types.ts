
export interface Hotspot {
  area: string;
  demandLevel: 'Low' | 'Medium' | 'High' | 'Peak';
  estimatedEarnings: string;
  waitTime: number; // in minutes
  coordinates: { lat: number; lng: number };
  description: string;
}

export interface Prediction {
  hour: string;
  demandScore: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DriverStatus {
  isOnline: boolean;
  currentLocation: string;
  platform: 'Uber' | 'Bolt' | 'Both';
}

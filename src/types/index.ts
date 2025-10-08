export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface MapZone {
  id: string;
  name: string;
  type: 'search' | 'restricted' | 'caution' | 'clear' | 'detour' | 'parade';
  coordinates: Location[];
  description?: string;
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'search' | 'weather' | 'traffic' | 'event';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  expiresAt?: Date;
  location?: Location;
  isRead: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  title: string;
  action: () => void;
  type: 'primary' | 'secondary' | 'destructive';
}

export interface EmergencyReport {
  id: string;
  type: 'missing_person' | 'hazard' | 'emergency_sighting' | 'other';
  title: string;
  description: string;
  location: Location;
  timestamp: Date;
  reporterName?: string;
  reporterPhone?: string;
  photos?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'false_alarm';
  priority: 'high' | 'medium' | 'low';
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: 'training' | 'volunteer' | 'public_event' | 'meeting';
  isRecurring: boolean;
  contactInfo?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'fire' | 'medical' | 'search_rescue' | 'other';
  isPrimary: boolean;
}

export interface WeatherWarning {
  id: string;
  type: 'storm' | 'snow' | 'flood' | 'fire' | 'extreme_cold' | 'extreme_heat';
  severity: 'watch' | 'warning' | 'advisory';
  description: string;
  startTime: Date;
  endTime?: Date;
  affectedAreas: string[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isVolunteer: boolean;
  isAdmin: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    emergency: boolean;
    weather: boolean;
    traffic: boolean;
    events: boolean;
  };
  location: {
    shareLocation: boolean;
    autoLocationUpdates: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    voiceOver: boolean;
  };
}

export interface NavigationParams {
  Home: undefined;
  Map: undefined;
  Alerts: undefined;
  Reports: undefined;
  Community: undefined;
  Resources: undefined;
  Admin: undefined;
  ReportDetails: {reportId: string};
  AlertDetails: {alertId: string};
  EventDetails: {eventId: string};
  Main: undefined;
  [key: string]: any;
}

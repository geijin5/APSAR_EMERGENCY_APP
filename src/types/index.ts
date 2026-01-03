export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface MapZone {
  id: string;
  name: string;
  type: 'search' | 'restricted' | 'caution' | 'clear' | 'detour' | 'parade' | 'sar_area';
  coordinates: Location[];
  description?: string;
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  isPublic: boolean; // Whether public can see this zone
  createdBy?: string; // User ID
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'search' | 'weather' | 'traffic' | 'event';
  priority: 'high' | 'medium' | 'low';
  targetAudience: 'public' | 'personnel' | 'all';
  timestamp: Date;
  expiresAt?: Date;
  location?: Location;
  isRead: boolean;
  isActive: boolean;
  createdBy?: string; // User ID
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

// Updated Role System: Admin, Officer, Member
export type UserRole = 'admin' | 'officer' | 'member';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  unit?: string; // Unit/team name
  badgeNumber?: string;
  certifications?: string[]; // Array of certification IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  notifications: {
    emergency: boolean;
    weather: boolean;
    traffic: boolean;
    events: boolean;
    sms: boolean;
    email: boolean;
    push: boolean;
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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

// Chat System Types
export type ChatRoomType = 'direct' | 'group' | 'unit' | 'general';

export interface ChatRoom {
  id: string;
  name?: string;
  type: ChatRoomType;
  unitName?: string; // If type is 'unit'
  createdBy?: string;
  createdAt: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  members: ChatRoomMember[];
  // Moderation
  isModerated?: boolean;
  allowFileUploads?: boolean;
  allowMemberInvites?: boolean;
}

export interface MessageReadReceipt {
  userId: string;
  userName?: string;
  readAt: Date;
}

export interface ChatModerationAction {
  id: string;
  roomId: string;
  messageId?: string;
  userId?: string; // If action is on a user
  action: 'delete_message' | 'hide_message' | 'remove_user' | 'mute_user' | 'warn_user';
  performedBy: string;
  performedByName?: string;
  reason?: string;
  duration?: number; // For temporary actions (mute duration in minutes)
  createdAt: Date;
}

export interface ChatRoomMember {
  id: string;
  userId: string;
  userName: string;
  joinedAt: Date;
  lastReadAt?: Date;
  isOnline?: boolean;
  // Moderation
  role?: 'member' | 'moderator' | 'admin'; // Role in the room
  isMuted?: boolean;
  mutedUntil?: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  // Read receipts
  readBy?: MessageReadReceipt[];
  readCount?: number;
  // Moderation
  isFlagged?: boolean;
  flaggedBy?: string;
  flaggedAt?: Date;
  moderationStatus?: 'pending' | 'approved' | 'hidden' | 'removed';
}

// Call-Out System Types
export type CallOutType = 'all' | 'unit' | 'role' | 'specific_users';
export type CallOutStatus = 'active' | 'completed' | 'cancelled';
export type CallOutResponseStatus = 'available' | 'en_route' | 'unavailable';

export interface CallOut {
  id: string;
  title: string;
  message: string;
  callOutType: CallOutType;
  targetUnit?: string;
  targetRole?: string;
  targetUserIds?: string[];
  status: CallOutStatus;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  responseCount?: number;
  responses?: CallOutResponse[];
}

export interface CallOutResponse {
  id: string;
  callOutId: string;
  userId: string;
  userName: string;
  status: CallOutResponseStatus;
  estimatedArrival?: Date;
  notes?: string;
  respondedAt: Date;
  updatedAt?: Date;
}

// SAR Mission Types
export type SARMissionType = 'training' | 'active';
export type SARMissionStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type SARAreaStatus = 'assigned' | 'searching' | 'cleared' | 'completed';

export interface SARMission {
  id: string;
  name: string;
  missionType: SARMissionType;
  status: SARMissionStatus;
  description?: string;
  incidentCommander?: string;
  incidentCommanderName?: string;
  createdBy: string;
  startedAt?: Date;
  completedAt?: Date;
  isPublicVisible: boolean;
  publicMessage?: string;
  createdAt: Date;
  updatedAt?: Date;
  areas?: SARMissionArea[];
}

export interface SARMissionArea {
  id: string;
  missionId: string;
  name: string;
  coordinates: Location[];
  assignedTo?: string;
  assignedToName?: string;
  status: SARAreaStatus;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Incident Management Types
export type IncidentStatus = 'active' | 'resolved' | 'cancelled';
export type ResourceType = 'personnel' | 'equipment' | 'vehicle';
export type ResourceStatus = 'available' | 'assigned' | 'en_route' | 'on_scene' | 'unavailable';

export interface Incident {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: IncidentStatus;
  incidentCommander?: string;
  incidentCommanderName?: string;
  location?: Location;
  startedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  resources?: IncidentResource[];
}

export interface IncidentResource {
  id: string;
  incidentId: string;
  resourceType: ResourceType;
  resourceId: string; // Reference to user or equipment
  resourceName: string;
  status: ResourceStatus;
  assignedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ==================== Vehicle Management Types ====================
export type VehicleType = 'truck' | 'atv' | 'snowmobile' | 'boat' | 'trailer' | 'other';
export type VehicleStatus = 'ready' | 'in_service' | 'maintenance' | 'out_of_service';

export interface Vehicle {
  id: string;
  unitNumber: string;
  type: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  currentMileage?: number;
  status: VehicleStatus;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleUnitNumber?: string;
  type: 'routine' | 'repair' | 'inspection' | 'oil_change' | 'tire_rotation' | 'other';
  description: string;
  mileage?: number;
  cost?: number;
  performedBy?: string;
  performedByName?: string;
  performedAt: Date;
  nextDueMileage?: number;
  nextDueDate?: Date;
  documents?: string[]; // URLs to uploaded documents/photos
  createdAt: Date;
  createdBy?: string;
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  vehicleUnitNumber?: string;
  type: string;
  description: string;
  dueDate?: Date;
  dueMileage?: number;
  currentMileage?: number;
  isOverdue: boolean;
  createdAt: Date;
}

// ==================== Equipment Management Types ====================
export type EquipmentCategory = 'medical' | 'rope' | 'comms' | 'navigation' | 'safety' | 'tools' | 'other';
export type EquipmentCondition = 'ready' | 'needs_service' | 'out_of_service';
export type EquipmentStatus = 'available' | 'assigned' | 'in_use' | 'maintenance' | 'retired';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  assignedTo?: string; // User ID
  assignedToName?: string;
  location?: string;
  expirationDate?: Date; // For items like medical supplies, batteries
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  inspectionFrequency?: number; // Days between inspections
  notes?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface EquipmentInspection {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  inspectedBy: string;
  inspectedByName?: string;
  inspectedAt: Date;
  condition: EquipmentCondition;
  notes?: string;
  photos?: string[];
  nextInspectionDate?: Date;
  createdAt: Date;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  assignedTo: string; // User ID
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  assignedAt: Date;
  returnedAt?: Date;
  notes?: string;
}

// ==================== Training & Certifications Types ====================
export type CertificationType = 'first_aid' | 'cpr' | 'wilderness_first_responder' | 'emt' | 'rope_rescue' | 'water_rescue' | 'avalanche' | 'navigation' | 'other';
export type TrainingStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'needs_renewal';

export interface Certification {
  id: string;
  userId: string;
  userName?: string;
  type: CertificationType;
  name: string; // Custom name if type is 'other'
  issuer?: string;
  certificateNumber?: string;
  issuedDate: Date;
  expirationDate?: Date;
  isExpired: boolean;
  isExpiringSoon: boolean; // Within 30 days
  certificateUrl?: string; // URL to uploaded certificate PDF/image
  notes?: string;
  approvedBy?: string; // Officer/Admin who approved
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  userName?: string;
  title: string;
  description?: string;
  type: CertificationType | 'general' | 'on_job';
  completedDate: Date;
  instructor?: string;
  hours?: number;
  certificateUrl?: string;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

// ==================== Checklists Types ====================
export type ChecklistType = 'callout' | 'vehicle' | 'equipment' | 'training' | 'general';
export type ChecklistStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';
export type ChecklistItemStatus = 'pending' | 'complete' | 'na' | 'issue';

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: ChecklistType;
  description?: string;
  items: ChecklistItem[];
  version: number;
  isLocked: boolean; // If locked, only Admin/Officer can edit
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  required: boolean;
  order: number;
  itemType?: 'check' | 'text' | 'number' | 'date' | 'signature' | 'photo';
  options?: string[]; // For dropdowns if needed
}

export interface Checklist {
  id: string;
  templateId: string;
  templateName?: string;
  type: ChecklistType;
  title: string;
  assignedTo: string; // User ID
  assignedToName?: string;
  assignedBy?: string;
  assignedByName?: string;
  status: ChecklistStatus;
  items: ChecklistItemResponse[];
  completedAt?: Date;
  completedBy?: string;
  signature?: string; // Signature data or URL
  notes?: string;
  location?: Location;
  isOffline: boolean; // If created offline
  syncedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ChecklistItemResponse {
  itemId: string;
  itemText: string;
  status: ChecklistItemStatus;
  response?: string; // Text response, number, etc.
  notes?: string;
  photoUrl?: string;
  completedAt?: Date;
}

// ==================== Resource Library Types ====================
export type ResourceCategory = 'maps' | 'sops' | 'manuals' | 'videos' | 'forms' | 'reference' | 'other';
export type ResourceAccessLevel = 'all' | 'member' | 'officer' | 'admin';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  category: ResourceCategory;
  tags?: string[];
  fileUrl?: string; // For PDFs, images
  externalUrl?: string; // For external links
  embedCode?: string; // For embedded videos
  accessLevel: ResourceAccessLevel; // Role-based access
  fileType?: 'pdf' | 'image' | 'video' | 'document' | 'link';
  fileSize?: number;
  thumbnailUrl?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  downloadCount?: number;
  isPinned?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// ==================== Enhanced Callout Report Types ====================
export interface CalloutReport {
  id: string;
  calloutId?: string; // If linked to a callout
  missionId?: string; // If linked to a SAR mission
  submittedBy: string;
  submittedByName?: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  incidentType: string;
  location: Location;
  locationDescription?: string;
  roleOnScene?: string; // User's role during the callout
  equipmentUsed?: string[]; // Equipment IDs
  equipmentUsedNames?: string[];
  notes?: string;
  observations?: string;
  photos?: string[];
  documents?: string[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ==================== Enhanced Notification Types ====================
export type NotificationType = 
  | 'chat' 
  | 'chat_mention'
  | 'maintenance_due' 
  | 'maintenance_overdue' 
  | 'equipment_inspection' 
  | 'equipment_expiration'
  | 'equipment_assigned'
  | 'training_expiration' 
  | 'certification_expiration'
  | 'certification_approval'
  | 'callout' 
  | 'callout_response'
  | 'checklist_assigned' 
  | 'checklist_reminder'
  | 'report_approved' 
  | 'report_rejected'
  | 'report_review_requested'
  | 'vehicle_status_change'
  | 'general';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  data?: Record<string, any>; // Additional data for deep linking
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  createdAt: Date;
}

// ==================== Audit Log Types ====================
export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'assign' | 'complete';
export type AuditEntity = 'user' | 'vehicle' | 'equipment' | 'training' | 'certification' | 'checklist' | 'callout' | 'report' | 'resource';

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName?: string;
  changes?: Record<string, {old?: any; new?: any}>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Navigation Types
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
  Login: undefined;
  PersonnelDashboard: undefined;
  Chat: undefined;
  ChatRoom: {roomId: string};
  CallOuts: undefined;
  CallOutDetails: {callOutId: string};
  SARMissions: undefined;
  SARMissionDetails: {missionId: string};
  Incidents: undefined;
  IncidentDetails: {incidentId: string};
  Settings: undefined;
  Profile: undefined;
  // New navigation params
  Vehicles: undefined;
  VehicleDetails: {vehicleId: string};
  Equipment: undefined;
  EquipmentDetails: {equipmentId: string};
  Training: undefined;
  Certifications: undefined;
  Checklists: undefined;
  ChecklistDetails: {checklistId: string};
  ChecklistTemplates: undefined;
  ResourceLibrary: undefined;
  CalloutReports: undefined;
  CalloutReportDetails: {reportId: string};
  CalloutReportForm: {reportId?: string; calloutId?: string; missionId?: string};
  CalloutReportReview: {reportId: string};
  [key: string]: any;
}

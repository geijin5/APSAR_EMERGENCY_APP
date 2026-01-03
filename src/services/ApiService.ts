import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {authService} from './AuthService';
import {
  Alert,
  MapZone,
  EmergencyReport,
  CommunityEvent,
  SARMission,
  SARMissionArea,
  CallOut,
  CallOutResponse,
  ChatRoom,
  ChatMessage,
  Incident,
  Vehicle,
  MaintenanceLog,
  MaintenanceReminder,
  Equipment,
  EquipmentInspection,
  EquipmentAssignment,
  Certification,
  TrainingRecord,
  ChecklistTemplate,
  Checklist,
  Resource,
  CalloutReport,
  Notification,
} from '../types/index';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.anaconda-deerlodge-emergency.gov';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = authService.getApiClient();
  }

  // ==================== Public Endpoints ====================

  /**
   * Get public alerts
   */
  async getPublicAlerts(): Promise<Alert[]> {
    const response = await this.client.get('/api/public/alerts');
    return this.parseAlerts(response.data);
  }

  /**
   * Get public alert by ID
   */
  async getPublicAlert(id: string): Promise<Alert> {
    const response = await this.client.get(`/api/public/alerts/${id}`);
    return this.parseAlert(response.data);
  }

  /**
   * Get public map zones
   */
  async getPublicMapZones(): Promise<MapZone[]> {
    const response = await this.client.get('/api/public/map/zones');
    return this.parseMapZones(response.data);
  }

  /**
   * Get public SAR status
   */
  async getPublicSARStatus(): Promise<{active: boolean; message?: string; missions?: any[]}> {
    const response = await this.client.get('/api/public/sar/status');
    return response.data;
  }

  /**
   * Get community events
   */
  async getCommunityEvents(): Promise<CommunityEvent[]> {
    const response = await this.client.get('/api/public/events');
    return this.parseEvents(response.data);
  }

  /**
   * Get emergency resources
   */
  async getResources(): Promise<any> {
    const response = await this.client.get('/api/public/resources');
    return response.data;
  }

  /**
   * Submit emergency report
   */
  async submitReport(report: Partial<EmergencyReport>): Promise<EmergencyReport> {
    const response = await this.client.post('/api/public/reports', report);
    return this.parseReport(response.data);
  }

  /**
   * Get report status
   */
  async getReport(id: string): Promise<EmergencyReport> {
    const response = await this.client.get(`/api/public/reports/${id}`);
    return this.parseReport(response.data);
  }

  // ==================== Personnel Endpoints ====================

  /**
   * Get personnel dashboard data
   */
  async getPersonnelDashboard(): Promise<any> {
    const response = await this.client.get('/api/personnel/dashboard');
    return response.data;
  }

  /**
   * Get personnel alerts
   */
  async getPersonnelAlerts(): Promise<Alert[]> {
    const response = await this.client.get('/api/personnel/alerts');
    return this.parseAlerts(response.data);
  }

  /**
   * Get all map zones (including personnel-only)
   */
  async getPersonnelMapZones(): Promise<MapZone[]> {
    const response = await this.client.get('/api/personnel/map/zones');
    return this.parseMapZones(response.data);
  }

  /**
   * Create map zone
   */
  async createMapZone(zone: Partial<MapZone>): Promise<MapZone> {
    const response = await this.client.post('/api/personnel/map/zones', zone);
    return this.parseMapZone(response.data);
  }

  /**
   * Update map zone
   */
  async updateMapZone(id: string, zone: Partial<MapZone>): Promise<MapZone> {
    const response = await this.client.put(`/api/personnel/map/zones/${id}`, zone);
    return this.parseMapZone(response.data);
  }

  /**
   * Delete map zone
   */
  async deleteMapZone(id: string): Promise<void> {
    await this.client.delete(`/api/personnel/map/zones/${id}`);
  }

  // ==================== Chat Endpoints ====================

  /**
   * Get user's chat rooms
   */
  async getChatRooms(): Promise<ChatRoom[]> {
    const response = await this.client.get('/api/personnel/chat/rooms');
    return this.parseChatRooms(response.data);
  }

  /**
   * Get chat room messages
   */
  async getChatMessages(roomId: string, limit?: number, before?: string): Promise<ChatMessage[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (before) params.before = before;

    const response = await this.client.get(`/api/personnel/chat/rooms/${roomId}/messages`, {params});
    return this.parseChatMessages(response.data);
  }

  /**
   * Create chat room
   */
  async createChatRoom(room: Partial<ChatRoom>): Promise<ChatRoom> {
    const response = await this.client.post('/api/personnel/chat/rooms', room);
    return this.parseChatRoom(response.data);
  }

  /**
   * Send chat message
   */
  async sendChatMessage(roomId: string, message: string, messageType: string = 'text', fileUrl?: string): Promise<ChatMessage> {
    const response = await this.client.post('/api/personnel/chat/messages', {
      roomId,
      message,
      messageType,
      fileUrl,
    });
    return this.parseChatMessage(response.data);
  }

  /**
   * Edit chat message
   */
  async editChatMessage(messageId: string, message: string): Promise<ChatMessage> {
    const response = await this.client.put(`/api/personnel/chat/messages/${messageId}`, {message});
    return this.parseChatMessage(response.data);
  }

  /**
   * Delete chat message
   */
  async deleteChatMessage(messageId: string): Promise<void> {
    await this.client.delete(`/api/personnel/chat/messages/${messageId}`);
  }

  /**
   * Mark chat message as read (read receipt)
   */
  async markChatMessageRead(roomId: string, messageId: string): Promise<void> {
    await this.client.post(`/api/personnel/chat/rooms/${roomId}/messages/${messageId}/read`);
  }

  /**
   * Mark all messages in room as read
   */
  async markChatRoomRead(roomId: string): Promise<void> {
    await this.client.post(`/api/personnel/chat/rooms/${roomId}/read`);
  }

  /**
   * Get read receipts for a message
   */
  async getMessageReadReceipts(roomId: string, messageId: string): Promise<any[]> {
    const response = await this.client.get(`/api/personnel/chat/rooms/${roomId}/messages/${messageId}/receipts`);
    return response.data;
  }

  /**
   * Flag a chat message for moderation (Officer/Admin only)
   */
  async flagChatMessage(messageId: string, reason?: string): Promise<void> {
    await this.client.post(`/api/personnel/chat/messages/${messageId}/flag`, {reason});
  }

  /**
   * Moderate a chat message (Officer/Admin only)
   */
  async moderateChatMessage(messageId: string, action: 'approve' | 'hide' | 'remove', reason?: string): Promise<void> {
    await this.client.post(`/api/personnel/chat/messages/${messageId}/moderate`, {action, reason});
  }

  /**
   * Moderate a chat room member (Officer/Admin only)
   */
  async moderateChatMember(roomId: string, userId: string, action: 'remove' | 'mute' | 'warn', reason?: string, duration?: number): Promise<void> {
    await this.client.post(`/api/personnel/chat/rooms/${roomId}/members/${userId}/moderate`, {action, reason, duration});
  }

  /**
   * Update chat room settings (Officer/Admin only)
   */
  async updateChatRoomSettings(roomId: string, settings: {isModerated?: boolean; allowFileUploads?: boolean; allowMemberInvites?: boolean}): Promise<ChatRoom> {
    const response = await this.client.put(`/api/personnel/chat/rooms/${roomId}/settings`, settings);
    return this.parseChatRoom(response.data);
  }

  // ==================== Call-Out Endpoints ====================

  /**
   * Get call-outs for current user
   */
  async getCallOuts(): Promise<CallOut[]> {
    const response = await this.client.get('/api/personnel/call-outs');
    return this.parseCallOuts(response.data);
  }

  /**
   * Get call-out details
   */
  async getCallOut(id: string): Promise<CallOut> {
    const response = await this.client.get(`/api/personnel/call-outs/${id}`);
    return this.parseCallOut(response.data);
  }

  /**
   * Respond to call-out
   */
  async respondToCallOut(
    callOutId: string,
    status: 'available' | 'en_route' | 'unavailable',
    estimatedArrival?: Date,
    notes?: string
  ): Promise<CallOutResponse> {
    const response = await this.client.post(`/api/personnel/call-outs/${callOutId}/respond`, {
      status,
      estimatedArrival,
      notes,
    });
    return this.parseCallOutResponse(response.data);
  }

  // ==================== SAR Mission Endpoints ====================

  /**
   * Get SAR missions
   */
  async getSARMissions(): Promise<SARMission[]> {
    const response = await this.client.get('/api/personnel/sar/missions');
    return this.parseSARMissions(response.data);
  }

  /**
   * Get SAR mission details
   */
  async getSARMission(id: string): Promise<SARMission> {
    const response = await this.client.get(`/api/personnel/sar/missions/${id}`);
    return this.parseSARMission(response.data);
  }

  /**
   * Create SAR mission (training only for personnel)
   */
  async createSARMission(mission: Partial<SARMission>): Promise<SARMission> {
    const response = await this.client.post('/api/personnel/sar/missions', mission);
    return this.parseSARMission(response.data);
  }

  /**
   * Get SAR mission areas
   */
  async getSARMissionAreas(missionId: string): Promise<SARMissionArea[]> {
    const response = await this.client.get(`/api/personnel/sar/missions/${missionId}/areas`);
    return this.parseSARMissionAreas(response.data);
  }

  /**
   * Create SAR mission area
   */
  async createSARMissionArea(missionId: string, area: Partial<SARMissionArea>): Promise<SARMissionArea> {
    const response = await this.client.post(`/api/personnel/sar/missions/${missionId}/areas`, area);
    return this.parseSARMissionArea(response.data);
  }

  /**
   * Update SAR mission area
   */
  async updateSARMissionArea(missionId: string, areaId: string, area: Partial<SARMissionArea>): Promise<SARMissionArea> {
    const response = await this.client.put(`/api/personnel/sar/missions/${missionId}/areas/${areaId}`, area);
    return this.parseSARMissionArea(response.data);
  }

  // ==================== Incident Endpoints ====================

  /**
   * Get incidents
   */
  async getIncidents(): Promise<Incident[]> {
    const response = await this.client.get('/api/personnel/incidents');
    return this.parseIncidents(response.data);
  }

  /**
   * Get incident details
   */
  async getIncident(id: string): Promise<Incident> {
    const response = await this.client.get(`/api/personnel/incidents/${id}`);
    return this.parseIncident(response.data);
  }

  /**
   * Get incident resources
   */
  async getIncidentResources(incidentId: string): Promise<any[]> {
    const response = await this.client.get(`/api/personnel/incidents/${incidentId}/resources`);
    return response.data;
  }

  // ==================== Admin Endpoints ====================

  /**
   * Create alert (Admin+)
   */
  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    const response = await this.client.post('/api/admin/alerts', alert);
    return this.parseAlert(response.data);
  }

  /**
   * Update alert (Admin+)
   */
  async updateAlert(id: string, alert: Partial<Alert>): Promise<Alert> {
    const response = await this.client.put(`/api/admin/alerts/${id}`, alert);
    return this.parseAlert(response.data);
  }

  /**
   * Delete alert (Admin+)
   */
  async deleteAlert(id: string): Promise<void> {
    await this.client.delete(`/api/admin/alerts/${id}`);
  }

  /**
   * Create mass call-out (Command only)
   */
  async createCallOut(callOut: Partial<CallOut>): Promise<CallOut> {
    const response = await this.client.post('/api/admin/call-outs', callOut);
    return this.parseCallOut(response.data);
  }

  /**
   * Get call-out responses (Command only)
   */
  async getCallOutResponses(callOutId: string): Promise<CallOutResponse[]> {
    const response = await this.client.get(`/api/admin/call-outs/${callOutId}/responses`);
    return this.parseCallOutResponses(response.data);
  }

  /**
   * Create active SAR mission (Command only)
   */
  async createActiveSARMission(mission: Partial<SARMission>): Promise<SARMission> {
    const response = await this.client.post('/api/admin/sar/missions', mission);
    return this.parseSARMission(response.data);
  }

  // ==================== Data Parsing Helpers ====================

  private parseAlert(data: any): Alert {
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      location: data.location ? {
        latitude: data.location.lat || data.location.latitude,
        longitude: data.location.lng || data.location.longitude,
      } : undefined,
    };
  }

  private parseAlerts(data: any[]): Alert[] {
    return data.map(item => this.parseAlert(item));
  }

  private parseMapZone(data: any): MapZone {
    return {
      ...data,
      coordinates: data.coordinates || [],
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseMapZones(data: any[]): MapZone[] {
    return data.map(item => this.parseMapZone(item));
  }

  private parseReport(data: any): EmergencyReport {
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      location: {
        latitude: data.location_lat || data.location.latitude,
        longitude: data.location_lng || data.location.longitude,
      },
    };
  }

  private parseEvents(data: any[]): CommunityEvent[] {
    return data.map(item => ({
      ...item,
      date: new Date(item.date),
    }));
  }

  private parseChatRoom(data: any): ChatRoom {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      lastMessage: data.lastMessage ? this.parseChatMessage(data.lastMessage) : undefined,
      members: data.members || [],
    };
  }

  private parseChatRooms(data: any[]): ChatRoom[] {
    return data.map(item => this.parseChatRoom(item));
  }

  private parseChatMessage(data: any): ChatMessage {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      readBy: data.readBy ? data.readBy.map((r: any) => ({
        ...r,
        readAt: new Date(r.readAt),
      })) : undefined,
      flaggedAt: data.flaggedAt ? new Date(data.flaggedAt) : undefined,
    };
  }

  private parseChatMessages(data: any[]): ChatMessage[] {
    return data.map(item => this.parseChatMessage(item));
  }

  private parseCallOut(data: any): CallOut {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      responses: data.responses ? this.parseCallOutResponses(data.responses) : undefined,
    };
  }

  private parseCallOuts(data: any[]): CallOut[] {
    return data.map(item => this.parseCallOut(item));
  }

  private parseCallOutResponse(data: any): CallOutResponse {
    return {
      ...data,
      respondedAt: new Date(data.respondedAt),
      estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseCallOutResponses(data: any[]): CallOutResponse[] {
    return data.map(item => this.parseCallOutResponse(item));
  }

  private parseSARMission(data: any): SARMission {
    return {
      ...data,
      startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      areas: data.areas ? this.parseSARMissionAreas(data.areas) : undefined,
    };
  }

  private parseSARMissions(data: any[]): SARMission[] {
    return data.map(item => this.parseSARMission(item));
  }

  private parseSARMissionArea(data: any): SARMissionArea {
    return {
      ...data,
      coordinates: data.coordinates || [],
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseSARMissionAreas(data: any[]): SARMissionArea[] {
    return data.map(item => this.parseSARMissionArea(item));
  }

  private parseIncident(data: any): Incident {
    return {
      ...data,
      startedAt: new Date(data.startedAt),
      resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      location: data.location_lat ? {
        latitude: data.location_lat,
        longitude: data.location_lng,
      } : undefined,
      resources: data.resources || [],
    };
  }

  private parseIncidents(data: any[]): Incident[] {
    return data.map(item => this.parseIncident(item));
  }

  // ==================== Vehicle Management Endpoints ====================

  /**
   * Get all vehicles
   */
  async getVehicles(): Promise<Vehicle[]> {
    const response = await this.client.get('/api/vehicles');
    return this.parseVehicles(response.data);
  }

  /**
   * Get vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle> {
    const response = await this.client.get(`/api/vehicles/${id}`);
    return this.parseVehicle(response.data);
  }

  /**
   * Create vehicle (Admin/Officer only)
   */
  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const response = await this.client.post('/api/vehicles', vehicle);
    return this.parseVehicle(response.data);
  }

  /**
   * Update vehicle (Admin/Officer only)
   */
  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const response = await this.client.put(`/api/vehicles/${id}`, vehicle);
    return this.parseVehicle(response.data);
  }

  /**
   * Delete vehicle (Admin only)
   */
  async deleteVehicle(id: string): Promise<void> {
    await this.client.delete(`/api/vehicles/${id}`);
  }

  /**
   * Get maintenance logs for vehicle
   */
  async getVehicleMaintenanceLogs(vehicleId: string): Promise<MaintenanceLog[]> {
    const response = await this.client.get(`/api/vehicles/${vehicleId}/maintenance`);
    return this.parseMaintenanceLogs(response.data);
  }

  /**
   * Create maintenance log (Admin/Officer only)
   */
  async createMaintenanceLog(vehicleId: string, log: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const response = await this.client.post(`/api/vehicles/${vehicleId}/maintenance`, log);
    return this.parseMaintenanceLog(response.data);
  }

  /**
   * Get maintenance reminders
   */
  async getMaintenanceReminders(): Promise<MaintenanceReminder[]> {
    const response = await this.client.get('/api/vehicles/maintenance/reminders');
    return this.parseMaintenanceReminders(response.data);
  }

  // ==================== Equipment Management Endpoints ====================

  /**
   * Get all equipment
   */
  async getEquipment(filters?: {category?: string; status?: string; assignedTo?: string}): Promise<Equipment[]> {
    const response = await this.client.get('/api/equipment', {params: filters});
    return this.parseEquipment(response.data);
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentItem(id: string): Promise<Equipment> {
    const response = await this.client.get(`/api/equipment/${id}`);
    return this.parseEquipmentItem(response.data);
  }

  /**
   * Create equipment (Admin/Officer only)
   */
  async createEquipment(equipment: Partial<Equipment>): Promise<Equipment> {
    const response = await this.client.post('/api/equipment', equipment);
    return this.parseEquipmentItem(response.data);
  }

  /**
   * Update equipment (Admin/Officer only)
   */
  async updateEquipment(id: string, equipment: Partial<Equipment>): Promise<Equipment> {
    const response = await this.client.put(`/api/equipment/${id}`, equipment);
    return this.parseEquipmentItem(response.data);
  }

  /**
   * Delete equipment (Admin only)
   */
  async deleteEquipment(id: string): Promise<void> {
    await this.client.delete(`/api/equipment/${id}`);
  }

  /**
   * Get equipment inspections
   */
  async getEquipmentInspections(equipmentId?: string): Promise<EquipmentInspection[]> {
    const url = equipmentId 
      ? `/api/equipment/${equipmentId}/inspections`
      : '/api/equipment/inspections';
    const response = await this.client.get(url);
    return this.parseEquipmentInspections(response.data);
  }

  /**
   * Create equipment inspection (Admin/Officer only)
   */
  async createEquipmentInspection(equipmentId: string, inspection: Partial<EquipmentInspection>): Promise<EquipmentInspection> {
    const response = await this.client.post(`/api/equipment/${equipmentId}/inspections`, inspection);
    return this.parseEquipmentInspection(response.data);
  }

  /**
   * Assign equipment to user (Admin/Officer only)
   */
  async assignEquipment(equipmentId: string, userId: string, notes?: string): Promise<EquipmentAssignment> {
    const response = await this.client.post(`/api/equipment/${equipmentId}/assign`, {userId, notes});
    return this.parseEquipmentAssignment(response.data);
  }

  /**
   * Return equipment (Admin/Officer only)
   */
  async returnEquipment(assignmentId: string): Promise<void> {
    await this.client.post(`/api/equipment/assignments/${assignmentId}/return`);
  }

  /**
   * Get equipment assignments
   */
  async getEquipmentAssignments(filters?: {equipmentId?: string; userId?: string}): Promise<EquipmentAssignment[]> {
    const response = await this.client.get('/api/equipment/assignments', {params: filters});
    return this.parseEquipmentAssignments(response.data);
  }

  // ==================== Training & Certifications Endpoints ====================

  /**
   * Get certifications for user (or all if Admin/Officer)
   */
  async getCertifications(userId?: string): Promise<Certification[]> {
    const url = userId ? `/api/users/${userId}/certifications` : '/api/certifications';
    const response = await this.client.get(url);
    return this.parseCertifications(response.data);
  }

  /**
   * Get certification by ID
   */
  async getCertification(id: string): Promise<Certification> {
    const response = await this.client.get(`/api/certifications/${id}`);
    return this.parseCertification(response.data);
  }

  /**
   * Create certification (Admin/Officer can create for any user, Members can create for themselves)
   */
  async createCertification(certification: Partial<Certification>): Promise<Certification> {
    const response = await this.client.post('/api/certifications', certification);
    return this.parseCertification(response.data);
  }

  /**
   * Update certification
   */
  async updateCertification(id: string, certification: Partial<Certification>): Promise<Certification> {
    const response = await this.client.put(`/api/certifications/${id}`, certification);
    return this.parseCertification(response.data);
  }

  /**
   * Delete certification (Admin/Officer only)
   */
  async deleteCertification(id: string): Promise<void> {
    await this.client.delete(`/api/certifications/${id}`);
  }

  /**
   * Approve certification (Officer/Admin only)
   */
  async approveCertification(id: string, notes?: string): Promise<Certification> {
    const response = await this.client.post(`/api/certifications/${id}/approve`, {notes});
    return this.parseCertification(response.data);
  }

  /**
   * Get expiring certifications
   */
  async getExpiringCertifications(days?: number): Promise<Certification[]> {
    const response = await this.client.get('/api/certifications/expiring', {params: {days}});
    return this.parseCertifications(response.data);
  }

  /**
   * Get training records for user (or all if Admin/Officer)
   */
  async getTrainingRecords(userId?: string): Promise<TrainingRecord[]> {
    const url = userId ? `/api/users/${userId}/training` : '/api/training';
    const response = await this.client.get(url);
    return this.parseTrainingRecords(response.data);
  }

  /**
   * Create training record (Admin/Officer can create for any user, Members can create for themselves)
   */
  async createTrainingRecord(record: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const response = await this.client.post('/api/training', record);
    return this.parseTrainingRecord(response.data);
  }

  /**
   * Update training record
   */
  async updateTrainingRecord(id: string, record: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const response = await this.client.put(`/api/training/${id}`, record);
    return this.parseTrainingRecord(response.data);
  }

  /**
   * Delete training record (Admin/Officer only)
   */
  async deleteTrainingRecord(id: string): Promise<void> {
    await this.client.delete(`/api/training/${id}`);
  }

  // ==================== Checklists Endpoints ====================

  /**
   * Get checklist templates
   */
  async getChecklistTemplates(type?: string): Promise<ChecklistTemplate[]> {
    const response = await this.client.get('/api/checklists/templates', {params: {type}});
    return this.parseChecklistTemplates(response.data);
  }

  /**
   * Get checklist template by ID
   */
  async getChecklistTemplate(id: string): Promise<ChecklistTemplate> {
    const response = await this.client.get(`/api/checklists/templates/${id}`);
    return this.parseChecklistTemplate(response.data);
  }

  /**
   * Create checklist template (Admin/Officer only)
   */
  async createChecklistTemplate(template: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const response = await this.client.post('/api/checklists/templates', template);
    return this.parseChecklistTemplate(response.data);
  }

  /**
   * Update checklist template (Admin/Officer only, or if not locked)
   */
  async updateChecklistTemplate(id: string, template: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const response = await this.client.put(`/api/checklists/templates/${id}`, template);
    return this.parseChecklistTemplate(response.data);
  }

  /**
   * Delete checklist template (Admin only)
   */
  async deleteChecklistTemplate(id: string): Promise<void> {
    await this.client.delete(`/api/checklists/templates/${id}`);
  }

  /**
   * Get checklists (filtered by assigned user if Member)
   */
  async getChecklists(filters?: {assignedTo?: string; status?: string; type?: string}): Promise<Checklist[]> {
    const response = await this.client.get('/api/checklists', {params: filters});
    return this.parseChecklists(response.data);
  }

  /**
   * Get checklist by ID
   */
  async getChecklist(id: string): Promise<Checklist> {
    const response = await this.client.get(`/api/checklists/${id}`);
    return this.parseChecklist(response.data);
  }

  /**
   * Create checklist (Admin/Officer only for assignments)
   */
  async createChecklist(checklist: Partial<Checklist>): Promise<Checklist> {
    const response = await this.client.post('/api/checklists', checklist);
    return this.parseChecklist(response.data);
  }

  /**
   * Update checklist
   */
  async updateChecklist(id: string, checklist: Partial<Checklist>): Promise<Checklist> {
    const response = await this.client.put(`/api/checklists/${id}`, checklist);
    return this.parseChecklist(response.data);
  }

  /**
   * Complete checklist
   */
  async completeChecklist(id: string, signature?: string, notes?: string): Promise<Checklist> {
    const response = await this.client.post(`/api/checklists/${id}/complete`, {signature, notes});
    return this.parseChecklist(response.data);
  }

  /**
   * Export checklist to PDF
   */
  async exportChecklistToPDF(id: string): Promise<Blob> {
    const response = await this.client.get(`/api/checklists/${id}/export/pdf`, {responseType: 'blob'});
    return response.data;
  }

  /**
   * Sync offline checklists
   */
  async syncOfflineChecklists(checklists: Checklist[]): Promise<Checklist[]> {
    const response = await this.client.post('/api/checklists/sync', {checklists});
    return this.parseChecklists(response.data);
  }

  // ==================== Resource Library Endpoints ====================

  /**
   * Get resources (filtered by access level)
   */
  async getResources(filters?: {category?: string; tag?: string; search?: string}): Promise<Resource[]> {
    const response = await this.client.get('/api/resources', {params: filters});
    return this.parseResources(response.data);
  }

  /**
   * Get resource by ID
   */
  async getResource(id: string): Promise<Resource> {
    const response = await this.client.get(`/api/resources/${id}`);
    return this.parseResource(response.data);
  }

  /**
   * Create resource (Admin/Officer only)
   */
  async createResource(resource: Partial<Resource>): Promise<Resource> {
    const response = await this.client.post('/api/resources', resource);
    return this.parseResource(response.data);
  }

  /**
   * Update resource (Admin/Officer only)
   */
  async updateResource(id: string, resource: Partial<Resource>): Promise<Resource> {
    const response = await this.client.put(`/api/resources/${id}`, resource);
    return this.parseResource(response.data);
  }

  /**
   * Delete resource (Admin only)
   */
  async deleteResource(id: string): Promise<void> {
    await this.client.delete(`/api/resources/${id}`);
  }

  /**
   * Upload resource file
   */
  async uploadResourceFile(resourceId: string, file: FormData): Promise<Resource> {
    const response = await this.client.post(`/api/resources/${resourceId}/upload`, file, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return this.parseResource(response.data);
  }

  /**
   * Download resource
   */
  async downloadResource(id: string): Promise<Blob> {
    const response = await this.client.get(`/api/resources/${id}/download`, {responseType: 'blob'});
    return response.data;
  }

  // ==================== Callout Reports Endpoints ====================

  /**
   * Get callout reports (filtered by user if Member)
   */
  async getCalloutReports(filters?: {calloutId?: string; missionId?: string; status?: string}): Promise<CalloutReport[]> {
    const response = await this.client.get('/api/callout-reports', {params: filters});
    return this.parseCalloutReports(response.data);
  }

  /**
   * Get callout report by ID
   */
  async getCalloutReport(id: string): Promise<CalloutReport> {
    const response = await this.client.get(`/api/callout-reports/${id}`);
    return this.parseCalloutReport(response.data);
  }

  /**
   * Create callout report
   */
  async createCalloutReport(report: Partial<CalloutReport>): Promise<CalloutReport> {
    const response = await this.client.post('/api/callout-reports', report);
    return this.parseCalloutReport(response.data);
  }

  /**
   * Update callout report
   */
  async updateCalloutReport(id: string, report: Partial<CalloutReport>): Promise<CalloutReport> {
    const response = await this.client.put(`/api/callout-reports/${id}`, report);
    return this.parseCalloutReport(response.data);
  }

  /**
   * Submit callout report for review
   */
  async submitCalloutReport(id: string): Promise<CalloutReport> {
    const response = await this.client.post(`/api/callout-reports/${id}/submit`);
    return this.parseCalloutReport(response.data);
  }

  /**
   * Review callout report (Officer/Admin only)
   */
  async reviewCalloutReport(id: string, action: 'approve' | 'reject', notes?: string): Promise<CalloutReport> {
    const response = await this.client.post(`/api/callout-reports/${id}/review`, {action, notes});
    return this.parseCalloutReport(response.data);
  }

  /**
   * Export callout reports to PDF/CSV (Officer/Admin only)
   */
  async exportCalloutReports(filters: any, format: 'pdf' | 'csv'): Promise<Blob> {
    const response = await this.client.get('/api/callout-reports/export', {
      params: {...filters, format},
      responseType: 'blob',
    });
    return response.data;
  }

  // ==================== Notifications Endpoints ====================

  /**
   * Get user notifications
   */
  async getNotifications(filters?: {isRead?: boolean; type?: string}): Promise<Notification[]> {
    const response = await this.client.get('/api/notifications', {params: filters});
    return this.parseNotifications(response.data);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<void> {
    await this.client.post(`/api/notifications/${id}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    await this.client.post('/api/notifications/read-all');
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    await this.client.delete(`/api/notifications/${id}`);
  }

  // ==================== Data Parsing Helpers (New) ====================

  private parseVehicle(data: any): Vehicle {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseVehicles(data: any[]): Vehicle[] {
    return data.map(item => this.parseVehicle(item));
  }

  private parseMaintenanceLog(data: any): MaintenanceLog {
    return {
      ...data,
      performedAt: new Date(data.performedAt),
      nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
      createdAt: new Date(data.createdAt),
    };
  }

  private parseMaintenanceLogs(data: any[]): MaintenanceLog[] {
    return data.map(item => this.parseMaintenanceLog(item));
  }

  private parseMaintenanceReminders(data: any[]): MaintenanceReminder[] {
    return data.map(item => ({
      ...item,
      dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      createdAt: new Date(item.createdAt),
    }));
  }

  private parseEquipmentItem(data: any): Equipment {
    return {
      ...data,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      lastInspectionDate: data.lastInspectionDate ? new Date(data.lastInspectionDate) : undefined,
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseEquipment(data: any[]): Equipment[] {
    return data.map(item => this.parseEquipmentItem(item));
  }

  private parseEquipmentInspection(data: any): EquipmentInspection {
    return {
      ...data,
      inspectedAt: new Date(data.inspectedAt),
      nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : undefined,
      createdAt: new Date(data.createdAt),
    };
  }

  private parseEquipmentInspections(data: any[]): EquipmentInspection[] {
    return data.map(item => this.parseEquipmentInspection(item));
  }

  private parseEquipmentAssignment(data: any): EquipmentAssignment {
    return {
      ...data,
      assignedAt: new Date(data.assignedAt),
      returnedAt: data.returnedAt ? new Date(data.returnedAt) : undefined,
    };
  }

  private parseEquipmentAssignments(data: any[]): EquipmentAssignment[] {
    return data.map(item => this.parseEquipmentAssignment(item));
  }

  private parseCertification(data: any): Certification {
    return {
      ...data,
      issuedDate: new Date(data.issuedDate),
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseCertifications(data: any[]): Certification[] {
    return data.map(item => this.parseCertification(item));
  }

  private parseTrainingRecord(data: any): TrainingRecord {
    return {
      ...data,
      completedDate: new Date(data.completedDate),
      createdAt: new Date(data.createdAt),
    };
  }

  private parseTrainingRecords(data: any[]): TrainingRecord[] {
    return data.map(item => this.parseTrainingRecord(item));
  }

  private parseChecklistTemplate(data: any): ChecklistTemplate {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseChecklistTemplates(data: any[]): ChecklistTemplate[] {
    return data.map(item => this.parseChecklistTemplate(item));
  }

  private parseChecklist(data: any): Checklist {
    return {
      ...data,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      syncedAt: data.syncedAt ? new Date(data.syncedAt) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseChecklists(data: any[]): Checklist[] {
    return data.map(item => this.parseChecklist(item));
  }

  private parseResource(data: any): Resource {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseResources(data: any[]): Resource[] {
    return data.map(item => this.parseResource(item));
  }

  private parseCalloutReport(data: any): CalloutReport {
    return {
      ...data,
      date: new Date(data.date),
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private parseCalloutReports(data: any[]): CalloutReport[] {
    return data.map(item => this.parseCalloutReport(item));
  }

  private parseNotification(data: any): Notification {
    return {
      ...data,
      readAt: data.readAt ? new Date(data.readAt) : undefined,
      createdAt: new Date(data.createdAt),
    };
  }

  private parseNotifications(data: any[]): Notification[] {
    return data.map(item => this.parseNotification(item));
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;


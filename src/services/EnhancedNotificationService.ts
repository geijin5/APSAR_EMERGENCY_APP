import {notificationService} from './NotificationService';
import {apiService} from './ApiService';
import {
  Notification,
  NotificationType,
  Vehicle,
  Equipment,
  Certification,
  Checklist,
  CalloutReport,
  ChatMessage,
  MaintenanceLog,
} from '../types/index';

/**
 * Enhanced Notification Service
 * Handles sending notifications for all system events
 */
class EnhancedNotificationService {
  /**
   * Send notification for maintenance due
   */
  async notifyMaintenanceDue(vehicle: Vehicle, daysUntilDue: number): Promise<void> {
    const title = `Maintenance Due: ${vehicle.unitNumber}`;
    const message = `Maintenance is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`;
    
    await this.createInAppNotification({
      type: 'maintenance_due',
      title,
      message,
      data: {vehicleId: vehicle.id, type: 'maintenance_due'},
    });
  }

  /**
   * Send notification for maintenance overdue
   */
  async notifyMaintenanceOverdue(vehicle: Vehicle): Promise<void> {
    const title = `🚨 Maintenance Overdue: ${vehicle.unitNumber}`;
    const message = 'Maintenance is overdue. Please schedule service immediately.';
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {vehicleId: vehicle.id, type: 'maintenance_overdue'},
      priority: 'high',
    });

    await this.createInAppNotification({
      type: 'maintenance_overdue',
      title,
      message,
      data: {vehicleId: vehicle.id, type: 'maintenance_overdue'},
    });
  }

  /**
   * Send notification for equipment inspection due
   */
  async notifyEquipmentInspection(equipment: Equipment): Promise<void> {
    const title = `Equipment Inspection Due: ${equipment.name}`;
    const message = `Inspection due on ${equipment.nextInspectionDate ? new Date(equipment.nextInspectionDate).toLocaleDateString() : 'now'}`;
    
    await this.createInAppNotification({
      type: 'equipment_inspection',
      title,
      message,
      data: {equipmentId: equipment.id, type: 'equipment_inspection'},
    });
  }

  /**
   * Send notification for equipment expiration
   */
  async notifyEquipmentExpiration(equipment: Equipment): Promise<void> {
    const title = `Equipment Expiring: ${equipment.name}`;
    const message = `Equipment expires on ${equipment.expirationDate ? new Date(equipment.expirationDate).toLocaleDateString() : 'soon'}`;
    
    await this.createInAppNotification({
      type: 'equipment_expiration',
      title,
      message,
      data: {equipmentId: equipment.id, type: 'equipment_expiration'},
    });
  }

  /**
   * Send notification for equipment assignment
   */
  async notifyEquipmentAssignment(equipment: Equipment, assignedToUserId: string): Promise<void> {
    const title = `Equipment Assigned: ${equipment.name}`;
    const message = `You have been assigned ${equipment.name}`;
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {equipmentId: equipment.id, type: 'equipment_assigned'},
    });

    await this.createInAppNotification({
      type: 'equipment_assigned',
      title,
      message,
      data: {equipmentId: equipment.id, assignedTo: assignedToUserId, type: 'equipment_assigned'},
      userId: assignedToUserId,
    });
  }

  /**
   * Send notification for certification expiration
   */
  async notifyCertificationExpiration(certification: Certification, daysUntilExpiry: number): Promise<void> {
    const title = `Certification Expiring: ${certification.name}`;
    const message = `Your ${certification.name} certification expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`;
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {certificationId: certification.id, type: 'certification_expiration'},
      priority: daysUntilExpiry <= 7 ? 'high' : 'default',
    });

    await this.createInAppNotification({
      type: 'certification_expiration',
      title,
      message,
      data: {certificationId: certification.id, userId: certification.userId, type: 'certification_expiration'},
      userId: certification.userId,
    });
  }

  /**
   * Send notification for certification approval
   */
  async notifyCertificationApproval(certification: Certification): Promise<void> {
    const title = `Certification Approved: ${certification.name}`;
    const message = `Your ${certification.name} certification has been approved`;
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {certificationId: certification.id, type: 'certification_approval'},
    });

    await this.createInAppNotification({
      type: 'certification_approval',
      title,
      message,
      data: {certificationId: certification.id, userId: certification.userId, type: 'certification_approval'},
      userId: certification.userId,
    });
  }

  /**
   * Send notification for checklist assignment
   */
  async notifyChecklistAssignment(checklist: Checklist): Promise<void> {
    const title = `Checklist Assigned: ${checklist.title}`;
    const message = `You have been assigned a ${checklist.type} checklist`;
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {checklistId: checklist.id, type: 'checklist_assigned'},
    });

    await this.createInAppNotification({
      type: 'checklist_assigned',
      title,
      message,
      data: {checklistId: checklist.id, assignedTo: checklist.assignedTo, type: 'checklist_assigned'},
      userId: checklist.assignedTo,
    });
  }

  /**
   * Send notification for checklist reminder
   */
  async notifyChecklistReminder(checklist: Checklist): Promise<void> {
    const title = `Checklist Reminder: ${checklist.title}`;
    const message = 'You have a pending checklist to complete';
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {checklistId: checklist.id, type: 'checklist_reminder'},
    });
  }

  /**
   * Send notification for chat message
   */
  async notifyChatMessage(roomId: string, message: ChatMessage, userIds: string[]): Promise<void> {
    // Don't notify the sender
    const recipients = userIds.filter(id => id !== message.userId);
    
    for (const userId of recipients) {
      await notificationService.sendPushNotification({
        title: `New message in chat`,
        message: `${message.userName}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
        data: {roomId, messageId: message.id, type: 'chat'},
      });

      await this.createInAppNotification({
        type: 'chat',
        title: 'New chat message',
        message: message.message,
        data: {roomId, messageId: message.id, type: 'chat'},
        userId,
      });
    }
  }

  /**
   * Send notification for chat mention
   */
  async notifyChatMention(roomId: string, message: ChatMessage, mentionedUserId: string): Promise<void> {
    const title = `You were mentioned in chat`;
    const messageText = `${message.userName} mentioned you: ${message.message.substring(0, 50)}`;
    
    await notificationService.sendPushNotification({
      title,
      message: messageText,
      data: {roomId, messageId: message.id, type: 'chat_mention'},
      priority: 'high',
    });

    await this.createInAppNotification({
      type: 'chat_mention',
      title,
      message: messageText,
      data: {roomId, messageId: message.id, type: 'chat_mention'},
      userId: mentionedUserId,
    });
  }

  /**
   * Send notification for callout report approval
   */
  async notifyReportApproval(report: CalloutReport): Promise<void> {
    const title = `Report Approved: ${report.incidentType}`;
    const message = 'Your callout report has been approved';
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {reportId: report.id, type: 'report_approved'},
    });

    await this.createInAppNotification({
      type: 'report_approved',
      title,
      message,
      data: {reportId: report.id, submittedBy: report.submittedBy, type: 'report_approved'},
      userId: report.submittedBy,
    });
  }

  /**
   * Send notification for callout report rejection
   */
  async notifyReportRejection(report: CalloutReport, reviewNotes?: string): Promise<void> {
    const title = `Report Needs Revision: ${report.incidentType}`;
    const message = reviewNotes || 'Your callout report was rejected and needs revision';
    
    await notificationService.sendPushNotification({
      title,
      message,
      data: {reportId: report.id, type: 'report_rejected'},
      priority: 'high',
    });

    await this.createInAppNotification({
      type: 'report_rejected',
      title,
      message,
      data: {reportId: report.id, submittedBy: report.submittedBy, type: 'report_rejected'},
      userId: report.submittedBy,
    });
  }

  /**
   * Send notification for report review request (to officers)
   */
  async notifyReportReviewRequest(report: CalloutReport, officerUserIds: string[]): Promise<void> {
    const title = `Report Review Request: ${report.incidentType}`;
    const message = `New callout report submitted by ${report.submittedByName || 'a member'}`;
    
    for (const userId of officerUserIds) {
      await notificationService.sendPushNotification({
        title,
        message,
        data: {reportId: report.id, type: 'report_review_requested'},
      });

      await this.createInAppNotification({
        type: 'report_review_requested',
        title,
        message,
        data: {reportId: report.id, type: 'report_review_requested'},
        userId,
      });
    }
  }

  /**
   * Send notification for vehicle status change
   */
  async notifyVehicleStatusChange(vehicle: Vehicle, oldStatus: string): Promise<void> {
    const title = `Vehicle Status Changed: ${vehicle.unitNumber}`;
    const message = `Status changed from ${oldStatus} to ${vehicle.status}`;
    
    await this.createInAppNotification({
      type: 'vehicle_status_change',
      title,
      message,
      data: {vehicleId: vehicle.id, oldStatus, newStatus: vehicle.status, type: 'vehicle_status_change'},
    });
  }

  /**
   * Create in-app notification (stored in database)
   */
  private async createInAppNotification(notification: {
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    userId?: string;
  }): Promise<void> {
    try {
      // This would call the API to create the notification
      // await apiService.createNotification({
      //   userId: notification.userId || currentUserId,
      //   type: notification.type,
      //   title: notification.title,
      //   message: notification.message,
      //   channels: ['in_app'],
      //   data: notification.data,
      // });
      console.log('In-app notification created:', notification);
    } catch (error) {
      console.error('Failed to create in-app notification:', error);
    }
  }

  /**
   * Send email notification (via backend API)
   */
  async sendEmailNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // This would call the backend API to send email
      // await apiService.sendEmailNotification({
      //   userId,
      //   type,
      //   title,
      //   message,
      //   data,
      // });
      console.log('Email notification sent:', {userId, type, title, message});
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();
export default enhancedNotificationService;



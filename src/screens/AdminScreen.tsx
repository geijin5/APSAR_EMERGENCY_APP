import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import {colors, typography, spacing} from '../utils/theme';
import {MapZone, Alert as AlertType, EmergencyReport} from '../types/index';

const AdminScreen: React.FC = () => {
  const [zones, setZones] = useState<MapZone[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'zones' | 'alerts' | 'reports'>('overview');

  // Zone creation form
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState<MapZone['type']>('restricted');
  const [zoneDescription, setZoneDescription] = useState('');

  // Alert creation form
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType['type']>('info');
  const [alertPriority, setAlertPriority] = useState<AlertType['priority']>('medium');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    // In a real app, this would fetch from a server
    // For now, we'll use mock data
    const mockZones: MapZone[] = [
      {
        id: '1',
        name: 'Active Search Zone - Pintler Mountains',
        type: 'search',
        coordinates: [
          {latitude: 45.9231, longitude: -113.3943},
          {latitude: 45.9281, longitude: -113.3893},
          {latitude: 45.9331, longitude: -113.3943},
          {latitude: 45.9281, longitude: -113.3993},
        ],
        description: 'Active search operation in progress',
        startTime: new Date(),
        isActive: true,
      },
    ];

    const mockAlerts: AlertType[] = [
      {
        id: '1',
        title: 'Active Search Operation',
        message: 'Search and rescue operation in progress in Pintler Mountains.',
        type: 'search',
        priority: 'high',
        timestamp: new Date(),
        isRead: false,
      },
    ];

    const mockReports: EmergencyReport[] = [
      {
        id: '1',
        type: 'missing_person',
        title: 'Missing Hiker - John Smith',
        description: 'Last seen on Pintler Trail near Georgetown Lake.',
        location: {latitude: 45.9231, longitude: -113.3943},
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'investigating',
        priority: 'high',
      },
    ];

    setZones(mockZones);
    setAlerts(mockAlerts);
    setReports(mockReports);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleCreateZone = () => {
    if (!zoneName.trim()) {
      Alert.alert('Error', 'Please enter a zone name.');
      return;
    }

    const newZone: MapZone = {
      id: Date.now().toString(),
      name: zoneName.trim(),
      type: zoneType,
      coordinates: [], // In a real app, this would be set by drawing on a map
      description: zoneDescription.trim(),
      startTime: new Date(),
      isActive: true,
    };

    setZones(prev => [...prev, newZone]);
    setShowCreateZoneModal(false);
    
    // Reset form
    setZoneName('');
    setZoneDescription('');
    
    Alert.alert('Success', 'Zone created successfully.');
  };

  const handleCreateAlert = () => {
    if (!alertTitle.trim() || !alertMessage.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const newAlert: AlertType = {
      id: Date.now().toString(),
      title: alertTitle.trim(),
      message: alertMessage.trim(),
      type: alertType,
      priority: alertPriority,
      timestamp: new Date(),
      isRead: false,
    };

    setAlerts(prev => [...prev, newAlert]);
    setShowCreateAlertModal(false);
    
    // Reset form
    setAlertTitle('');
    setAlertMessage('');
    
    Alert.alert('Success', 'Alert created and sent to all users.');
  };

  const toggleZoneActive = (zoneId: string) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, isActive: !zone.isActive } : zone
    ));
  };

  const updateReportStatus = (reportId: string, status: EmergencyReport['status']) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status } : report
    ));
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{zones.filter(z => z.isActive).length}</Text>
          <Text style={styles.statLabel}>Active Zones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{alerts.filter(a => !a.isRead).length}</Text>
          <Text style={styles.statLabel}>Unread Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reports.filter(r => r.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reports.filter(r => r.status === 'investigating').length}</Text>
          <Text style={styles.statLabel}>Active Investigations</Text>
        </View>
      </View>

      <EmergencyCard
        type="info"
        title="Quick Actions"
        description="Common administrative tasks"
      >
        <View style={styles.quickActions}>
          <EmergencyButton
            title="Create Zone"
            icon={<Icon name="add-location" size={20} color={colors.surface} />}
            onPress={() => setShowCreateZoneModal(true)}
            variant="primary"
            size="medium"
            style={styles.quickActionButton}
          />
          <EmergencyButton
            title="Send Alert"
            icon={<Icon name="notifications" size={20} color={colors.surface} />}
            onPress={() => setShowCreateAlertModal(true)}
            variant="warning"
            size="medium"
            style={styles.quickActionButton}
          />
        </View>
      </EmergencyCard>
    </View>
  );

  const renderZones = () => (
    <View style={styles.tabContent}>
      {zones.map((zone) => (
        <EmergencyCard
          key={zone.id}
          title={zone.name}
          description={zone.description}
          type={zone.isActive ? 'info' : 'warning'}
          icon="location-on"
        >
          <View style={styles.zoneFooter}>
            <StatusIndicator
              status={zone.isActive ? 'active' : 'inactive'}
              label={zone.isActive ? 'Active' : 'Inactive'}
              size="small"
            />
            <View style={styles.zoneActions}>
              <EmergencyButton
                title={zone.isActive ? 'Deactivate' : 'Activate'}
                onPress={() => toggleZoneActive(zone.id)}
                variant={zone.isActive ? 'warning' : 'success'}
                size="small"
                style={styles.actionButton}
              />
            </View>
          </View>
        </EmergencyCard>
      ))}
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.tabContent}>
      {alerts.map((alert) => (
        <EmergencyCard
          key={alert.id}
          title={alert.title}
          description={alert.message}
          type={alert.priority === 'high' ? 'emergency' : alert.priority === 'medium' ? 'warning' : 'info'}
          icon="notifications"
          timestamp={alert.timestamp}
        >
          <View style={styles.alertFooter}>
            <Text style={styles.alertType}>{alert.type.toUpperCase()} - {alert.priority.toUpperCase()}</Text>
            <StatusIndicator
              status={alert.isRead ? 'success' : 'pending'}
              label={alert.isRead ? 'Sent' : 'Draft'}
              size="small"
            />
          </View>
        </EmergencyCard>
      ))}
    </View>
  );

  const renderReports = () => (
    <View style={styles.tabContent}>
      {reports.map((report) => (
        <EmergencyCard
          key={report.id}
          title={report.title}
          description={report.description}
          type={report.priority === 'high' ? 'emergency' : report.priority === 'medium' ? 'warning' : 'info'}
          icon="report-problem"
          timestamp={report.timestamp}
        >
          <View style={styles.reportFooter}>
            <StatusIndicator
              status={report.status === 'resolved' ? 'success' : report.status === 'investigating' ? 'pending' : 'warning'}
              label={report.status.toUpperCase()}
              size="small"
            />
            <View style={styles.reportActions}>
              {report.status === 'pending' && (
                <EmergencyButton
                  title="Investigate"
                  onPress={() => updateReportStatus(report.id, 'investigating')}
                  variant="info"
                  size="small"
                  style={styles.actionButton}
                />
              )}
              {report.status === 'investigating' && (
                <>
                  <EmergencyButton
                    title="Resolve"
                    onPress={() => updateReportStatus(report.id, 'resolved')}
                    variant="success"
                    size="small"
                    style={styles.actionButton}
                  />
                  <EmergencyButton
                    title="False Alarm"
                    onPress={() => updateReportStatus(report.id, 'false_alarm')}
                    variant="secondary"
                    size="small"
                    style={styles.actionButton}
                  />
                </>
              )}
            </View>
          </View>
        </EmergencyCard>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Admin Dashboard"
        subtitle="Manage zones, alerts, and reports"
      />

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'zones' && styles.activeTab]}
          onPress={() => setSelectedTab('zones')}
        >
          <Text style={[styles.tabText, selectedTab === 'zones' && styles.activeTabText]}>
            Zones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alerts' && styles.activeTab]}
          onPress={() => setSelectedTab('alerts')}
        >
          <Text style={[styles.tabText, selectedTab === 'alerts' && styles.activeTabText]}>
            Alerts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reports' && styles.activeTab]}
          onPress={() => setSelectedTab('reports')}
        >
          <Text style={[styles.tabText, selectedTab === 'reports' && styles.activeTabText]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'zones' && renderZones()}
        {selectedTab === 'alerts' && renderAlerts()}
        {selectedTab === 'reports' && renderReports()}
      </ScrollView>

      {/* Create Zone Modal */}
      <Modal visible={showCreateZoneModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <EmergencyHeader
            title="Create Zone"
            subtitle="Add a new emergency zone"
            showNotifications={false}
          />
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Zone Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter zone name"
                value={zoneName}
                onChangeText={setZoneName}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Zone Type</Text>
              <View style={styles.typeButtons}>
                {(['restricted', 'caution', 'clear', 'search', 'detour', 'parade'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, zoneType === type && styles.activeTypeButton]}
                    onPress={() => setZoneType(type)}
                  >
                    <Text style={[styles.typeButtonText, zoneType === type && styles.activeTypeButtonText]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Zone description"
                value={zoneDescription}
                onChangeText={setZoneDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <EmergencyButton
              title="Cancel"
              onPress={() => setShowCreateZoneModal(false)}
              variant="secondary"
              size="large"
              style={styles.modalButton}
            />
            <EmergencyButton
              title="Create Zone"
              onPress={handleCreateZone}
              variant="primary"
              size="large"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Create Alert Modal */}
      <Modal visible={showCreateAlertModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <EmergencyHeader
            title="Create Alert"
            subtitle="Send emergency alert to all users"
            showNotifications={false}
          />
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Alert Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter alert title"
                value={alertTitle}
                onChangeText={setAlertTitle}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Alert Message *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter alert message"
                value={alertMessage}
                onChangeText={setAlertMessage}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Alert Type</Text>
              <View style={styles.typeButtons}>
                {(['emergency', 'warning', 'info', 'search', 'weather', 'traffic', 'event'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, alertType === type && styles.activeTypeButton]}
                    onPress={() => setAlertType(type)}
                  >
                    <Text style={[styles.typeButtonText, alertType === type && styles.activeTypeButtonText]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.priorityButton, alertPriority === level && styles.activePriorityButton]}
                    onPress={() => setAlertPriority(level)}
                  >
                    <Text style={[styles.priorityButtonText, alertPriority === level && styles.activePriorityButtonText]}>
                      {level.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <EmergencyButton
              title="Cancel"
              onPress={() => setShowCreateAlertModal(false)}
              variant="secondary"
              size="large"
              style={styles.modalButton}
            />
            <EmergencyButton
              title="Send Alert"
              onPress={handleCreateAlert}
              variant="warning"
              size="large"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.surface,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    margin: '1%',
    alignItems: 'center',
    ...colors.shadows.medium,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  tabContent: {
    paddingHorizontal: spacing.sm,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  zoneActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: spacing.sm,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  alertType: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  reportActions: {
    flexDirection: 'row',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    minWidth: '30%',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTypeButtonText: {
    color: colors.surface,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.surface,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  activePriorityButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  activePriorityButtonText: {
    color: colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default AdminScreen;

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
import {Card, Chip, Button, Surface, Divider, List} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';
import {MapZone, Alert as AlertType, EmergencyReport, User, CallOut, SARMission, Incident} from '../types/index';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalAlerts: number;
  activeAlerts: number;
  totalReports: number;
  pendingReports: number;
  activeMissions: number;
  activeCallOuts: number;
  activeIncidents: number;
  alertsLast24h: number;
  reportsLast24h: number;
  averageResponseTime: number; // in minutes
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: Date;
  details?: string;
}

const AdminScreen: React.FC = () => {
  const {user, isCommand} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'analytics' | 'users' | 'zones' | 'alerts' | 'reports' | 'audit'
  >('overview');
  
  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalAlerts: 0,
    activeAlerts: 0,
    totalReports: 0,
    pendingReports: 0,
    activeMissions: 0,
    activeCallOuts: 0,
    activeIncidents: 0,
    alertsLast24h: 0,
    reportsLast24h: 0,
    averageResponseTime: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [zones, setZones] = useState<MapZone[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Modal states
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Form states
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState<MapZone['type']>('restricted');
  const [zoneDescription, setZoneDescription] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType['type']>('info');
  const [alertPriority, setAlertPriority] = useState<AlertType['priority']>('medium');
  const [alertTargetAudience, setAlertTargetAudience] = useState<'public' | 'personnel' | 'all'>('all');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load analytics
      const analyticsData = await apiService.getPersonnelDashboard();
      // Transform to analytics format
      setAnalytics({
        totalUsers: analyticsData.totalUsers || 0,
        activeUsers: analyticsData.activeUsers || 0,
        totalAlerts: analyticsData.totalAlerts || 0,
        activeAlerts: analyticsData.activeAlerts || 0,
        totalReports: analyticsData.totalReports || 0,
        pendingReports: analyticsData.pendingReports || 0,
        activeMissions: analyticsData.activeMissions || 0,
        activeCallOuts: analyticsData.activeCallOuts || 0,
        activeIncidents: analyticsData.activeIncidents || 0,
        alertsLast24h: analyticsData.alertsLast24h || 0,
        reportsLast24h: analyticsData.reportsLast24h || 0,
        averageResponseTime: analyticsData.averageResponseTime || 0,
      });

      // Load other data
      const [zonesData, alertsData, reportsData] = await Promise.all([
        apiService.getPersonnelMapZones(),
        apiService.getPersonnelAlerts(),
        // Mock reports for now
        Promise.resolve([]),
      ]);
      
      setZones(zonesData);
      setAlerts(alertsData);
      setReports(reportsData);

      // Load users (if command)
      if (isCommand) {
        // Mock users for now - would call API in production
        setUsers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '(406) 555-0100',
            role: 'personnel',
            isVolunteer: true,
            isAdmin: false,
            isActive: true,
            twoFactorEnabled: false,
            preferences: {
              notifications: {
                emergency: true,
                weather: true,
                traffic: true,
                events: true,
                sms: false,
                email: true,
                push: true,
              },
              location: {
                shareLocation: false,
                autoLocationUpdates: false,
              },
              accessibility: {
                highContrast: false,
                largeText: false,
                voiceOver: false,
              },
            },
          },
        ]);
      }

      // Load audit logs (if command)
      if (isCommand) {
        // Mock audit logs
        setAuditLogs([
          {
            id: '1',
            userId: '1',
            userName: 'John Doe',
            action: 'CREATE_ALERT',
            entityType: 'alert',
            entityId: '1',
            timestamp: new Date(),
            details: 'Created high-priority emergency alert',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleCreateZone = async () => {
    if (!zoneName.trim()) {
      Alert.alert('Error', 'Please enter a zone name.');
      return;
    }

    try {
      await apiService.createMapZone({
        name: zoneName.trim(),
        type: zoneType,
        description: zoneDescription.trim(),
        isActive: true,
        isPublic: true,
        coordinates: [],
      });
      
      setShowCreateZoneModal(false);
      setZoneName('');
      setZoneDescription('');
      await loadAdminData();
      Alert.alert('Success', 'Zone created successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create zone.');
    }
  };

  const handleCreateAlert = async () => {
    if (!alertTitle.trim() || !alertMessage.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      await apiService.createAlert({
        title: alertTitle.trim(),
        message: alertMessage.trim(),
        type: alertType,
        priority: alertPriority,
        targetAudience: alertTargetAudience,
        isActive: true,
      });
      
      setShowCreateAlertModal(false);
      setAlertTitle('');
      setAlertMessage('');
      await loadAdminData();
      Alert.alert('Success', 'Alert created and sent.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create alert.');
    }
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Surface style={styles.statCard}>
          <Icon name="people" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>{analytics.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="notifications" size={32} color={colors.warning} />
          <Text style={styles.statNumber}>{analytics.activeAlerts}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="report-problem" size={32} color={colors.error} />
          <Text style={styles.statNumber}>{analytics.pendingReports}</Text>
          <Text style={styles.statLabel}>Pending Reports</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="search" size={32} color={colors.info} />
          <Text style={styles.statNumber}>{analytics.activeMissions}</Text>
          <Text style={styles.statLabel}>Active Missions</Text>
        </Surface>
      </View>

      {/* Activity Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Activity (24h)</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Icon name="notifications-active" size={20} color={colors.textSecondary} />
              <Text style={styles.activityText}>{analytics.alertsLast24h} Alerts</Text>
            </View>
            <View style={styles.activityItem}>
              <Icon name="report" size={20} color={colors.textSecondary} />
              <Text style={styles.activityText}>{analytics.reportsLast24h} Reports</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="add-location"
              onPress={() => setShowCreateZoneModal(true)}
              style={styles.quickActionButton}
            >
              Create Zone
            </Button>
            <Button
              mode="contained"
              icon="notifications"
              onPress={() => setShowCreateAlertModal(true)}
              style={styles.quickActionButton}
              buttonColor={colors.warning}
            >
              Send Alert
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>User Analytics</Text>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.totalUsers}</Text>
              <Text style={styles.analyticsLabel}>Total Users</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.activeUsers}</Text>
              <Text style={styles.analyticsLabel}>Active Users</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>
                {analytics.totalUsers > 0
                  ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100)
                  : 0}%
              </Text>
              <Text style={styles.analyticsLabel}>Active Rate</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Alert Analytics</Text>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.totalAlerts}</Text>
              <Text style={styles.analyticsLabel}>Total Alerts</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.activeAlerts}</Text>
              <Text style={styles.analyticsLabel}>Active</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.alertsLast24h}</Text>
              <Text style={styles.analyticsLabel}>Last 24h</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Operational Metrics</Text>
          <View style={styles.metricsList}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Active Missions</Text>
              <Text style={styles.metricValue}>{analytics.activeMissions}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Active Call-Outs</Text>
              <Text style={styles.metricValue}>{analytics.activeCallOuts}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Active Incidents</Text>
              <Text style={styles.metricValue}>{analytics.activeIncidents}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Avg Response Time</Text>
              <Text style={styles.metricValue}>
                {analytics.averageResponseTime > 0
                  ? `${analytics.averageResponseTime} min`
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="people-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>No users found</Text>
        </View>
      ) : (
        users.map((user) => (
          <Card key={user.id} style={styles.card}>
            <Card.Content>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <Chip
                  icon={user.isActive ? 'check-circle' : 'cancel'}
                  style={[
                    styles.roleChip,
                    user.isActive ? styles.activeChip : styles.inactiveChip,
                  ]}
                  textStyle={styles.roleChipText}
                >
                  {user.role.toUpperCase()}
                </Chip>
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.userMetaText}>Phone: {user.phone || 'N/A'}</Text>
                {user.unit && <Text style={styles.userMetaText}>Unit: {user.unit}</Text>}
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  const renderZones = () => (
    <View style={styles.tabContent}>
      {zones.map((zone) => (
        <Card key={zone.id} style={styles.card}>
          <Card.Content>
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneTitle}>{zone.name}</Text>
              <Chip
                icon={zone.isActive ? 'check-circle' : 'cancel'}
                style={[
                  styles.statusChip,
                  zone.isActive ? styles.activeChip : styles.inactiveChip,
                ]}
                textStyle={styles.statusChipText}
              >
                {zone.isActive ? 'Active' : 'Inactive'}
              </Chip>
            </View>
            <Text style={styles.zoneDescription}>{zone.description}</Text>
            <Text style={styles.zoneType}>Type: {zone.type.toUpperCase()}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.tabContent}>
      {alerts.map((alert) => (
        <Card key={alert.id} style={styles.card}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Chip
                style={[
                  styles.priorityChip,
                  alert.priority === 'high'
                    ? styles.priorityHigh
                    : alert.priority === 'medium'
                    ? styles.priorityMedium
                    : styles.priorityLow,
                ]}
                textStyle={styles.priorityChipText}
              >
                {alert.priority.toUpperCase()}
              </Chip>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertMeta}>
              Type: {alert.type} | Target: {alert.targetAudience || 'all'}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderReports = () => (
    <View style={styles.tabContent}>
      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="report-problem" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>No reports</Text>
        </View>
      ) : (
        reports.map((report) => (
          <Card key={report.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
              <Text style={styles.reportStatus}>Status: {report.status}</Text>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  const renderAuditLogs = () => (
    <View style={styles.tabContent}>
      {auditLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="history" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>No audit logs</Text>
        </View>
      ) : (
        auditLogs.map((log) => (
          <Card key={log.id} style={styles.card}>
            <Card.Content>
              <View style={styles.auditHeader}>
                <Text style={styles.auditAction}>{log.action}</Text>
                <Text style={styles.auditTime}>
                  {new Date(log.timestamp).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.auditUser}>{log.userName}</Text>
              {log.details && <Text style={styles.auditDetails}>{log.details}</Text>}
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  const tabs = [
    {id: 'overview', label: 'Overview', icon: 'dashboard'},
    {id: 'analytics', label: 'Analytics', icon: 'analytics'},
    ...(isCommand ? [{id: 'users', label: 'Users', icon: 'people'}] : []),
    {id: 'zones', label: 'Zones', icon: 'map'},
    {id: 'alerts', label: 'Alerts', icon: 'notifications'},
    {id: 'reports', label: 'Reports', icon: 'report-problem'},
    ...(isCommand ? [{id: 'audit', label: 'Audit Log', icon: 'history'}] : []),
  ];

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {isCommand ? 'Command Center' : 'Administration'}
        </Text>
      </Surface>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabNavigation}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'analytics' && renderAnalytics()}
        {selectedTab === 'users' && renderUsers()}
        {selectedTab === 'zones' && renderZones()}
        {selectedTab === 'alerts' && renderAlerts()}
        {selectedTab === 'reports' && renderReports()}
        {selectedTab === 'audit' && renderAuditLogs()}
      </ScrollView>

      {/* Create Zone Modal */}
      <Modal
        visible={showCreateZoneModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <Surface style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Zone</Text>
            <TouchableOpacity onPress={() => setShowCreateZoneModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </Surface>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Zone Name"
              value={zoneName}
              onChangeText={setZoneName}
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Description"
              value={zoneDescription}
              onChangeText={setZoneDescription}
              mode="outlined"
              multiline
              style={styles.modalInput}
            />
          </ScrollView>

          <Surface style={styles.modalActions}>
            <Button onPress={() => setShowCreateZoneModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCreateZone}>
              Create
            </Button>
          </Surface>
        </View>
      </Modal>

      {/* Create Alert Modal */}
      <Modal
        visible={showCreateAlertModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <Surface style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Alert</Text>
            <TouchableOpacity onPress={() => setShowCreateAlertModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </Surface>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Title"
              value={alertTitle}
              onChangeText={setAlertTitle}
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Message"
              value={alertMessage}
              onChangeText={setAlertMessage}
              mode="outlined"
              multiline
              style={styles.modalInput}
            />
          </ScrollView>

          <Surface style={styles.modalActions}>
            <Button onPress={() => setShowCreateAlertModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleCreateAlert} buttonColor={colors.warning}>
              Send Alert
            </Button>
          </Surface>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  tabScrollView: {
    maxHeight: 60,
  },
  tabNavigation: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
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
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  statNumber: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
  },
  activityText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
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
    padding: spacing.md,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    ...typography.h3,
    color: colors.primary,
  },
  analyticsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  metricsList: {
    marginTop: spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  metricLabel: {
    ...typography.body,
    color: colors.text,
  },
  metricValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h4,
    color: colors.text,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  userMeta: {
    marginTop: spacing.sm,
  },
  userMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  roleChip: {
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  activeChip: {
    backgroundColor: colors.success,
  },
  inactiveChip: {
    backgroundColor: colors.textSecondary,
  },
  roleChipText: {
    color: colors.surface,
    fontSize: 11,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 11,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  zoneTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  zoneDescription: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  zoneType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  alertMessage: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  alertMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priorityChip: {
    height: 24,
  },
  priorityHigh: {
    backgroundColor: colors.error,
  },
  priorityMedium: {
    backgroundColor: colors.warning,
  },
  priorityLow: {
    backgroundColor: colors.info,
  },
  priorityChipText: {
    color: colors.surface,
    fontSize: 10,
  },
  reportTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reportDescription: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reportStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  auditAction: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  auditTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  auditUser: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  auditDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
});

export default AdminScreen;

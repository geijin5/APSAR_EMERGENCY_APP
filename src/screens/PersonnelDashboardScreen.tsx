import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  ActivityIndicator,
  Surface,
  Chip,
  Button,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';
import {NavigationParams, Alert, SARMission, Incident, CallOut} from '../types/index';

type PersonnelDashboardNavigationProp = StackNavigationProp<
  NavigationParams,
  'PersonnelDashboard'
>;

interface DashboardData {
  activeIncidents: Incident[];
  activeSARMissions: SARMission[];
  activeCallOuts: CallOut[];
  recentAlerts: Alert[];
  unreadChatCount: number;
  pendingCallOuts: number;
}

const PersonnelDashboardScreen: React.FC = () => {
  const navigation = useNavigation<PersonnelDashboardNavigationProp>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeIncidents: [],
    activeSARMissions: [],
    activeCallOuts: [],
    recentAlerts: [],
    unreadChatCount: 0,
    pendingCallOuts: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPersonnelDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Personnel'}</Text>
            {user?.unit && (
              <Chip icon="account-group" style={styles.unitChip} textStyle={styles.unitChipText}>
                {user.unit}
              </Chip>
            )}
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            <Icon name="account-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Chat' as any)}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="message" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>Chat</Text>
              {dashboardData.unreadChatCount > 0 && (
                <Chip
                  style={styles.badge}
                  textStyle={styles.badgeText}
                  compact
                >
                  {dashboardData.unreadChatCount}
                </Chip>
              )}
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('CallOuts' as any)}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="phone-in-talk" size={32} color={colors.secondary} />
              <Text style={styles.quickActionText}>Call-Outs</Text>
              {dashboardData.pendingCallOuts > 0 && (
                <Chip
                  style={[styles.badge, styles.badgeWarning]}
                  textStyle={styles.badgeText}
                  compact
                >
                  {dashboardData.pendingCallOuts}
                </Chip>
              )}
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('SARMissions' as any)}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="search" size={32} color={colors.info} />
              <Text style={styles.quickActionText}>SAR Missions</Text>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Incidents' as any)}
          >
            <Surface style={styles.quickActionSurface}>
              <Icon name="warning" size={32} color={colors.error} />
              <Text style={styles.quickActionText}>Incidents</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Call-Outs */}
      {dashboardData.activeCallOuts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Call-Outs</Text>
            <Button
              mode="text"
              compact
              onPress={() => navigation.navigate('CallOuts' as any)}
            >
              View All
            </Button>
          </View>
          {dashboardData.activeCallOuts.slice(0, 3).map((callOut) => (
            <Card
              key={callOut.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('CallOutDetails' as any, {
                  callOutId: callOut.id,
                })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>{callOut.title}</Title>
                  <Chip
                    icon="phone-in-talk"
                    style={styles.statusChip}
                    textStyle={styles.statusChipText}
                  >
                    Active
                  </Chip>
                </View>
                <Paragraph numberOfLines={2}>{callOut.message}</Paragraph>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    {callOut.responseCount || 0} responses
                  </Text>
                  <Text style={styles.cardFooterText}>
                    {new Date(callOut.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Active SAR Missions */}
      {dashboardData.activeSARMissions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active SAR Missions</Text>
            <Button
              mode="text"
              compact
              onPress={() => navigation.navigate('SARMissions' as any)}
            >
              View All
            </Button>
          </View>
          {dashboardData.activeSARMissions.slice(0, 3).map((mission) => (
            <Card
              key={mission.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('SARMissionDetails' as any, {
                  missionId: mission.id,
                })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>{mission.name}</Title>
                  <Chip
                    icon="search"
                    style={[
                      styles.statusChip,
                      mission.missionType === 'active'
                        ? styles.statusChipActive
                        : styles.statusChipTraining,
                    ]}
                    textStyle={styles.statusChipText}
                  >
                    {mission.missionType === 'active' ? 'Active' : 'Training'}
                  </Chip>
                </View>
                <Paragraph numberOfLines={2}>{mission.description}</Paragraph>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    Status: {mission.status}
                  </Text>
                  {mission.startedAt && (
                    <Text style={styles.cardFooterText}>
                      Started: {new Date(mission.startedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Active Incidents */}
      {dashboardData.activeIncidents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Incidents</Text>
            <Button
              mode="text"
              compact
              onPress={() => navigation.navigate('Incidents' as any)}
            >
              View All
            </Button>
          </View>
          {dashboardData.activeIncidents.slice(0, 3).map((incident) => (
            <Card
              key={incident.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('IncidentDetails' as any, {
                  incidentId: incident.id,
                })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>{incident.title}</Title>
                  <Chip
                    icon="warning"
                    style={styles.statusChip}
                    textStyle={styles.statusChipText}
                  >
                    {incident.status}
                  </Chip>
                </View>
                <Paragraph numberOfLines={2}>{incident.description}</Paragraph>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    Type: {incident.type}
                  </Text>
                  <Text style={styles.cardFooterText}>
                    Started: {new Date(incident.startedAt).toLocaleDateString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Recent Alerts */}
      {dashboardData.recentAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <Button
              mode="text"
              compact
              onPress={() => navigation.navigate('Alerts' as any)}
            >
              View All
            </Button>
          </View>
          {dashboardData.recentAlerts.slice(0, 3).map((alert) => (
            <Card
              key={alert.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('AlertDetails' as any, {
                  alertId: alert.id,
                })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>{alert.title}</Title>
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
                    {alert.priority}
                  </Chip>
                </View>
                <Paragraph numberOfLines={2}>{alert.message}</Paragraph>
                <Text style={styles.cardFooterText}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Empty State */}
      {dashboardData.activeIncidents.length === 0 &&
        dashboardData.activeSARMissions.length === 0 &&
        dashboardData.activeCallOuts.length === 0 &&
        dashboardData.recentAlerts.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No active items</Text>
            <Text style={styles.emptyStateSubtext}>
              All systems operational. Check back later for updates.
            </Text>
          </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    ...shadows.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  userName: {
    ...typography.h3,
    color: colors.surface,
    marginTop: spacing.xs,
  },
  unitChip: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  unitChipText: {
    color: colors.primary,
    fontSize: 12,
  },
  profileButton: {
    padding: spacing.xs,
  },
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  quickActionSurface: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  quickActionText: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    minWidth: 24,
    height: 24,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h4,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    backgroundColor: colors.info,
  },
  statusChipActive: {
    backgroundColor: colors.error,
  },
  statusChipTraining: {
    backgroundColor: colors.info,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 10,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  cardFooterText: {
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
  emptyStateSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default PersonnelDashboardScreen;


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
  Chip,
  Surface,
  Divider,
  List,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';
import {NavigationParams, Incident, IncidentResource, ResourceStatus} from '../types/index';

type IncidentDetailsNavigationProp = StackNavigationProp<
  NavigationParams,
  'IncidentDetails'
>;
type IncidentDetailsRouteProp = {
  key: string;
  name: 'IncidentDetails';
  params: {incidentId: string};
};

const IncidentDetailsScreen: React.FC = () => {
  const navigation = useNavigation<IncidentDetailsNavigationProp>();
  const route = useRoute<IncidentDetailsRouteProp>();
  const {user, isCommand} = useAuth();
  const {incidentId} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [resources, setResources] = useState<IncidentResource[]>([]);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    try {
      setLoading(true);
      const incidentData = await apiService.getIncident(incidentId);
      setIncident(incidentData);

      const resourcesData = await apiService.getIncidentResources(incidentId);
      setResources(resourcesData);
    } catch (error) {
      console.error('Failed to load incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncident();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return colors.error;
      case 'resolved':
        return colors.success;
      case 'cancelled':
        return colors.textSecondary;
      default:
        return colors.info;
    }
  };

  const getResourceStatusColor = (status: ResourceStatus): string => {
    switch (status) {
      case 'on_scene':
        return colors.success;
      case 'en_route':
        return colors.warning;
      case 'assigned':
        return colors.info;
      case 'unavailable':
        return colors.textSecondary;
      default:
        return colors.lightGray;
    }
  };

  const getResourceIcon = (type: string): string => {
    switch (type) {
      case 'personnel':
        return 'account';
      case 'equipment':
        return 'toolbox';
      case 'vehicle':
        return 'car';
      default:
        return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Incident not found</Text>
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
      {/* Header Card */}
      <Surface style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Title style={styles.title}>{incident.title}</Title>
            <Chip
              icon="warning"
              style={[styles.statusChip, {backgroundColor: getStatusColor(incident.status)}]}
              textStyle={styles.statusChipText}
            >
              {incident.status.toUpperCase()}
            </Chip>
          </View>
        </View>

        {incident.description && (
          <Paragraph style={styles.description}>{incident.description}</Paragraph>
        )}

        <View style={styles.metaInfo}>
          <View style={styles.metaRow}>
            <Icon name="category" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>Type: {incident.type}</Text>
          </View>
          {incident.incidentCommanderName && (
            <View style={styles.metaRow}>
              <Icon name="account-star" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                IC: {incident.incidentCommanderName}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Icon name="play-circle" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              Started: {new Date(incident.startedAt).toLocaleString()}
            </Text>
          </View>
          {incident.resolvedAt && (
            <View style={styles.metaRow}>
              <Icon name="check-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                Resolved: {new Date(incident.resolvedAt).toLocaleString()}
              </Text>
            </View>
          )}
          {incident.location && (
            <View style={styles.metaRow}>
              <Icon name="map-marker" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                Location: {incident.location.latitude.toFixed(4)},{' '}
                {incident.location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      </Surface>

      {/* Resources Card */}
      <Card style={styles.resourcesCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            Resources ({resources.length})
          </Text>
          <Divider style={styles.divider} />

          {resources.length === 0 ? (
            <View style={styles.emptyResources}>
              <Icon name="account-group-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyResourcesText}>No resources assigned</Text>
            </View>
          ) : (
            resources.map((resource, index) => (
              <View key={resource.id}>
                <List.Item
                  title={resource.resourceName}
                  description={
                    resource.assignedAt
                      ? `Assigned: ${new Date(resource.assignedAt).toLocaleString()}`
                      : 'Not yet assigned'
                  }
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={getResourceIcon(resource.resourceType)}
                      color={colors.textSecondary}
                    />
                  )}
                  right={(props) => (
                    <Chip
                      style={[
                        styles.resourceStatusChip,
                        {backgroundColor: getResourceStatusColor(resource.status)},
                      ]}
                      textStyle={styles.resourceStatusChipText}
                    >
                      {resource.status.replace('_', ' ')}
                    </Chip>
                  )}
                  style={styles.resourceItem}
                />
                {resource.notes && (
                  <Text style={styles.resourceNotes} numberOfLines={2}>
                    {resource.notes}
                  </Text>
                )}
                {index < resources.length - 1 && <Divider style={styles.resourceDivider} />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      {incident.status === 'active' && (isCommand || user?.role === 'personnel') && (
        <Surface style={styles.actionsCard}>
          <Button
            mode="contained"
            icon="map"
            onPress={() => {
              // TODO: Navigate to incident map view
              console.log('View map');
            }}
            style={styles.actionButton}
          >
            View on Map
          </Button>
          {isCommand && (
            <Button
              mode="outlined"
              icon="account-plus"
              onPress={() => {
                // TODO: Add resource to incident
                console.log('Add resource');
              }}
              style={styles.actionButton}
            >
              Add Resource
            </Button>
          )}
        </Surface>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  headerCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    ...typography.body,
    marginBottom: spacing.md,
    color: colors.text,
  },
  metaInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  resourcesCard: {
    margin: spacing.md,
    marginTop: 0,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  divider: {
    marginBottom: spacing.md,
  },
  emptyResources: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyResourcesText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resourceItem: {
    paddingVertical: spacing.sm,
  },
  resourceStatusChip: {
    height: 24,
  },
  resourceStatusChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  resourceNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xl + 16,
    marginBottom: spacing.xs,
  },
  resourceDivider: {
    marginLeft: spacing.xl + 16,
  },
  actionsCard: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});

export default IncidentDetailsScreen;


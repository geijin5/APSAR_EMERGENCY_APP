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
  Button,
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
import {NavigationParams, SARMission, SARMissionArea} from '../types/index';

type SARMissionDetailsNavigationProp = StackNavigationProp<
  NavigationParams,
  'SARMissionDetails'
>;
type SARMissionDetailsRouteProp = {
  key: string;
  name: 'SARMissionDetails';
  params: {missionId: string};
};

const SARMissionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<SARMissionDetailsNavigationProp>();
  const route = useRoute<SARMissionDetailsRouteProp>();
  const {user, isCommand} = useAuth();
  const {missionId} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mission, setMission] = useState<SARMission | null>(null);
  const [areas, setAreas] = useState<SARMissionArea[]>([]);

  useEffect(() => {
    loadMission();
  }, [missionId]);

  const loadMission = async () => {
    try {
      setLoading(true);
      const missionData = await apiService.getSARMission(missionId);
      setMission(missionData);

      const areasData = await apiService.getSARMissionAreas(missionId);
      setAreas(areasData);
    } catch (error) {
      console.error('Failed to load SAR mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMission();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return colors.error;
      case 'planning':
        return colors.warning;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.textSecondary;
      default:
        return colors.info;
    }
  };

  const getAreaStatusColor = (status: string): string => {
    switch (status) {
      case 'searching':
        return colors.warning;
      case 'cleared':
        return colors.success;
      case 'completed':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Mission not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
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
            <Title style={styles.title}>{mission.name}</Title>
            <Chip
              icon={mission.missionType === 'active' ? 'alert-circle' : 'school'}
              style={[
                styles.typeChip,
                mission.missionType === 'active'
                  ? styles.typeChipActive
                  : styles.typeChipTraining,
              ]}
              textStyle={styles.typeChipText}
            >
              {mission.missionType === 'active' ? 'Active' : 'Training'}
            </Chip>
          </View>
          <Chip
            icon="flag"
            style={[styles.statusChip, {backgroundColor: getStatusColor(mission.status)}]}
            textStyle={styles.statusChipText}
          >
            {mission.status.toUpperCase()}
          </Chip>
        </View>

        {mission.description && (
          <Paragraph style={styles.description}>{mission.description}</Paragraph>
        )}

        <View style={styles.metaInfo}>
          {mission.incidentCommanderName && (
            <View style={styles.metaRow}>
              <Icon name="account-star" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                Incident Commander: {mission.incidentCommanderName}
              </Text>
            </View>
          )}
          {mission.startedAt && (
            <View style={styles.metaRow}>
              <Icon name="play-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                Started: {new Date(mission.startedAt).toLocaleString()}
              </Text>
            </View>
          )}
          {mission.completedAt && (
            <View style={styles.metaRow}>
              <Icon name="check-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                Completed: {new Date(mission.completedAt).toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Icon name="access-time" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              Created: {new Date(mission.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {mission.isPublicVisible && (
          <Chip
            icon="eye"
            style={styles.publicChip}
            textStyle={styles.publicChipText}
          >
            Visible to Public
          </Chip>
        )}

        {mission.publicMessage && (
          <Surface style={styles.publicMessageCard}>
            <Text style={styles.publicMessageTitle}>Public Message</Text>
            <Text style={styles.publicMessageText}>{mission.publicMessage}</Text>
          </Surface>
        )}
      </Surface>

      {/* Mission Areas */}
      <Card style={styles.areasCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Search Areas ({areas.length})</Text>
            {(isCommand || user?.role === 'personnel') && mission.status !== 'completed' && (
              <Button
                mode="text"
                compact
                icon="plus"
                onPress={() => {
                  // TODO: Navigate to add area screen
                  console.log('Add area');
                }}
              >
                Add Area
              </Button>
            )}
          </View>
          <Divider style={styles.divider} />

          {areas.length === 0 ? (
            <View style={styles.emptyAreas}>
              <Icon name="map-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyAreasText}>No areas assigned yet</Text>
            </View>
          ) : (
            areas.map((area, index) => (
              <View key={area.id}>
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to area details or map
                    console.log('Area details', area.id);
                  }}
                >
                  <List.Item
                    title={area.name}
                    description={
                      area.assignedToName
                        ? `Assigned to: ${area.assignedToName}`
                        : 'Unassigned'
                    }
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon="map"
                        color={getAreaStatusColor(area.status)}
                      />
                    )}
                    right={(props) => (
                      <Chip
                        style={[
                          styles.areaStatusChip,
                          {backgroundColor: getAreaStatusColor(area.status)},
                        ]}
                        textStyle={styles.areaStatusChipText}
                      >
                        {area.status}
                      </Chip>
                    )}
                    style={styles.areaItem}
                  />
                  {area.notes && (
                    <Text style={styles.areaNotes} numberOfLines={2}>
                      {area.notes}
                    </Text>
                  )}
                </TouchableOpacity>
                {index < areas.length - 1 && <Divider style={styles.areaDivider} />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      {mission.status !== 'completed' && (isCommand || user?.role === 'personnel') && (
        <Surface style={styles.actionsCard}>
          <Button
            mode="contained"
            icon="map"
            onPress={() => {
              // TODO: Navigate to mission map view
              console.log('View map');
            }}
            style={styles.actionButton}
          >
            View on Map
          </Button>
          {isCommand && mission.status === 'active' && (
            <Button
              mode="outlined"
              icon="flag"
              onPress={() => {
                // TODO: Update mission status
                console.log('Update status');
              }}
              style={styles.actionButton}
            >
              Update Status
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
  typeChip: {
    height: 28,
    marginRight: spacing.xs,
  },
  typeChipActive: {
    backgroundColor: colors.error,
  },
  typeChipTraining: {
    backgroundColor: colors.info,
  },
  typeChipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: 'bold',
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
  publicChip: {
    marginTop: spacing.md,
    backgroundColor: colors.lightGray,
    alignSelf: 'flex-start',
  },
  publicChipText: {
    color: colors.text,
    fontSize: 11,
  },
  publicMessageCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
  },
  publicMessageTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  publicMessageText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  areasCard: {
    margin: spacing.md,
    marginTop: 0,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  divider: {
    marginBottom: spacing.md,
  },
  emptyAreas: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyAreasText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  areaItem: {
    paddingVertical: spacing.sm,
  },
  areaStatusChip: {
    height: 24,
  },
  areaStatusChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  areaNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xl + 16,
    marginBottom: spacing.xs,
  },
  areaDivider: {
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

export default SARMissionDetailsScreen;


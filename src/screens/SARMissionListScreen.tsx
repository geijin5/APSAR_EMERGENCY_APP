import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
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
  Button,
  FAB,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';
import {NavigationParams, SARMission} from '../types/index';

type SARMissionListNavigationProp = StackNavigationProp<
  NavigationParams,
  'SARMissions'
>;

const SARMissionListScreen: React.FC = () => {
  const navigation = useNavigation<SARMissionListNavigationProp>();
  const {user, isCommand} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [missions, setMissions] = useState<SARMission[]>([]);
  const [filter, setFilter] = useState<
    'all' | 'active' | 'training' | 'completed'
  >('all');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSARMissions();
      setMissions(data);
    } catch (error) {
      console.error('Failed to load SAR missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMissions();
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

  const filteredMissions = missions.filter((mission) => {
    if (filter === 'active') return mission.status === 'active';
    if (filter === 'training')
      return mission.missionType === 'training' && mission.status !== 'completed';
    if (filter === 'completed')
      return mission.status === 'completed' || mission.status === 'cancelled';
    return true;
  });

  const renderMission = ({item: mission}: {item: SARMission}) => {
    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate('SARMissionDetails' as any, {
            missionId: mission.id,
          })
        }
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Title style={styles.cardTitle}>{mission.name}</Title>
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
              style={[
                styles.statusChip,
                {backgroundColor: getStatusColor(mission.status)},
              ]}
              textStyle={styles.statusChipText}
            >
              {mission.status.toUpperCase()}
            </Chip>
          </View>

          {mission.description && (
            <Paragraph numberOfLines={2} style={styles.cardDescription}>
              {mission.description}
            </Paragraph>
          )}

          <View style={styles.cardInfo}>
            {mission.incidentCommanderName && (
              <View style={styles.cardInfoRow}>
                <Icon name="account-star" size={16} color={colors.textSecondary} />
                <Text style={styles.cardInfoText}>
                  IC: {mission.incidentCommanderName}
                </Text>
              </View>
            )}
            {mission.startedAt && (
              <View style={styles.cardInfoRow}>
                <Icon name="play-circle" size={16} color={colors.textSecondary} />
                <Text style={styles.cardInfoText}>
                  Started: {new Date(mission.startedAt).toLocaleString()}
                </Text>
              </View>
            )}
            {mission.areas && mission.areas.length > 0 && (
              <View style={styles.cardInfoRow}>
                <Icon name="map" size={16} color={colors.textSecondary} />
                <Text style={styles.cardInfoText}>
                  {mission.areas.length} area{mission.areas.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {mission.isPublicVisible && (
            <Chip
              icon="eye"
              style={styles.publicChip}
              textStyle={styles.publicChipText}
            >
              Public Visible
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <Surface style={styles.filterContainer}>
        <Button
          mode={filter === 'all' ? 'contained' : 'outlined'}
          onPress={() => setFilter('all')}
          style={styles.filterButton}
          compact
        >
          All
        </Button>
        <Button
          mode={filter === 'active' ? 'contained' : 'outlined'}
          onPress={() => setFilter('active')}
          style={styles.filterButton}
          compact
        >
          Active
        </Button>
        <Button
          mode={filter === 'training' ? 'contained' : 'outlined'}
          onPress={() => setFilter('training')}
          style={styles.filterButton}
          compact
        >
          Training
        </Button>
        <Button
          mode={filter === 'completed' ? 'contained' : 'outlined'}
          onPress={() => setFilter('completed')}
          style={styles.filterButton}
          compact
        >
          Completed
        </Button>
      </Surface>

      {filteredMissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search-off" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            {filter === 'all' ? 'No SAR missions' : `No ${filter} missions`}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {filter === 'active'
              ? 'No active missions at this time'
              : 'No missions match this filter'}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredMissions}
            renderItem={renderMission}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
          {/* Only personnel+ can create training missions, command can create active */}
          {(isCommand || user?.role === 'personnel') && (
            <FAB
              icon="plus"
              style={styles.fab}
              onPress={() => {
                // TODO: Navigate to create mission screen
                console.log('Create mission');
              }}
            />
          )}
        </>
      )}
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    elevation: 2,
  },
  filterButton: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl + 70, // Space for FAB
  },
  card: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.h4,
    flex: 1,
    marginRight: spacing.sm,
  },
  typeChip: {
    height: 24,
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDescription: {
    ...typography.body,
    marginBottom: spacing.md,
    color: colors.text,
  },
  cardInfo: {
    marginBottom: spacing.sm,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  publicChip: {
    marginTop: spacing.sm,
    backgroundColor: colors.lightGray,
    alignSelf: 'flex-start',
  },
  publicChipText: {
    color: colors.text,
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default SARMissionListScreen;


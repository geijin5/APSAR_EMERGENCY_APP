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
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';
import {NavigationParams, Incident} from '../types/index';

type IncidentListNavigationProp = StackNavigationProp<
  NavigationParams,
  'Incidents'
>;

const IncidentListScreen: React.FC = () => {
  const navigation = useNavigation<IncidentListNavigationProp>();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
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

  const filteredIncidents = incidents.filter((incident) => {
    if (filter === 'active') return incident.status === 'active';
    if (filter === 'resolved')
      return incident.status === 'resolved' || incident.status === 'cancelled';
    return true;
  });

  const renderIncident = ({item: incident}: {item: Incident}) => {
    const resourceCount = incident.resources?.length || 0;

    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate('IncidentDetails' as any, {
            incidentId: incident.id,
          })
        }
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Title style={styles.cardTitle}>{incident.title}</Title>
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
            <Paragraph numberOfLines={2} style={styles.cardDescription}>
              {incident.description}
            </Paragraph>
          )}

          <View style={styles.cardInfo}>
            <View style={styles.cardInfoRow}>
              <Icon name="category" size={16} color={colors.textSecondary} />
              <Text style={styles.cardInfoText}>Type: {incident.type}</Text>
            </View>
            {incident.incidentCommanderName && (
              <View style={styles.cardInfoRow}>
                <Icon name="account-star" size={16} color={colors.textSecondary} />
                <Text style={styles.cardInfoText}>
                  IC: {incident.incidentCommanderName}
                </Text>
              </View>
            )}
            <View style={styles.cardInfoRow}>
              <Icon name="play-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.cardInfoText}>
                Started: {new Date(incident.startedAt).toLocaleString()}
              </Text>
            </View>
            {resourceCount > 0 && (
              <View style={styles.cardInfoRow}>
                <Icon name="account-group" size={16} color={colors.textSecondary} />
                <Text style={styles.cardInfoText}>
                  {resourceCount} resource{resourceCount > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
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
          mode={filter === 'resolved' ? 'contained' : 'outlined'}
          onPress={() => setFilter('resolved')}
          style={styles.filterButton}
          compact
        >
          Resolved
        </Button>
      </Surface>

      {filteredIncidents.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            {filter === 'all' ? 'No incidents' : `No ${filter} incidents`}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {filter === 'active'
              ? 'No active incidents at this time'
              : 'No incidents match this filter'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredIncidents}
          renderItem={renderIncident}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
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
    padding: spacing.md,
    elevation: 2,
  },
  filterButton: {
    marginRight: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
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
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h4,
    flex: 1,
    marginRight: spacing.sm,
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
});

export default IncidentListScreen;


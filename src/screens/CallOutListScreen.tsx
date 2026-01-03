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
import {NavigationParams, CallOut} from '../types/index';

type CallOutListNavigationProp = StackNavigationProp<NavigationParams, 'CallOuts'>;

const CallOutListScreen: React.FC = () => {
  const navigation = useNavigation<CallOutListNavigationProp>();
  const {user, isCommand} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [callOuts, setCallOuts] = useState<CallOut[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadCallOuts();
  }, []);

  const loadCallOuts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCallOuts();
      setCallOuts(data);
    } catch (error) {
      console.error('Failed to load call-outs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCallOuts();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return colors.error;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.textSecondary;
      default:
        return colors.info;
    }
  };

  const getResponseStatus = (callOut: CallOut): {
    status: string;
    color: string;
  } | null => {
    if (!user) return null;
    const response = callOut.responses?.find((r) => r.userId === user.id);
    if (!response) return {status: 'No Response', color: colors.textSecondary};
    return {
      status: response.status.replace('_', ' ').toUpperCase(),
      color:
        response.status === 'available'
          ? colors.success
          : response.status === 'en_route'
          ? colors.warning
          : colors.textSecondary,
    };
  };

  const filteredCallOuts = callOuts.filter((callOut) => {
    if (filter === 'active') return callOut.status === 'active';
    if (filter === 'completed')
      return callOut.status === 'completed' || callOut.status === 'cancelled';
    return true;
  });

  const renderCallOut = ({item: callOut}: {item: CallOut}) => {
    const responseStatus = getResponseStatus(callOut);
    const isExpired =
      callOut.expiresAt && new Date(callOut.expiresAt) < new Date();

    return (
      <Card
        style={[styles.card, isExpired && styles.cardExpired]}
        onPress={() =>
          navigation.navigate('CallOutDetails' as any, {
            callOutId: callOut.id,
          })
        }
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Title style={styles.cardTitle}>{callOut.title}</Title>
              <Chip
                icon="phone-in-talk"
                style={[styles.statusChip, {backgroundColor: getStatusColor(callOut.status)}]}
                textStyle={styles.statusChipText}
              >
                {callOut.status.toUpperCase()}
              </Chip>
            </View>
          </View>

          <Paragraph numberOfLines={2} style={styles.cardMessage}>
            {callOut.message}
          </Paragraph>

          <View style={styles.cardInfo}>
            <View style={styles.cardInfoRow}>
              <Icon name="people" size={16} color={colors.textSecondary} />
              <Text style={styles.cardInfoText}>
                {callOut.responseCount || 0} responses
              </Text>
            </View>
            <View style={styles.cardInfoRow}>
              <Icon name="access-time" size={16} color={colors.textSecondary} />
              <Text style={styles.cardInfoText}>
                {new Date(callOut.createdAt).toLocaleString()}
              </Text>
            </View>
            {callOut.expiresAt && (
              <View style={styles.cardInfoRow}>
                <Icon
                  name={isExpired ? 'schedule' : 'timer'}
                  size={16}
                  color={isExpired ? colors.error : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.cardInfoText,
                    isExpired && styles.cardInfoTextExpired,
                  ]}
                >
                  {isExpired
                    ? 'Expired'
                    : `Expires: ${new Date(callOut.expiresAt).toLocaleString()}`}
                </Text>
              </View>
            )}
          </View>

          {responseStatus && (
            <View style={styles.responseStatus}>
              <Chip
                icon="check-circle"
                style={[
                  styles.responseChip,
                  {backgroundColor: responseStatus.color},
                ]}
                textStyle={styles.responseChipText}
              >
                Your Response: {responseStatus.status}
              </Chip>
            </View>
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
          mode={filter === 'completed' ? 'contained' : 'outlined'}
          onPress={() => setFilter('completed')}
          style={styles.filterButton}
          compact
        >
          Completed
        </Button>
      </Surface>

      {filteredCallOuts.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="phone-disabled" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            {filter === 'all' ? 'No call-outs' : `No ${filter} call-outs`}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {filter === 'active'
              ? 'Check back later for new call-outs'
              : 'No call-outs match this filter'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCallOuts}
          renderItem={renderCallOut}
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
  cardExpired: {
    opacity: 0.6,
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
  cardMessage: {
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
  cardInfoTextExpired: {
    color: colors.error,
  },
  responseStatus: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  responseChip: {
    height: 28,
  },
  responseChipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '600',
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

export default CallOutListScreen;


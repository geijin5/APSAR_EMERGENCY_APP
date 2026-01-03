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
  Chip,
  FAB,
  Searchbar,
  ActivityIndicator,
  Menu,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../services/ApiService';
import {Checklist, ChecklistStatus, ChecklistType} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';

const ChecklistListScreen: React.FC = () => {
  const navigation = useNavigation();
  const {isOfficer, isAdmin, user} = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  useEffect(() => {
    loadChecklists();
  }, [filterStatus, filterType]);

  const loadChecklists = async () => {
    try {
      const filters: any = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (filterType !== 'all') {
        filters.type = filterType;
      }
      // Members only see their own checklists
      if (!isOfficer && !isAdmin && user) {
        filters.assignedTo = user.id;
      }
      const data = await apiService.getChecklists(filters);
      setChecklists(data);
    } catch (error) {
      console.error('Failed to load checklists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChecklists();
  };

  const getStatusColor = (status: ChecklistStatus): string => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in_progress':
        return colors.info;
      case 'not_started':
        return colors.textSecondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const statusOptions = [
    {label: 'All Statuses', value: 'all'},
    {label: 'Not Started', value: 'not_started'},
    {label: 'In Progress', value: 'in_progress'},
    {label: 'Completed', value: 'completed'},
    {label: 'Cancelled', value: 'cancelled'},
  ];

  const typeOptions = [
    {label: 'All Types', value: 'all'},
    {label: 'Callout', value: 'callout'},
    {label: 'Vehicle', value: 'vehicle'},
    {label: 'Equipment', value: 'equipment'},
    {label: 'Training', value: 'training'},
    {label: 'General', value: 'general'},
  ];

  const filteredChecklists = checklists.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.templateName && item.templateName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderChecklist = ({item}: {item: Checklist}) => {
    const completedCount = item.items.filter(i => i.status === 'complete').length;
    const totalCount = item.items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ChecklistDetails', {checklistId: item.id})}
        activeOpacity={0.7}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Title style={styles.cardTitle}>{item.title}</Title>
                <Paragraph style={styles.cardSubtitle}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  {item.assignedToName && ` • ${item.assignedToName}`}
                </Paragraph>
              </View>
              <Chip
                style={[styles.statusChip, {backgroundColor: getStatusColor(item.status)}]}
                textStyle={styles.statusChipText}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {width: `${progress}%`, backgroundColor: getStatusColor(item.status)},
                  ]}
                />
              </View>
              <Paragraph style={styles.progressText}>
                {completedCount} / {totalCount} items
              </Paragraph>
            </View>

            {item.createdAt && (
              <View style={styles.dateContainer}>
                <Icon name="calendar-today" size={14} color={colors.textSecondary} />
                <Paragraph style={styles.dateText}>
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
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
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search checklists..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.filterContainer}>
        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setStatusMenuVisible(true)}
              style={styles.filterButton}
            >
              <Icon name="filter-list" size={20} color={colors.primary} />
              <Paragraph style={styles.filterText}>
                Status: {statusOptions.find(o => o.value === filterStatus)?.label}
              </Paragraph>
            </TouchableOpacity>
          }
        >
          {statusOptions.map(opt => (
            <Menu.Item
              key={opt.value}
              onPress={() => {
                setFilterStatus(opt.value);
                setStatusMenuVisible(false);
              }}
              title={opt.label}
            />
          ))}
        </Menu>

        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setTypeMenuVisible(true)}
              style={styles.filterButton}
            >
              <Icon name="category" size={20} color={colors.primary} />
              <Paragraph style={styles.filterText}>
                Type: {typeOptions.find(o => o.value === filterType)?.label}
              </Paragraph>
            </TouchableOpacity>
          }
        >
          {typeOptions.map(opt => (
            <Menu.Item
              key={opt.value}
              onPress={() => {
                setFilterType(opt.value);
                setTypeMenuVisible(false);
              }}
              title={opt.label}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filteredChecklists}
        renderItem={renderChecklist}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="checklist" size={64} color={colors.textSecondary} />
            <Paragraph style={styles.emptyText}>No checklists found</Paragraph>
          </View>
        }
      />
      {(isOfficer || isAdmin) && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="New Checklist"
          onPress={() => navigation.navigate('ChecklistTemplates')}
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
  searchContainer: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchbar: {
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    justifyContent: 'space-around',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 1,
  },
  filterText: {
    ...typography.bodySmall,
    marginLeft: spacing.xs,
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.xs / 2,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs / 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default ChecklistListScreen;



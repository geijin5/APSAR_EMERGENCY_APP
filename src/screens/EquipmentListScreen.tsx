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
import {Equipment, EquipmentCondition, EquipmentCategory} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';

const EquipmentListScreen: React.FC = () => {
  const navigation = useNavigation();
  const {isOfficer, isAdmin} = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, [filterCategory]);

  const loadEquipment = async () => {
    try {
      const filters: any = {};
      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }
      const data = await apiService.getEquipment(filters);
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEquipment();
  };

  const getConditionColor = (condition: EquipmentCondition): string => {
    switch (condition) {
      case 'ready':
        return colors.success;
      case 'needs_service':
        return colors.warning;
      case 'out_of_service':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const categories: {label: string; value: string}[] = [
    {label: 'All Categories', value: 'all'},
    {label: 'Medical', value: 'medical'},
    {label: 'Rope', value: 'rope'},
    {label: 'Comms', value: 'comms'},
    {label: 'Navigation', value: 'navigation'},
    {label: 'Safety', value: 'safety'},
    {label: 'Tools', value: 'tools'},
    {label: 'Other', value: 'other'},
  ];

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.manufacturer && item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderEquipment = ({item}: {item: Equipment}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EquipmentDetails', {equipmentId: item.id})}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Title style={styles.cardTitle}>{item.name}</Title>
              <Paragraph style={styles.cardSubtitle}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                {item.assignedToName && ` • Assigned to ${item.assignedToName}`}
              </Paragraph>
            </View>
            <Chip
              style={[styles.conditionChip, {backgroundColor: getConditionColor(item.condition)}]}
              textStyle={styles.conditionChipText}
            >
              {item.condition.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>
          {item.nextInspectionDate && (
            <View style={styles.inspectionContainer}>
              <Icon name="check-circle" size={16} color={colors.textSecondary} />
              <Paragraph style={styles.inspection}>
                Next inspection: {new Date(item.nextInspectionDate).toLocaleDateString()}
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search equipment..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              <Icon name="filter-list" size={24} color={colors.primary} />
            </TouchableOpacity>
          }
        >
          {categories.map(cat => (
            <Menu.Item
              key={cat.value}
              onPress={() => {
                setFilterCategory(cat.value);
                setMenuVisible(false);
              }}
              title={cat.label}
              titleStyle={filterCategory === cat.value ? styles.selectedFilter : undefined}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={64} color={colors.textSecondary} />
            <Paragraph style={styles.emptyText}>No equipment found</Paragraph>
          </View>
        }
      />
      {(isOfficer || isAdmin) && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Add Equipment"
          onPress={() => navigation.navigate('EquipmentDetails', {equipmentId: 'new'})}
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
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: spacing.sm,
  },
  filterButton: {
    padding: spacing.sm,
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
    marginBottom: spacing.xs,
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
  conditionChip: {
    height: 28,
  },
  conditionChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  inspectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  inspection: {
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
  selectedFilter: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default EquipmentListScreen;



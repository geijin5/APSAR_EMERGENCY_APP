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
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../services/ApiService';
import {Vehicle, VehicleStatus} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';

const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation();
  const {isOfficer, isAdmin} = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const getStatusColor = (status: VehicleStatus): string => {
    switch (status) {
      case 'ready':
        return colors.success;
      case 'in_service':
        return colors.info;
      case 'maintenance':
        return colors.warning;
      case 'out_of_service':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vehicle.make && vehicle.make.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (vehicle.model && vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderVehicle = ({item}: {item: Vehicle}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('VehicleDetails', {vehicleId: item.id})}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Title style={styles.cardTitle}>{item.unitNumber}</Title>
              <Paragraph style={styles.cardSubtitle}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                {item.make && item.model && ` • ${item.make} ${item.model}`}
              </Paragraph>
            </View>
            <Chip
              style={[styles.statusChip, {backgroundColor: getStatusColor(item.status)}]}
              textStyle={styles.statusChipText}
            >
              {item.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>
          {item.currentMileage !== undefined && (
            <View style={styles.mileageContainer}>
              <Icon name="speed" size={16} color={colors.textSecondary} />
              <Paragraph style={styles.mileage}>
                {item.currentMileage.toLocaleString()} miles
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
      <Searchbar
        placeholder="Search vehicles..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicle}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="directions-car" size={64} color={colors.textSecondary} />
            <Paragraph style={styles.emptyText}>No vehicles found</Paragraph>
          </View>
        }
      />
      {(isOfficer || isAdmin) && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Add Vehicle"
          onPress={() => navigation.navigate('VehicleDetails', {vehicleId: 'new'})}
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
  searchbar: {
    margin: spacing.md,
    marginBottom: spacing.sm,
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
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  mileageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  mileage: {
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

export default VehicleListScreen;



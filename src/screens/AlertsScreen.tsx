import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import {colors, typography, spacing} from '../utils/theme';
import {mapService} from '../services/MapService';
import {Alert as AlertType} from '../types/index';

const AlertsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedType, setSelectedType] = useState<'all' | AlertType['type']>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchQuery, selectedFilter, selectedType]);

  const loadAlerts = async () => {
    try {
      const allAlerts = mapService.getAlerts();
      setAlerts(allAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    // Filter by priority
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(alert => alert.priority === selectedFilter);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query)
      );
    }

    setFilteredAlerts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleAlertPress = (alert: AlertType) => {
    mapService.markAlertAsRead(alert.id);
    loadAlerts(); // Refresh to update read status
    navigation.navigate('AlertDetails' as any, {alertId: alert.id});
  };

  const getAlertTypeIcon = (type: AlertType['type']): string => {
    switch (type) {
      case 'emergency':
        return 'warning';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'search':
        return 'search';
      case 'weather':
        return 'cloud';
      case 'traffic':
        return 'traffic';
      case 'event':
        return 'event';
      default:
        return 'notifications';
    }
  };

  const getPriorityColor = (priority: AlertType['priority']): string => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const clearAllFilters = () => {
    setSelectedFilter('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  const markAllAsRead = () => {
    alerts.forEach(alert => {
      if (!alert.isRead) {
        mapService.markAlertAsRead(alert.id);
      }
    });
    loadAlerts();
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Emergency Alerts"
        subtitle={`${unreadCount} unread alerts`}
        showNotifications={false}
      />

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search alerts..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {/* Priority Filters */}
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'high' && styles.activeFilter]}
            onPress={() => setSelectedFilter('high')}
          >
            <Text style={[styles.filterText, selectedFilter === 'high' && styles.activeFilterText]}>
              High Priority
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'medium' && styles.activeFilter]}
            onPress={() => setSelectedFilter('medium')}
          >
            <Text style={[styles.filterText, selectedFilter === 'medium' && styles.activeFilterText]}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'low' && styles.activeFilter]}
            onPress={() => setSelectedFilter('low')}
          >
            <Text style={[styles.filterText, selectedFilter === 'low' && styles.activeFilterText]}>
              Low Priority
            </Text>
          </TouchableOpacity>

          {/* Type Filters */}
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'all' && styles.activeFilter]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterText, selectedType === 'all' && styles.activeFilterText]}>
              All Types
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'search' && styles.activeFilter]}
            onPress={() => setSelectedType('search')}
          >
            <Text style={[styles.filterText, selectedType === 'search' && styles.activeFilterText]}>
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'weather' && styles.activeFilter]}
            onPress={() => setSelectedType('weather')}
          >
            <Text style={[styles.filterText, selectedType === 'weather' && styles.activeFilterText]}>
              Weather
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'traffic' && styles.activeFilter]}
            onPress={() => setSelectedType('traffic')}
          >
            <Text style={[styles.filterText, selectedType === 'traffic' && styles.activeFilterText]}>
              Traffic
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <EmergencyButton
            title="Clear Filters"
            onPress={clearAllFilters}
            variant="secondary"
            size="small"
            style={styles.actionButton}
          />
          <EmergencyButton
            title="Mark All Read"
            onPress={markAllAsRead}
            variant="success"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Alerts List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="notifications-none" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No alerts found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery || selectedFilter !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'You\'re all caught up! No new alerts at this time.'}
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <EmergencyCard
              key={alert.id}
              title={alert.title}
              description={alert.message}
              type={alert.priority === 'high' ? 'emergency' : alert.priority === 'medium' ? 'warning' : 'info'}
              icon={getAlertTypeIcon(alert.type)}
              timestamp={alert.timestamp}
              location={alert.location ? `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}` : undefined}
              onPress={() => handleAlertPress(alert)}
              style={[
                styles.alertCard,
                alert.isRead ? styles.readAlert : undefined
              ]}
            >
              <View style={styles.alertFooter}>
                <View style={styles.alertMeta}>
                  <View style={[styles.priorityIndicator, {backgroundColor: getPriorityColor(alert.priority)}]} />
                  <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                </View>
                {alert.isRead && (
                  <Icon name="done-all" size={16} color={colors.success} />
                )}
              </View>
            </EmergencyCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  activeFilterText: {
    color: colors.surface,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  content: {
    flex: 1,
  },
  alertCard: {
    marginHorizontal: spacing.sm,
  },
  readAlert: {
    opacity: 0.7,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  alertType: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AlertsScreen;

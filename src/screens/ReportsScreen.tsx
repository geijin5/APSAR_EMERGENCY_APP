import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import StatusIndicator from '../components/StatusIndicator';
import {colors, typography, spacing, borderRadius} from '../utils/theme';
import {EmergencyReport} from '../types/index';

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    // In a real app, this would fetch from a server
    const mockReports: EmergencyReport[] = [
      {
        id: '1',
        type: 'missing_person',
        title: 'Missing Hiker - John Smith',
        description: 'Last seen on Pintler Trail near Georgetown Lake. Wearing blue jacket and hiking boots.',
        location: {latitude: 45.9231, longitude: -113.3943},
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        reporterName: 'Jane Doe',
        reporterPhone: '(406) 555-0123',
        status: 'investigating',
        priority: 'high',
      },
      {
        id: '2',
        type: 'hazard',
        title: 'Downed Tree on Highway 1',
        description: 'Large tree blocking northbound lane near mile marker 15.',
        location: {latitude: 45.9000, longitude: -113.3500},
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        reporterName: 'Mike Johnson',
        status: 'resolved',
        priority: 'medium',
      },
    ];
    setReports(mockReports);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const getReportTypeIcon = (type: EmergencyReport['type']): string => {
    switch (type) {
      case 'missing_person':
        return 'person-search';
      case 'hazard':
        return 'warning';
      case 'emergency_sighting':
        return 'visibility';
      case 'other':
        return 'report-problem';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: EmergencyReport['status']): string => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'investigating':
        return colors.info;
      case 'resolved':
        return colors.success;
      case 'false_alarm':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: EmergencyReport['priority']): string => {
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

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Emergency Reports"
        subtitle="View emergency reports and incidents"
        showEmergencyButton={true}
        onEmergencyPress={() => Alert.alert('Emergency', 'Calling 911...')}
      />

      {/* Reports List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="report-problem" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No reports</Text>
            <Text style={styles.emptyDescription}>
              There are no emergency reports at this time.
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <EmergencyCard
              key={report.id}
              title={report.title}
              description={report.description}
              type={report.priority === 'high' ? 'emergency' : report.priority === 'medium' ? 'warning' : 'info'}
              icon={getReportTypeIcon(report.type)}
              timestamp={report.timestamp}
              location={`${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}
              onPress={() => navigation.navigate('ReportDetails' as any, {reportId: report.id})}
            >
              <View style={styles.reportFooter}>
                <View style={styles.reportMeta}>
                  <StatusIndicator
                    status={report.status === 'resolved' ? 'success' : report.status === 'investigating' ? 'pending' : 'warning'}
                    label={report.status.toUpperCase()}
                    size="small"
                  />
                  <View style={[styles.priorityIndicator, {backgroundColor: getPriorityColor(report.priority)}]} />
                  <Text style={styles.reportType}>{report.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.reporterName}>
                  {report.reporterName ? `by ${report.reporterName}` : 'Anonymous'}
                </Text>
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
  content: {
    flex: 1,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  reportType: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  reporterName: {
    ...typography.caption,
    color: colors.textSecondary,
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

export default ReportsScreen;

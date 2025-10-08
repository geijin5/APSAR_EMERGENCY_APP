import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import {colors, typography, spacing} from '../utils/theme';
import {EmergencyReport} from '../types/index';

const ReportDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [report, setReport] = useState<EmergencyReport | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = () => {
    const {reportId} = route.params as {reportId: string};
    
    // In a real app, this would fetch from a server
    const mockReport: EmergencyReport = {
      id: reportId,
      type: 'missing_person',
      title: 'Missing Hiker - John Smith',
      description: 'Last seen on Pintler Trail near Georgetown Lake around 2:00 PM. Wearing blue jacket, khaki pants, and hiking boots. Carrying a red backpack. Last known location was at the trailhead parking area.',
      location: {latitude: 45.9231, longitude: -113.3943},
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reporterName: 'Jane Doe',
      reporterPhone: '(406) 555-0123',
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ],
      status: 'investigating',
      priority: 'high',
    };

    setReport(mockReport);
  };

  const handleCallReporter = () => {
    if (report?.reporterPhone) {
      Alert.alert(
        'Call Reporter',
        `Call ${report.reporterName} at ${report.reporterPhone}?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Call', onPress: () => Linking.openURL(`tel:${report.reporterPhone}`)},
        ]
      );
    }
  };

  const handleGetDirections = () => {
    if (report?.location) {
      const url = `https://maps.google.com/maps?q=${report.location.latitude},${report.location.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleStatusUpdate = (newStatus: EmergencyReport['status']) => {
    Alert.alert(
      'Update Status',
      `Change status to ${newStatus}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Update', onPress: () => {
          setReport(prev => prev ? {...prev, status: newStatus} : null);
          Alert.alert('Success', 'Status updated successfully.');
        }},
      ]
    );
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

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString();
  };

  if (!report) {
    return (
      <View style={styles.container}>
        <EmergencyHeader
          title="Report Details"
          subtitle="Loading..."
          showNotifications={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading report details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Report Details"
        subtitle={`ID: ${report.id}`}
        showNotifications={false}
      />

      <ScrollView style={styles.content}>
        {/* Report Overview */}
        <EmergencyCard
          type={report.priority === 'high' ? 'emergency' : report.priority === 'medium' ? 'warning' : 'info'}
          title={report.title}
          description={report.description}
          icon={getReportTypeIcon(report.type)}
          timestamp={report.timestamp}
          location={`${report.location.latitude.toFixed(6)}, ${report.location.longitude.toFixed(6)}`}
        >
          <View style={styles.reportMeta}>
            <StatusIndicator
              status={report.status === 'resolved' ? 'success' : report.status === 'investigating' ? 'pending' : 'warning'}
              label={report.status.toUpperCase()}
              size="medium"
            />
            <Text style={styles.priorityText}>
              Priority: {report.priority.toUpperCase()}
            </Text>
          </View>
        </EmergencyCard>

        {/* Reporter Information */}
        <EmergencyCard
          type="info"
          title="Reporter Information"
          description="Contact details of the person who submitted this report"
          icon="person"
        >
          <View style={styles.reporterInfo}>
            <View style={styles.reporterDetails}>
              <Text style={styles.reporterName}>{report.reporterName || 'Anonymous'}</Text>
              {report.reporterPhone && (
                <Text style={styles.reporterPhone}>{report.reporterPhone}</Text>
              )}
            </View>
            {report.reporterPhone && (
              <EmergencyButton
                title="Call Reporter"
                icon={<Icon name="call" size={20} color={colors.surface} />}
                onPress={handleCallReporter}
                variant="primary"
                size="medium"
              />
            )}
          </View>
        </EmergencyCard>

        {/* Location Information */}
        <EmergencyCard
          type="info"
          title="Location Details"
          description="Exact coordinates and location information"
          icon="location-on"
        >
          <View style={styles.locationInfo}>
            <Text style={styles.coordinates}>
              {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
            </Text>
            <EmergencyButton
              title="Get Directions"
              icon={<Icon name="directions" size={20} color={colors.surface} />}
              onPress={handleGetDirections}
              variant="secondary"
              size="medium"
            />
          </View>
        </EmergencyCard>

        {/* Photos */}
        {report.photos && report.photos.length > 0 && (
          <EmergencyCard
            type="info"
            title="Photos"
            description="Images submitted with this report"
            icon="photo-library"
          >
            <View style={styles.photosContainer}>
              {report.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{uri: photo}} style={styles.photo} />
                </View>
              ))}
            </View>
          </EmergencyCard>
        )}

        {/* Timeline */}
        <EmergencyCard
          type="info"
          title="Report Timeline"
          description="Important dates and times for this report"
          icon="schedule"
        >
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Report Submitted</Text>
                <Text style={styles.timelineTime}>{formatTimestamp(report.timestamp)}</Text>
              </View>
            </View>
            
            {report.status === 'investigating' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, {backgroundColor: colors.info}]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Investigation Started</Text>
                  <Text style={styles.timelineTime}>
                    {formatTimestamp(new Date(report.timestamp.getTime() + 30 * 60 * 1000))}
                  </Text>
                </View>
              </View>
            )}
            
            {report.status === 'resolved' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, {backgroundColor: colors.success}]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Report Resolved</Text>
                  <Text style={styles.timelineTime}>
                    {formatTimestamp(new Date(report.timestamp.getTime() + 4 * 60 * 60 * 1000))}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </EmergencyCard>

        {/* Admin Actions */}
        <EmergencyCard
          type="info"
          title="Admin Actions"
          description="Update the status of this report"
          icon="admin-panel-settings"
        >
          <View style={styles.adminActions}>
            {report.status === 'pending' && (
              <EmergencyButton
                title="Start Investigation"
                onPress={() => handleStatusUpdate('investigating')}
                variant="info"
                size="large"
                style={styles.actionButton}
              />
            )}
            
            {report.status === 'investigating' && (
              <>
                <EmergencyButton
                  title="Mark as Resolved"
                  onPress={() => handleStatusUpdate('resolved')}
                  variant="success"
                  size="large"
                  style={styles.actionButton}
                />
                <EmergencyButton
                  title="Mark as False Alarm"
                  onPress={() => handleStatusUpdate('false_alarm')}
                  variant="secondary"
                  size="large"
                  style={styles.actionButton}
                />
              </>
            )}
          </View>
        </EmergencyCard>
      </ScrollView>
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
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  priorityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  reporterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  reporterPhone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  locationInfo: {
    alignItems: 'center',
  },
  coordinates: {
    ...typography.body,
    color: colors.text,
    fontFamily: 'monospace',
    marginBottom: spacing.md,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  timeline: {
    marginTop: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  timelineTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  adminActions: {
    gap: spacing.sm,
  },
  actionButton: {
    marginVertical: spacing.xs,
  },
});

export default ReportDetailsScreen;

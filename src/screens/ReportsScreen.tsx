import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary, ImagePickerResponse, MediaType} from 'react-native-image-picker';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import {colors, typography, spacing, borderRadius} from '../utils/theme';
import {locationService} from '../services/LocationService';
import {EmergencyReport, Location} from '../types/index';

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Report form state
  const [reportType, setReportType] = useState<EmergencyReport['type']>('other');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [priority, setPriority] = useState<EmergencyReport['priority']>('medium');

  useEffect(() => {
    loadReports();
    setupLocationTracking();
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

  const setupLocationTracking = () => {
    locationService.addLocationCallback((location) => {
      setCurrentLocation(location);
    });

    locationService.getCurrentPosition().then((location) => {
      if (location) {
        setCurrentLocation(location);
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleCreateReport = () => {
    setShowReportModal(true);
    // Reset form
    setTitle('');
    setDescription('');
    setReporterName('');
    setReporterPhone('');
    setSelectedImages([]);
    setPriority('medium');
  };

  const handleSubmitReport = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    const newReport: EmergencyReport = {
      id: Date.now().toString(),
      type: reportType,
      title: title.trim(),
      description: description.trim(),
      location: currentLocation,
      timestamp: new Date(),
      reporterName: reporterName.trim() || 'Anonymous',
      reporterPhone: reporterPhone.trim(),
      photos: selectedImages,
      status: 'pending',
      priority,
    };

    // In a real app, this would send to server
    setReports(prev => [newReport, ...prev]);
    setShowReportModal(false);

    Alert.alert(
      'Report Submitted',
      'Your emergency report has been submitted to APSAR command center.',
      [{text: 'OK'}]
    );
  };

  const selectImages = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      maxWidth: 1000,
      maxHeight: 1000,
      selectionLimit: 3,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0) {
        const newImages = response.assets.map(asset => asset.uri || '');
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 3));
      }
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
        subtitle="Report emergencies and hazards"
        showEmergencyButton={true}
        onEmergencyPress={() => Alert.alert('Emergency', 'Calling 911...')}
      />

      {/* Quick Report Button */}
      <View style={styles.quickReportSection}>
        <EmergencyButton
          title="Report Emergency"
          icon={<Icon name="add" size={24} color={colors.surface} />}
          onPress={handleCreateReport}
          variant="danger"
          size="large"
          style={styles.quickReportButton}
        />
      </View>

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
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyDescription}>
              Tap the button above to report an emergency or hazard.
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

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <EmergencyHeader
            title="Report Emergency"
            subtitle="Help us help you"
            showNotifications={false}
          />
          
          <ScrollView style={styles.modalContent}>
            {/* Report Type */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Type of Report *</Text>
              <View style={styles.typeButtons}>
                {(['missing_person', 'hazard', 'emergency_sighting', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, reportType === type && styles.activeTypeButton]}
                    onPress={() => setReportType(type)}
                  >
                    <Icon name={getReportTypeIcon(type)} size={20} color={reportType === type ? colors.surface : colors.primary} />
                    <Text style={[styles.typeButtonText, reportType === type && styles.activeTypeButtonText]}>
                      {type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Brief description of the emergency"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Detailed description of what you observed"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Priority */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.priorityButton, priority === level && styles.activePriorityButton]}
                    onPress={() => setPriority(level)}
                  >
                    <Text style={[styles.priorityButtonText, priority === level && styles.activePriorityButtonText]}>
                      {level.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Photos */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Photos (Optional)</Text>
              <EmergencyButton
                title="Add Photos"
                icon={<Icon name="camera-alt" size={20} color={colors.surface} />}
                onPress={selectImages}
                variant="secondary"
                size="medium"
              />
              {selectedImages.length > 0 && (
                <View style={styles.imagePreview}>
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{uri}} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Icon name="close" size={16} color={colors.surface} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Contact Information */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Your Name (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Your name"
                value={reporterName}
                onChangeText={setReporterName}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="(406) 555-0123"
                value={reporterPhone}
                onChangeText={setReporterPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Location Info */}
            {currentLocation && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Your Location</Text>
                <Text style={styles.locationText}>
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <EmergencyButton
              title="Cancel"
              onPress={() => setShowReportModal(false)}
              variant="secondary"
              size="large"
              style={styles.modalButton}
            />
            <EmergencyButton
              title="Submit Report"
              onPress={handleSubmitReport}
              variant="danger"
              size="large"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickReportSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  quickReportButton: {
    width: '100%',
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    minWidth: '45%',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  activeTypeButtonText: {
    color: colors.surface,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    backgroundColor: colors.surface,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  activePriorityButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  activePriorityButtonText: {
    color: colors.surface,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    margin: spacing.xs,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default ReportsScreen;

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  ActivityIndicator,
  Portal,
  Dialog,
  TextInput,
  Divider,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../services/ApiService';
import {CalloutReport} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';

interface RouteParams {
  reportId: string;
}

const CalloutReportReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {reportId} = route.params as RouteParams;
  const {isOfficer, isAdmin} = useAuth();

  const [report, setReport] = useState<CalloutReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [reviewDialogVisible, setReviewDialogVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCalloutReport(reportId);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!report) return;

    setReviewing(true);
    try {
      await apiService.reviewCalloutReport(reportId, reviewAction, reviewNotes || undefined);
      
      Alert.alert(
        'Success',
        `Report ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to review report:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setReviewing(false);
      setReviewDialogVisible(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await apiService.exportCalloutReports({reportIds: [reportId]}, 'pdf');
      // In React Native, you'd need to use a library like react-native-fs or share the file
      Alert.alert('Success', 'PDF exported (in production, file would be downloaded)');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'under_review':
        return colors.warning;
      case 'submitted':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Paragraph style={styles.errorText}>Report not found</Paragraph>
      </View>
    );
  }

  const canReview = (isOfficer || isAdmin) && (report.status === 'submitted' || report.status === 'under_review');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{report.incidentType}</Title>
            <Chip
              style={[styles.statusChip, {backgroundColor: getStatusColor(report.status)}]}
              textStyle={styles.statusChipText}
            >
              {report.status.replace('_', ' ').toUpperCase()}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Submitted By:</Paragraph>
            <Paragraph style={styles.value}>{report.submittedByName || 'Unknown'}</Paragraph>
          </View>

          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Date:</Paragraph>
            <Paragraph style={styles.value}>
              {new Date(report.date).toLocaleDateString()}
            </Paragraph>
          </View>

          {report.startTime && (
            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Start Time:</Paragraph>
              <Paragraph style={styles.value}>
                {new Date(report.startTime).toLocaleTimeString()}
              </Paragraph>
            </View>
          )}

          {report.endTime && (
            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>End Time:</Paragraph>
              <Paragraph style={styles.value}>
                {new Date(report.endTime).toLocaleTimeString()}
              </Paragraph>
            </View>
          )}

          {report.roleOnScene && (
            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Role on Scene:</Paragraph>
              <Paragraph style={styles.value}>{report.roleOnScene}</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      {report.location && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Location</Title>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={20} color={colors.primary} />
              <Paragraph style={styles.locationText}>
                {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
              </Paragraph>
            </View>
            {report.locationDescription && (
              <Paragraph style={styles.description}>{report.locationDescription}</Paragraph>
            )}
          </Card.Content>
        </Card>
      )}

      {report.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notes</Title>
            <Paragraph style={styles.description}>{report.notes}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {report.observations && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Observations</Title>
            <Paragraph style={styles.description}>{report.observations}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {report.photos && report.photos.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Photos ({report.photos.length})</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {report.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    // In production, open photo in full screen viewer
                    Alert.alert('Photo', `Photo ${index + 1}`);
                  }}
                  style={styles.photoContainer}
                >
                  <Image source={{uri: photo}} style={styles.photo} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      {report.documents && report.documents.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Documents ({report.documents.length})</Title>
            {report.documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // In production, open or download document
                  Alert.alert('Document', `Document ${index + 1}`);
                }}
                style={styles.documentItem}
              >
                <Icon name="description" size={24} color={colors.primary} />
                <Paragraph style={styles.documentText}>Document {index + 1}</Paragraph>
                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}

      {report.reviewNotes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Review Notes</Title>
            <Paragraph style={styles.description}>{report.reviewNotes}</Paragraph>
            {report.reviewedByName && (
              <Paragraph style={styles.reviewMeta}>
                Reviewed by {report.reviewedByName} on{' '}
                {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : ''}
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      )}

      <Divider style={styles.divider} />

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleExportPDF}
          icon="picture-as-pdf"
          style={styles.actionButton}
        >
          Export PDF
        </Button>

        {canReview && (
          <>
            <Button
              mode="contained"
              onPress={() => {
                setReviewAction('approve');
                setReviewDialogVisible(true);
              }}
              buttonColor={colors.success}
              icon="check-circle"
              style={styles.actionButton}
            >
              Approve
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setReviewAction('reject');
                setReviewDialogVisible(true);
              }}
              buttonColor={colors.error}
              icon="cancel"
              style={styles.actionButton}
            >
              Reject
            </Button>
          </>
        )}
      </View>

      <Portal>
        <Dialog visible={reviewDialogVisible} onDismiss={() => setReviewDialogVisible(false)}>
          <Dialog.Title>
            {reviewAction === 'approve' ? 'Approve Report' : 'Reject Report'}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              {reviewAction === 'approve'
                ? 'Are you sure you want to approve this report?'
                : 'Please provide a reason for rejection (optional but recommended):'}
            </Paragraph>
            <TextInput
              label="Review Notes"
              value={reviewNotes}
              onChangeText={setReviewNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.reviewInput}
              placeholder={reviewAction === 'reject' ? 'Reason for rejection...' : 'Optional notes...'}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReviewDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleReview}
              mode="contained"
              loading={reviewing}
              buttonColor={reviewAction === 'approve' ? colors.success : colors.error}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  photoScroll: {
    marginTop: spacing.sm,
  },
  photoContainer: {
    marginRight: spacing.sm,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  documentText: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
  },
  reviewMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  dialogText: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  reviewInput: {
    marginTop: spacing.sm,
  },
});

export default CalloutReportReviewScreen;



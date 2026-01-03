import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  ActivityIndicator,
  Chip,
  Button,
  Surface,
  Divider,
  Dialog,
  Portal,
  RadioButton,
  TextInput,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/ApiService';
import {colors, typography, spacing, borderRadius, shadows} from '../utils/theme';
import {NavigationParams, CallOut, CallOutResponse, CallOutResponseStatus} from '../types/index';

type CallOutDetailsNavigationProp = StackNavigationProp<
  NavigationParams,
  'CallOutDetails'
>;
type CallOutDetailsRouteProp = {
  key: string;
  name: 'CallOutDetails';
  params: {callOutId: string};
};

const CallOutDetailsScreen: React.FC = () => {
  const navigation = useNavigation<CallOutDetailsNavigationProp>();
  const route = useRoute<CallOutDetailsRouteProp>();
  const {user, isCommand} = useAuth();
  const {callOutId} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [callOut, setCallOut] = useState<CallOut | null>(null);
  const [responseDialogVisible, setResponseDialogVisible] = useState(false);
  const [responseStatus, setResponseStatus] = useState<CallOutResponseStatus>('available');
  const [responseNotes, setResponseNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCallOut();
  }, [callOutId]);

  const loadCallOut = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCallOut(callOutId);
      setCallOut(data);

      // Load user's existing response if any
      const existingResponse = data.responses?.find((r) => r.userId === user?.id);
      if (existingResponse) {
        setResponseStatus(existingResponse.status);
        setResponseNotes(existingResponse.notes || '');
      }
    } catch (error) {
      console.error('Failed to load call-out:', error);
      Alert.alert('Error', 'Failed to load call-out details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCallOut();
    setRefreshing(false);
  };

  const getUserResponse = (): CallOutResponse | undefined => {
    if (!user || !callOut) return undefined;
    return callOut.responses?.find((r) => r.userId === user.id);
  };

  const handleRespond = async () => {
    if (!callOut) return;

    setSubmitting(true);
    try {
      let estimatedArrival: Date | undefined;
      if (responseStatus === 'en_route') {
        // Could add date picker for ETA, for now use default
        estimatedArrival = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes default
      }

      await apiService.respondToCallOut(
        callOutId,
        responseStatus,
        estimatedArrival,
        responseNotes.trim() || undefined
      );

      setResponseDialogVisible(false);
      await loadCallOut();
      Alert.alert('Success', 'Your response has been recorded');
    } catch (error) {
      console.error('Failed to submit response:', error);
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  const getResponseStatusColor = (status: CallOutResponseStatus): string => {
    switch (status) {
      case 'available':
        return colors.success;
      case 'en_route':
        return colors.warning;
      case 'unavailable':
        return colors.textSecondary;
      default:
        return colors.info;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!callOut) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Call-out not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const userResponse = getUserResponse();
  const isExpired = callOut.expiresAt && new Date(callOut.expiresAt) < new Date();
  const canRespond = callOut.status === 'active' && !isExpired;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Card */}
      <Surface style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Title style={styles.title}>{callOut.title}</Title>
            <Chip
              icon="phone-in-talk"
              style={[styles.statusChip, {backgroundColor: getStatusColor(callOut.status)}]}
              textStyle={styles.statusChipText}
            >
              {callOut.status.toUpperCase()}
            </Chip>
          </View>
        </View>
        <Paragraph style={styles.message}>{callOut.message}</Paragraph>

        <View style={styles.metaInfo}>
          <View style={styles.metaRow}>
            <Icon name="access-time" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              Created: {new Date(callOut.createdAt).toLocaleString()}
            </Text>
          </View>
          {callOut.expiresAt && (
            <View style={styles.metaRow}>
              <Icon
                name={isExpired ? 'schedule' : 'timer'}
                size={16}
                color={isExpired ? colors.error : colors.textSecondary}
              />
              <Text
                style={[styles.metaText, isExpired && styles.metaTextExpired]}
              >
                {isExpired
                  ? 'Expired'
                  : `Expires: ${new Date(callOut.expiresAt).toLocaleString()}`}
              </Text>
            </View>
          )}
        </View>
      </Surface>

      {/* User Response Section */}
      {userResponse ? (
        <Card style={styles.responseCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Response</Text>
            <View style={styles.userResponse}>
              <Chip
                icon="check-circle"
                style={[
                  styles.responseChip,
                  {backgroundColor: getResponseStatusColor(userResponse.status)},
                ]}
                textStyle={styles.responseChipText}
              >
                {userResponse.status.replace('_', ' ').toUpperCase()}
              </Chip>
              {userResponse.estimatedArrival && (
                <Text style={styles.responseText}>
                  ETA: {new Date(userResponse.estimatedArrival).toLocaleString()}
                </Text>
              )}
              {userResponse.notes && (
                <Text style={styles.responseText}>Notes: {userResponse.notes}</Text>
              )}
              <Text style={styles.responseText}>
                Responded: {new Date(userResponse.respondedAt).toLocaleString()}
              </Text>
            </View>
            {canRespond && (
              <Button
                mode="outlined"
                onPress={() => setResponseDialogVisible(true)}
                style={styles.updateButton}
              >
                Update Response
              </Button>
            )}
          </Card.Content>
        </Card>
      ) : (
        canRespond && (
          <Card style={styles.responseCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Respond to Call-Out</Text>
              <Button
                mode="contained"
                onPress={() => setResponseDialogVisible(true)}
                icon="phone-in-talk"
                style={styles.respondButton}
              >
                Respond Now
              </Button>
            </Card.Content>
          </Card>
        )
      )}

      {/* Responses List (Command only or if user has responded) */}
      {(isCommand || userResponse) && callOut.responses && callOut.responses.length > 0 && (
        <Card style={styles.responsesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              Responses ({callOut.responses.length})
            </Text>
            <Divider style={styles.divider} />
            {callOut.responses.map((response, index) => (
              <View key={response.id}>
                <View style={styles.responseItem}>
                  <View style={styles.responseItemHeader}>
                    <Text style={styles.responseUserName}>{response.userName}</Text>
                    <Chip
                      style={[
                        styles.responseStatusChip,
                        {backgroundColor: getResponseStatusColor(response.status)},
                      ]}
                      textStyle={styles.responseStatusChipText}
                    >
                      {response.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </View>
                  {response.estimatedArrival && (
                    <Text style={styles.responseDetailText}>
                      ETA: {new Date(response.estimatedArrival).toLocaleString()}
                    </Text>
                  )}
                  {response.notes && (
                    <Text style={styles.responseDetailText}>
                      Notes: {response.notes}
                    </Text>
                  )}
                  <Text style={styles.responseDetailText}>
                    {new Date(response.respondedAt).toLocaleString()}
                  </Text>
                </View>
                {index < callOut.responses.length - 1 && (
                  <Divider style={styles.responseDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Response Dialog */}
      <Portal>
        <Dialog
          visible={responseDialogVisible}
          onDismiss={() => setResponseDialogVisible(false)}
        >
          <Dialog.Title>Respond to Call-Out</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>Status:</Text>
            <RadioButton.Group
              onValueChange={(value) =>
                setResponseStatus(value as CallOutResponseStatus)
              }
              value={responseStatus}
            >
              <RadioButton.Item
                label="Available"
                value="available"
                labelStyle={styles.radioLabel}
              />
              <RadioButton.Item
                label="En Route"
                value="en_route"
                labelStyle={styles.radioLabel}
              />
              <RadioButton.Item
                label="Unavailable"
                value="unavailable"
                labelStyle={styles.radioLabel}
              />
            </RadioButton.Group>

            <Text style={[styles.dialogLabel, {marginTop: spacing.md}]}>
              Notes (optional):
            </Text>
            <TextInput
              mode="outlined"
              value={responseNotes}
              onChangeText={setResponseNotes}
              multiline
              numberOfLines={3}
              placeholder="Add any notes..."
              style={styles.notesInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResponseDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleRespond}
              mode="contained"
              loading={submitting}
              disabled={submitting}
            >
              Submit
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
    marginBottom: spacing.lg,
  },
  headerCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  headerContent: {
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
  message: {
    ...typography.body,
    marginBottom: spacing.md,
    color: colors.text,
  },
  metaInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  metaTextExpired: {
    color: colors.error,
  },
  responseCard: {
    margin: spacing.md,
    marginTop: 0,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  userResponse: {
    marginBottom: spacing.md,
  },
  responseChip: {
    height: 32,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  responseChipText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  responseText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  updateButton: {
    marginTop: spacing.sm,
  },
  respondButton: {
    marginTop: spacing.sm,
  },
  responsesCard: {
    margin: spacing.md,
    marginTop: 0,
    ...shadows.small,
  },
  divider: {
    marginBottom: spacing.md,
  },
  responseItem: {
    paddingVertical: spacing.md,
  },
  responseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  responseUserName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  responseStatusChip: {
    height: 24,
  },
  responseStatusChipText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  responseDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  responseDivider: {
    marginTop: spacing.md,
  },
  dialogLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  radioLabel: {
    ...typography.body,
  },
  notesInput: {
    marginTop: spacing.sm,
  },
});

export default CallOutDetailsScreen;


import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  TextInput,
  Portal,
  Dialog,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../services/ApiService';
import {Vehicle, VehicleStatus, VehicleType, MaintenanceLog} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';

const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {vehicleId} = route.params as {vehicleId: string};
  const {isOfficer, isAdmin} = useAuth();
  const isNew = vehicleId === 'new';
  const canEdit = isOfficer || isAdmin;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(isNew);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const [formData, setFormData] = useState({
    unitNumber: '',
    type: 'truck' as VehicleType,
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    currentMileage: '',
    status: 'ready' as VehicleStatus,
    notes: '',
  });

  useEffect(() => {
    if (!isNew) {
      loadVehicle();
      loadMaintenanceLogs();
    }
  }, [vehicleId, isNew]);

  const loadVehicle = async () => {
    try {
      const data = await apiService.getVehicle(vehicleId);
      setVehicle(data);
      setFormData({
        unitNumber: data.unitNumber,
        type: data.type,
        make: data.make || '',
        model: data.model || '',
        year: data.year?.toString() || '',
        vin: data.vin || '',
        licensePlate: data.licensePlate || '',
        currentMileage: data.currentMileage?.toString() || '',
        status: data.status,
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Failed to load vehicle:', error);
      Alert.alert('Error', 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceLogs = async () => {
    try {
      const logs = await apiService.getVehicleMaintenanceLogs(vehicleId);
      setMaintenanceLogs(logs.slice(0, 5)); // Show last 5
    } catch (error) {
      console.error('Failed to load maintenance logs:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const vehicleData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined,
        currentMileage: formData.currentMileage ? parseInt(formData.currentMileage) : undefined,
      };

      if (isNew) {
        await apiService.createVehicle(vehicleData);
        Alert.alert('Success', 'Vehicle created successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        await apiService.updateVehicle(vehicleId, vehicleData);
        await loadVehicle();
        setEditDialogVisible(false);
        Alert.alert('Success', 'Vehicle updated successfully');
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteVehicle(vehicleId);
      Alert.alert('Success', 'Vehicle deleted successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      Alert.alert('Error', 'Failed to delete vehicle');
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayVehicle = vehicle || (isNew ? null : vehicle);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {displayVehicle && !editDialogVisible && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.header}>
                  <View>
                    <Title style={styles.title}>{displayVehicle.unitNumber}</Title>
                    <Paragraph style={styles.subtitle}>
                      {displayVehicle.type.charAt(0).toUpperCase() + displayVehicle.type.slice(1)}
                    </Paragraph>
                  </View>
                  <Chip
                    style={[styles.statusChip, {backgroundColor: getStatusColor(displayVehicle.status)}]}
                    textStyle={styles.statusChipText}
                  >
                    {displayVehicle.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>Make/Model:</Paragraph>
                  <Paragraph style={styles.value}>
                    {displayVehicle.make && displayVehicle.model
                      ? `${displayVehicle.make} ${displayVehicle.model}`
                      : 'N/A'}
                  </Paragraph>
                </View>

                {displayVehicle.year && (
                  <View style={styles.infoRow}>
                    <Paragraph style={styles.label}>Year:</Paragraph>
                    <Paragraph style={styles.value}>{displayVehicle.year}</Paragraph>
                  </View>
                )}

                {displayVehicle.currentMileage !== undefined && (
                  <View style={styles.infoRow}>
                    <Paragraph style={styles.label}>Mileage:</Paragraph>
                    <Paragraph style={styles.value}>
                      {displayVehicle.currentMileage.toLocaleString()} miles
                    </Paragraph>
                  </View>
                )}

                {displayVehicle.licensePlate && (
                  <View style={styles.infoRow}>
                    <Paragraph style={styles.label}>License Plate:</Paragraph>
                    <Paragraph style={styles.value}>{displayVehicle.licensePlate}</Paragraph>
                  </View>
                )}

                {displayVehicle.notes && (
                  <>
                    <Divider style={styles.divider} />
                    <Paragraph style={styles.label}>Notes:</Paragraph>
                    <Paragraph style={styles.value}>{displayVehicle.notes}</Paragraph>
                  </>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Maintenance</Title>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MaintenanceLogs', {vehicleId: displayVehicle.id})}
                  style={styles.actionButton}
                >
                  <Icon name="build" size={20} color={colors.primary} />
                  <Paragraph style={styles.actionText}>View Maintenance Logs</Paragraph>
                  <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {maintenanceLogs.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <Paragraph style={styles.label}>Recent Maintenance:</Paragraph>
                    {maintenanceLogs.map(log => (
                      <View key={log.id} style={styles.maintenanceItem}>
                        <Paragraph style={styles.maintenanceType}>{log.type}</Paragraph>
                        <Paragraph style={styles.maintenanceDate}>
                          {new Date(log.performedAt).toLocaleDateString()}
                        </Paragraph>
                      </View>
                    ))}
                  </>
                )}
              </Card.Content>
            </Card>

            {canEdit && (
              <View style={styles.actions}>
                <Button
                  mode="contained"
                  onPress={() => setEditDialogVisible(true)}
                  style={styles.editButton}
                >
                  Edit Vehicle
                </Button>
                {isAdmin && (
                  <Button
                    mode="outlined"
                    onPress={() => setDeleteDialogVisible(true)}
                    style={styles.deleteButton}
                    textColor={colors.error}
                  >
                    Delete Vehicle
                  </Button>
                )}
              </View>
            )}
          </>
        )}

        {(editDialogVisible || isNew) && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>{isNew ? 'New Vehicle' : 'Edit Vehicle'}</Title>

              <TextInput
                label="Unit Number *"
                value={formData.unitNumber}
                onChangeText={text => setFormData({...formData, unitNumber: text})}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Make"
                value={formData.make}
                onChangeText={text => setFormData({...formData, make: text})}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Model"
                value={formData.model}
                onChangeText={text => setFormData({...formData, model: text})}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Year"
                value={formData.year}
                onChangeText={text => setFormData({...formData, year: text})}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Current Mileage"
                value={formData.currentMileage}
                onChangeText={text => setFormData({...formData, currentMileage: text})}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="License Plate"
                value={formData.licensePlate}
                onChangeText={text => setFormData({...formData, licensePlate: text})}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Notes"
                value={formData.notes}
                onChangeText={text => setFormData({...formData, notes: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.formActions}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={saving}
                  disabled={!formData.unitNumber || saving}
                >
                  {isNew ? 'Create' : 'Save'}
                </Button>
                {!isNew && (
                  <Button mode="outlined" onPress={() => setEditDialogVisible(false)}>
                    Cancel
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Vehicle</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor={colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  scrollView: {
    flex: 1,
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
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.md,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionText: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.primary,
  },
  maintenanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  maintenanceType: {
    ...typography.bodySmall,
    textTransform: 'capitalize',
  },
  maintenanceDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.md,
  },
  editButton: {
    marginBottom: spacing.sm,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  input: {
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});

export default VehicleDetailsScreen;



import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  ActivityIndicator,
  Chip,
  Portal,
  Dialog,
  Menu,
  IconButton,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary, launchCamera, ImagePickerResponse, Asset} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {apiService} from '../services/ApiService';
import {CalloutReport, Location} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';
import {LocationService} from '../services/LocationService';

interface RouteParams {
  reportId?: string;
  calloutId?: string;
  missionId?: string;
}

const CalloutReportFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {reportId, calloutId, missionId} = (route.params || {}) as RouteParams;
  const {user} = useAuth();
  const isEdit = !!reportId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [cameraMenuVisible, setCameraMenuVisible] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    incidentType: '',
    locationDescription: '',
    roleOnScene: '',
    notes: '',
    observations: '',
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && reportId) {
      loadReport();
    } else {
      getCurrentLocation();
    }
  }, [reportId, isEdit]);

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const loc = await LocationService.getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Location Error', 'Failed to get your location. You can enter it manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const report = await apiService.getCalloutReport(reportId!);
      
      setFormData({
        date: new Date(report.date).toISOString().split('T')[0],
        startTime: report.startTime ? new Date(report.startTime).toISOString().split('T')[1].slice(0, 5) : '',
        endTime: report.endTime ? new Date(report.endTime).toISOString().split('T')[1].slice(0, 5) : '',
        incidentType: report.incidentType,
        locationDescription: report.locationDescription || '',
        roleOnScene: report.roleOnScene || '',
        notes: report.notes || '',
        observations: report.observations || '',
      });

      setPhotos(report.photos || []);
      setDocuments(report.documents || []);
      setLocation(report.location);
    } catch (error) {
      console.error('Failed to load report:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    setCameraMenuVisible(false);
    try {
      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // In production, upload to server and get URL
        // For now, store local URI
        setPhotos(prev => [...prev, asset.uri || '']);
        setPhotoFiles(prev => [...prev, asset]);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handlePickPhoto = async () => {
    setCameraMenuVisible(false);
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 10,
        includeBase64: false,
      });

      if (result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri || '');
        setPhotos(prev => [...prev, ...newPhotos]);
        setPhotoFiles(prev => [...prev, ...result.assets!]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: true,
      });

      const newDocs = result.map(doc => doc.uri);
      setDocuments(prev => [...prev, ...newDocs]);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled
        return;
      }
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (submitForReview: boolean = false) => {
    if (!formData.incidentType) {
      Alert.alert('Validation Error', 'Please enter an incident type');
      return;
    }

    if (!location) {
      Alert.alert('Validation Error', 'Please provide a location');
      return;
    }

    setSaving(true);
    try {
      // Upload photos and documents first
      const uploadedPhotos: string[] = [];
      const uploadedDocuments: string[] = [];

      // In production, upload files to server
      // For now, use local URIs (would need to upload in real implementation)
      uploadedPhotos.push(...photos);
      uploadedDocuments.push(...documents);

      const reportData: Partial<CalloutReport> = {
        calloutId,
        missionId,
        date: new Date(formData.date),
        startTime: formData.startTime ? new Date(`${formData.date}T${formData.startTime}`) : undefined,
        endTime: formData.endTime ? new Date(`${formData.date}T${formData.endTime}`) : undefined,
        incidentType: formData.incidentType,
        location,
        locationDescription: formData.locationDescription || undefined,
        roleOnScene: formData.roleOnScene || undefined,
        notes: formData.notes || undefined,
        observations: formData.observations || undefined,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
        documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
        status: submitForReview ? 'submitted' : 'draft',
      };

      if (isEdit) {
        await apiService.updateCalloutReport(reportId!, reportData);
      } else {
        await apiService.createCalloutReport(reportData);
      }

      Alert.alert(
        'Success',
        submitForReview
          ? 'Report submitted for review'
          : 'Report saved as draft',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save report:', error);
      Alert.alert('Error', 'Failed to save report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Incident Information</Title>

          <TextInput
            label="Date *"
            value={formData.date}
            onChangeText={text => setFormData({...formData, date: text})}
            mode="outlined"
            style={styles.input}
            keyboardType="default"
          />

          <View style={styles.timeRow}>
            <TextInput
              label="Start Time"
              value={formData.startTime}
              onChangeText={text => setFormData({...formData, startTime: text})}
              mode="outlined"
              style={[styles.input, styles.timeInput]}
              placeholder="HH:MM"
            />
            <TextInput
              label="End Time"
              value={formData.endTime}
              onChangeText={text => setFormData({...formData, endTime: text})}
              mode="outlined"
              style={[styles.input, styles.timeInput]}
              placeholder="HH:MM"
            />
          </View>

          <TextInput
            label="Incident Type *"
            value={formData.incidentType}
            onChangeText={text => setFormData({...formData, incidentType: text})}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Missing Person, Injury, etc."
          />

          <TextInput
            label="Your Role on Scene"
            value={formData.roleOnScene}
            onChangeText={text => setFormData({...formData, roleOnScene: text})}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Search Team Lead, Medical, etc."
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Location</Title>

          {location && (
            <View style={styles.locationDisplay}>
              <Icon name="location-on" size={20} color={colors.primary} />
              <Paragraph style={styles.locationText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Paragraph>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={getCurrentLocation}
            loading={gettingLocation}
            icon="my-location"
            style={styles.locationButton}
          >
            {location ? 'Update Location' : 'Get Current Location'}
          </Button>

          <TextInput
            label="Location Description"
            value={formData.locationDescription}
            onChangeText={text => setFormData({...formData, locationDescription: text})}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Additional location details, landmarks, etc."
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Details</Title>

          <TextInput
            label="Notes"
            value={formData.notes}
            onChangeText={text => setFormData({...formData, notes: text})}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="General notes about the callout..."
          />

          <TextInput
            label="Observations"
            value={formData.observations}
            onChangeText={text => setFormData({...formData, observations: text})}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Detailed observations, conditions, actions taken..."
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.mediaHeader}>
            <Title style={styles.sectionTitle}>Photos</Title>
            <Menu
              visible={cameraMenuVisible}
              onDismiss={() => setCameraMenuVisible(false)}
              anchor={
                <IconButton
                  icon="camera-alt"
                  size={24}
                  onPress={() => setCameraMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={handleTakePhoto} title="Take Photo" />
              <Menu.Item onPress={handlePickPhoto} title="Choose from Library" />
            </Menu>
          </View>

          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{uri: photo}} style={styles.photo} />
                  <IconButton
                    icon="close"
                    size={20}
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  />
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.mediaHeader}>
            <Title style={styles.sectionTitle}>Documents</Title>
            <IconButton
              icon="attach-file"
              size={24}
              onPress={handlePickDocument}
            />
          </View>

          {documents.length > 0 && (
            <View style={styles.documentList}>
              {documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Icon name="description" size={24} color={colors.primary} />
                  <Paragraph style={styles.documentText}>
                    Document {index + 1}
                  </Paragraph>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removeDocument(index)}
                  />
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => handleSave(false)}
          loading={saving}
          style={styles.button}
        >
          Save Draft
        </Button>
        <Button
          mode="contained"
          onPress={() => handleSave(true)}
          loading={saving}
          style={styles.button}
        >
          Submit for Review
        </Button>
      </View>
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
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  locationText: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
    flex: 1,
  },
  locationButton: {
    marginBottom: spacing.md,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  photoContainer: {
    width: '48%',
    marginRight: '2%',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
  },
  documentList: {
    marginTop: spacing.sm,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default CalloutReportFormScreen;



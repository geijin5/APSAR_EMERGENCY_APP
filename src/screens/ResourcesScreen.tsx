import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import {colors, typography, spacing} from '../utils/theme';
import {EmergencyContact, WeatherWarning} from '../types/index';

const ResourcesScreen: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [weatherWarnings, setWeatherWarnings] = useState<WeatherWarning[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadEmergencyContacts();
    loadWeatherWarnings();
  }, []);

  const loadEmergencyContacts = () => {
    const contacts: EmergencyContact[] = [
      {
        id: '1',
        name: 'Emergency Services',
        phone: '911',
        type: 'other',
        isPrimary: true,
      },
      {
        id: '2',
        name: 'APSAR Headquarters',
        phone: '(406) 555-0123',
        type: 'search_rescue',
        isPrimary: true,
      },
      {
        id: '3',
        name: 'Anaconda Police',
        phone: '(406) 555-0100',
        type: 'police',
        isPrimary: false,
      },
      {
        id: '4',
        name: 'Anaconda Fire Department',
        phone: '(406) 555-0101',
        type: 'fire',
        isPrimary: false,
      },
      {
        id: '5',
        name: 'Community Medical Center',
        phone: '(406) 555-0102',
        type: 'medical',
        isPrimary: false,
      },
      {
        id: '6',
        name: 'Montana Highway Patrol',
        phone: '(406) 555-0103',
        type: 'police',
        isPrimary: false,
      },
    ];
    setEmergencyContacts(contacts);
  };

  const loadWeatherWarnings = () => {
    const warnings: WeatherWarning[] = [
      {
        id: '1',
        type: 'storm',
        severity: 'warning',
        description: 'Severe thunderstorm warning in effect until 6:00 PM. Winds up to 60 mph possible.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        affectedAreas: ['Anaconda', 'Georgetown Lake', 'Pintler Mountains'],
      },
      {
        id: '2',
        type: 'snow',
        severity: 'advisory',
        description: 'Winter weather advisory for higher elevations. 2-4 inches of snow expected.',
        startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        affectedAreas: ['Pintler Mountains', 'Georgetown Lake'],
      },
    ];
    setWeatherWarnings(warnings);
  };

  const handleCall = (phone: string) => {
    Alert.alert(
      'Call Emergency Contact',
      `This will call ${phone}. Continue?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`)},
      ]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const getContactIcon = (type: EmergencyContact['type']): string => {
    switch (type) {
      case 'police':
        return 'local-police';
      case 'fire':
        return 'local-fire-department';
      case 'medical':
        return 'local-hospital';
      case 'search_rescue':
        return 'search';
      default:
        return 'phone';
    }
  };

  const getWeatherIcon = (type: WeatherWarning['type']): string => {
    switch (type) {
      case 'storm':
        return 'thunderstorm';
      case 'snow':
        return 'ac-unit';
      case 'flood':
        return 'water';
      case 'fire':
        return 'local-fire-department';
      case 'extreme_cold':
        return 'ac-unit';
      case 'extreme_heat':
        return 'wb-sunny';
      default:
        return 'cloud';
    }
  };

  const getSeverityColor = (severity: WeatherWarning['severity']): string => {
    switch (severity) {
      case 'warning':
        return colors.error;
      case 'watch':
        return colors.warning;
      case 'advisory':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const renderFirstAidTips = () => {
    const tips = [
      {
        title: 'CPR Basics',
        description: 'Check for breathing, call 911, start chest compressions at 100-120 per minute.',
        icon: 'favorite',
      },
      {
        title: 'Bleeding Control',
        description: 'Apply direct pressure, elevate the wound, use pressure points if needed.',
        icon: 'local-hospital',
      },
      {
        title: 'Shock Treatment',
        description: 'Keep person lying down, elevate feet, maintain body temperature.',
        icon: 'thermostat',
      },
      {
        title: 'Burn Care',
        description: 'Cool with water, cover loosely, don\'t use ice or ointments.',
        icon: 'whatshot',
      },
    ];

    return (
      <View style={styles.tipsContainer}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Icon name={tip.icon} size={24} color={colors.primary} style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderShelterLocations = () => {
    const shelters = [
      {
        name: 'Anaconda Community Center',
        address: '123 Main Street, Anaconda, MT',
        capacity: '50 people',
        phone: '(406) 555-0150',
      },
      {
        name: 'Georgetown Lake Lodge',
        address: '456 Lake Road, Georgetown Lake, MT',
        capacity: '30 people',
        phone: '(406) 555-0151',
      },
      {
        name: 'APSAR Emergency Shelter',
        address: '789 Emergency Lane, Anaconda, MT',
        capacity: '25 people',
        phone: '(406) 555-0123',
      },
    ];

    return (
      <View style={styles.sheltersContainer}>
        {shelters.map((shelter, index) => (
          <View key={index} style={styles.shelterItem}>
            <Text style={styles.shelterName}>{shelter.name}</Text>
            <Text style={styles.shelterAddress}>{shelter.address}</Text>
            <Text style={styles.shelterCapacity}>Capacity: {shelter.capacity}</Text>
            <TouchableOpacity onPress={() => handleCall(shelter.phone)}>
              <Text style={styles.shelterPhone}>{shelter.phone}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Emergency Resources"
        subtitle="Contacts, weather, and safety information"
      />

      <ScrollView style={styles.content}>
        {/* Emergency Contacts */}
        <EmergencyCard
          type="emergency"
          title="Emergency Contacts"
          description="Quick access to emergency services and local contacts"
          icon="phone"
        >
          <View style={styles.contactsContainer}>
            {emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactItem, contact.isPrimary && styles.primaryContact]}
                onPress={() => handleCall(contact.phone)}
              >
                <Icon name={getContactIcon(contact.type)} size={24} color={contact.isPrimary ? colors.error : colors.primary} />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, contact.isPrimary && styles.primaryContactText]}>
                    {contact.name}
                  </Text>
                  <Text style={[styles.contactPhone, contact.isPrimary && styles.primaryContactText]}>
                    {contact.phone}
                  </Text>
                </View>
                <Icon name="call" size={20} color={contact.isPrimary ? colors.error : colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </EmergencyCard>

        {/* Weather Warnings */}
        {weatherWarnings.length > 0 && (
          <EmergencyCard
            type="warning"
            title="Weather Warnings"
            description="Current weather alerts and warnings"
            icon="cloud"
          >
            {weatherWarnings.map((warning) => (
              <View key={warning.id} style={styles.weatherWarning}>
                <View style={styles.weatherHeader}>
                  <Icon name={getWeatherIcon(warning.type)} size={24} color={getSeverityColor(warning.severity)} />
                  <View style={styles.weatherInfo}>
                    <Text style={[styles.weatherType, {color: getSeverityColor(warning.severity)}]}>
                      {warning.type.toUpperCase()} {warning.severity.toUpperCase()}
                    </Text>
                    <Text style={styles.weatherDescription}>{warning.description}</Text>
                  </View>
                </View>
                <Text style={styles.affectedAreas}>
                  Affected Areas: {warning.affectedAreas.join(', ')}
                </Text>
              </View>
            ))}
          </EmergencyCard>
        )}

        {/* First Aid Tips */}
        <EmergencyCard
          type="info"
          title="First Aid Tips"
          description="Basic first aid information for emergency situations"
          icon="local-hospital"
        >
          {renderFirstAidTips()}
        </EmergencyCard>

        {/* Shelter Locations */}
        <EmergencyCard
          type="success"
          title="Emergency Shelters"
          description="Locations where you can find shelter during emergencies"
          icon="home"
        >
          {renderShelterLocations()}
        </EmergencyCard>

        {/* Emergency Preparedness */}
        <EmergencyCard
          type="info"
          title="Emergency Preparedness"
          description="How to prepare for emergencies and natural disasters"
          icon="shield"
        >
          <View style={styles.preparednessTips}>
            <Text style={styles.preparednessTitle}>Emergency Kit Checklist:</Text>
            <View style={styles.checklist}>
              {[
                'Water (1 gallon per person per day)',
                'Non-perishable food (3-day supply)',
                'Flashlight and extra batteries',
                'First aid kit',
                'Emergency radio',
                'Blankets and warm clothing',
                'Important documents',
                'Cash and credit cards',
                'Medications',
                'Multi-purpose tool',
              ].map((item, index) => (
                <View key={index} style={styles.checklistItem}>
                  <Icon name="check-box-outline-blank" size={20} color={colors.textSecondary} />
                  <Text style={styles.checklistText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </EmergencyCard>

        {/* Additional Resources */}
        <EmergencyCard
          type="info"
          title="Additional Resources"
          description="Links to official emergency resources and information"
          icon="link"
        >
          <View style={styles.resourceLinks}>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.ready.gov')}
            >
              <Icon name="open-in-new" size={20} color={colors.primary} />
              <Text style={styles.resourceLinkText}>Ready.gov - Emergency Preparedness</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.weather.gov')}
            >
              <Icon name="open-in-new" size={20} color={colors.primary} />
              <Text style={styles.resourceLinkText}>National Weather Service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resourceLink}
              onPress={() => Linking.openURL('https://www.redcross.org')}
            >
              <Icon name="open-in-new" size={20} color={colors.primary} />
              <Text style={styles.resourceLinkText}>American Red Cross</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  contactsContainer: {
    marginTop: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  primaryContact: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  primaryContactText: {
    color: colors.error,
  },
  contactPhone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  weatherWarning: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  weatherHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weatherInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  weatherType: {
    ...typography.h4,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  weatherDescription: {
    ...typography.body,
    color: colors.text,
  },
  affectedAreas: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tipsContainer: {
    marginTop: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  tipDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sheltersContainer: {
    marginTop: spacing.sm,
  },
  shelterItem: {
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  shelterName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  shelterAddress: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  shelterCapacity: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  shelterPhone: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  preparednessTips: {
    marginTop: spacing.sm,
  },
  preparednessTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  checklist: {
    marginLeft: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checklistText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  resourceLinks: {
    marginTop: spacing.sm,
  },
  resourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  resourceLinkText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.md,
    flex: 1,
  },
});

export default ResourcesScreen;

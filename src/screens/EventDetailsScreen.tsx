import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import {CommunityEvent} from '../types/index';

const EventDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = () => {
    const {eventId} = route.params as {eventId: string};
    
    // In a real app, this would fetch from a server
    const mockEvent: CommunityEvent = {
      id: eventId,
      title: 'APSAR Training Day',
      description: 'Monthly training session for search and rescue techniques. This comprehensive training covers navigation, first aid, radio communication, and team coordination. Open to all volunteers and community members interested in learning emergency response skills.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      location: 'APSAR Training Center, 123 Emergency Lane, Anaconda, MT',
      type: 'training',
      isRecurring: true,
      contactInfo: '(406) 555-0123',
      maxParticipants: 25,
      currentParticipants: 12,
    };

    setEvent(mockEvent);
  };

  const handleRegister = () => {
    if (!event) return;

    if (isRegistered) {
      Alert.alert(
        'Unregister',
        'Are you sure you want to unregister from this event?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Unregister', onPress: () => setIsRegistered(false)},
        ]
      );
    } else {
      if (event.maxParticipants && (event.currentParticipants || 0) >= event.maxParticipants) {
        Alert.alert('Event Full', 'This event has reached maximum capacity.');
        return;
      }

      Alert.alert(
        'Register for Event',
        `Register for "${event.title}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Register', onPress: () => setIsRegistered(true)},
        ]
      );
    }
  };

  const handleContact = () => {
    if (!event?.contactInfo) return;

    if (event.contactInfo.includes('@')) {
      Linking.openURL(`mailto:${event.contactInfo}`);
    } else {
      Linking.openURL(`tel:${event.contactInfo}`);
    }
  };

  const handleGetDirections = () => {
    if (!event?.location) return;

    const encodedLocation = encodeURIComponent(event.location);
    const url = `https://maps.google.com/maps?q=${encodedLocation}`;
    Linking.openURL(url);
  };

  const handleShare = () => {
    if (!event) return;

    const shareText = `${event.title}\n\n${event.description}\n\nDate: ${event.date.toLocaleDateString()}\nLocation: ${event.location}\n\nFrom APSAR Emergency App`;
    Alert.alert('Share Event', shareText);
  };

  const getEventTypeIcon = (type: CommunityEvent['type']): string => {
    switch (type) {
      case 'training':
        return 'school';
      case 'volunteer':
        return 'volunteer-activism';
      case 'public_event':
        return 'event';
      case 'meeting':
        return 'group';
      default:
        return 'event';
    }
  };

  const getEventTypeColor = (type: CommunityEvent['type']): string => {
    switch (type) {
      case 'training':
        return colors.info;
      case 'volunteer':
        return colors.success;
      case 'public_event':
        return colors.primary;
      case 'meeting':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilEvent = (date: Date): string => {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Event has passed';
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    if (diffInDays < 30) return `In ${Math.ceil(diffInDays / 7)} weeks`;
    
    return `In ${Math.ceil(diffInDays / 30)} months`;
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <EmergencyHeader
          title="Event Details"
          subtitle="Loading..."
          showNotifications={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Event Details"
        subtitle={getTimeUntilEvent(event.date)}
        showNotifications={false}
      />

      <ScrollView style={styles.content}>
        {/* Event Overview */}
        <EmergencyCard
          type="info"
          title={event.title}
          description={event.description}
          icon={getEventTypeIcon(event.type)}
          location={event.location}
        >
          <View style={styles.eventMeta}>
            <StatusIndicator
              status="active"
              label={event.type.replace('_', ' ').toUpperCase()}
              size="medium"
            />
            <Text style={styles.eventDate}>
              {formatDate(event.date)}
            </Text>
          </View>
        </EmergencyCard>

        {/* Event Information */}
        <EmergencyCard
          type="info"
          title="Event Information"
          description="Details about this community event"
          icon="info"
        >
          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={[styles.infoValue, {color: getEventTypeColor(event.type)}]}>
                {event.type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recurring:</Text>
              <Text style={styles.infoValue}>
                {event.isRecurring ? 'Yes' : 'No'}
              </Text>
            </View>
            {event.maxParticipants && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Capacity:</Text>
                <Text style={styles.infoValue}>
                  {event.currentParticipants}/{event.maxParticipants} participants
                </Text>
              </View>
            )}
          </View>
        </EmergencyCard>

        {/* Registration Status */}
        {event.maxParticipants && (
          <EmergencyCard
            type="info"
            title="Registration"
            description="Event registration and capacity information"
            icon="how-to-reg"
          >
            <View style={styles.registrationInfo}>
              <View style={styles.capacityBar}>
                <View 
                  style={[
                    styles.capacityFill,
                    {width: `${(event.currentParticipants / event.maxParticipants) * 100}%`}
                  ]} 
                />
              </View>
              <Text style={styles.capacityText}>
                {event.currentParticipants} of {event.maxParticipants} spots filled
              </Text>
              
              <EmergencyButton
                title={isRegistered ? 'Unregister' : 'Register'}
                icon={<Icon name={isRegistered ? 'person-remove' : 'person-add'} size={20} color={colors.surface} />}
                onPress={handleRegister}
                variant={isRegistered ? 'secondary' : 'success'}
                size="large"
                disabled={!isRegistered && event.currentParticipants >= event.maxParticipants}
              />
            </View>
          </EmergencyCard>
        )}

        {/* Location Information */}
        <EmergencyCard
          type="info"
          title="Location Details"
          description="Get directions to the event location"
          icon="location-on"
        >
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>{event.location}</Text>
            <EmergencyButton
              title="Get Directions"
              icon={<Icon name="directions" size={20} color={colors.surface} />}
              onPress={handleGetDirections}
              variant="secondary"
              size="medium"
            />
          </View>
        </EmergencyCard>

        {/* Contact Information */}
        {event.contactInfo && (
          <EmergencyCard
            type="info"
            title="Contact Information"
            description="Get in touch for questions or more information"
            icon="contact-phone"
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>{event.contactInfo}</Text>
              <EmergencyButton
                title="Contact"
                icon={<Icon name={event.contactInfo.includes('@') ? 'email' : 'phone'} size={20} color={colors.surface} />}
                onPress={handleContact}
                variant="primary"
                size="medium"
              />
            </View>
          </EmergencyCard>
        )}

        {/* Event Actions */}
        <EmergencyCard
          type="info"
          title="Event Actions"
          description="Additional actions for this event"
          icon="more-horiz"
        >
          <View style={styles.actionsContainer}>
            <EmergencyButton
              title="Share Event"
              icon={<Icon name="share" size={20} color={colors.surface} />}
              onPress={handleShare}
              variant="secondary"
              size="large"
              style={styles.actionButton}
            />
            
            <EmergencyButton
              title="Add to Calendar"
              icon={<Icon name="event" size={20} color={colors.surface} />}
              onPress={() => Alert.alert('Calendar', 'This would add the event to your calendar.')}
              variant="info"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </EmergencyCard>

        {/* Event Guidelines */}
        <EmergencyCard
          type="info"
          title="Event Guidelines"
          description="Important information for event participants"
          icon="rule"
        >
          <View style={styles.guidelines}>
            <View style={styles.guideline}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>
                Arrive 15 minutes early for check-in
              </Text>
            </View>
            <View style={styles.guideline}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>
                Bring appropriate clothing and equipment
              </Text>
            </View>
            <View style={styles.guideline}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>
                Follow all safety instructions
              </Text>
            </View>
            <View style={styles.guideline}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>
                Notify organizers if you cannot attend
              </Text>
            </View>
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
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  eventDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  eventInfo: {
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  registrationInfo: {
    marginTop: spacing.sm,
  },
  capacityBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  capacityFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  capacityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  locationInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  locationText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  contactInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  contactText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    marginVertical: spacing.xs,
  },
  guidelines: {
    marginTop: spacing.sm,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  guidelineText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
});

export default EventDetailsScreen;

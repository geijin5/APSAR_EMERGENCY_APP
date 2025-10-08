import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmergencyHeader from '../components/EmergencyHeader';
import EmergencyCard from '../components/EmergencyCard';
import EmergencyButton from '../components/EmergencyButton';
import {colors, typography, spacing} from '../utils/theme';
import {CommunityEvent} from '../types/index';

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | CommunityEvent['type']>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    // In a real app, this would fetch from a server
    const mockEvents: CommunityEvent[] = [
      {
        id: '1',
        title: 'APSAR Training Day',
        description: 'Monthly training session for search and rescue techniques. Open to all volunteers.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        location: 'APSAR Training Center, Anaconda',
        type: 'training',
        isRecurring: true,
        contactInfo: '(406) 555-0123',
        maxParticipants: 25,
        currentParticipants: 12,
      },
      {
        id: '2',
        title: 'Community Safety Fair',
        description: 'Learn about emergency preparedness, first aid, and outdoor safety.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        location: 'Anaconda Community Center',
        type: 'public_event',
        isRecurring: false,
        contactInfo: 'info@apsar.org',
      },
      {
        id: '3',
        title: 'Volunteer Recruitment Drive',
        description: 'Join APSAR as a volunteer! No experience necessary - we provide training.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        location: 'Online Event',
        type: 'volunteer',
        isRecurring: false,
        contactInfo: 'volunteer@apsar.org',
      },
      {
        id: '4',
        title: 'Monthly Team Meeting',
        description: 'Regular team meeting to discuss operations, training, and upcoming events.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: 'APSAR Headquarters',
        type: 'meeting',
        isRecurring: true,
        contactInfo: 'admin@apsar.org',
        maxParticipants: 50,
        currentParticipants: 35,
      },
    ];
    setEvents(mockEvents);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.type === selectedCategory
  );

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
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    
    return date.toLocaleDateString();
  };

  const handleEventPress = (event: CommunityEvent) => {
    navigation.navigate('EventDetails' as any, {eventId: event.id});
  };

  const handleContact = (contactInfo: string) => {
    if (contactInfo.includes('@')) {
      // Email
      Linking.openURL(`mailto:${contactInfo}`);
    } else {
      // Phone
      Linking.openURL(`tel:${contactInfo}`);
    }
  };

  const handleDonation = () => {
    // In a real app, this would open a donation page
    Linking.openURL('https://apsar.org/donate');
  };

  const handleVolunteer = () => {
    // In a real app, this would open a volunteer application
    Linking.openURL('https://apsar.org/volunteer');
  };

  return (
    <View style={styles.container}>
      <EmergencyHeader
        title="Community Hub"
        subtitle="Events, training, and volunteer opportunities"
      />

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <EmergencyButton
          title="Become a Volunteer"
          icon={<Icon name="volunteer-activism" size={20} color={colors.surface} />}
          onPress={handleVolunteer}
          variant="success"
          size="large"
          style={styles.quickActionButton}
        />
        <EmergencyButton
          title="Support APSAR"
          icon={<Icon name="favorite" size={20} color={colors.surface} />}
          onPress={handleDonation}
          variant="primary"
          size="large"
          style={styles.quickActionButton}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'training', 'volunteer', 'public_event', 'meeting'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, selectedCategory === category && styles.activeFilterButton]}
              onPress={() => setSelectedCategory(category)}
            >
              <Icon 
                name={getEventTypeIcon(category as CommunityEvent['type'])} 
                size={16} 
                color={selectedCategory === category ? colors.surface : colors.primary} 
              />
              <Text style={[styles.filterText, selectedCategory === category && styles.activeFilterText]}>
                {category === 'all' ? 'All' : category.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* About APSAR */}
      <View style={styles.aboutSection}>
        <EmergencyCard
          type="info"
          title="About APSAR"
          description="Anaconda Pintler Search and Rescue is a volunteer organization dedicated to saving lives and serving our community. We provide search and rescue services, emergency response, and community safety education."
          icon="info"
        >
          <View style={styles.aboutStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Volunteers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>200+</Text>
              <Text style={styles.statLabel}>Rescues</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>
        </EmergencyCard>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="event" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptyDescription}>
              Check back later for upcoming community events and training sessions.
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <EmergencyCard
              key={event.id}
              title={event.title}
              description={event.description}
              type="info"
              icon={getEventTypeIcon(event.type)}
              location={event.location}
              onPress={() => handleEventPress(event)}
            >
              <View style={styles.eventFooter}>
                <View style={styles.eventMeta}>
                  <View style={[styles.eventTypeIndicator, {backgroundColor: getEventTypeColor(event.type)}]} />
                  <Text style={styles.eventType}>{event.type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                </View>
                
                {event.maxParticipants && (
                  <Text style={styles.participants}>
                    {event.currentParticipants}/{event.maxParticipants} participants
                  </Text>
                )}
                
                {event.contactInfo && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContact(event.contactInfo!)}
                  >
                    <Icon 
                      name={event.contactInfo.includes('@') ? 'email' : 'phone'} 
                      size={16} 
                      color={colors.primary} 
                    />
                    <Text style={styles.contactText}>Contact</Text>
                  </TouchableOpacity>
                )}
              </View>
            </EmergencyCard>
          ))
        )}

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Support APSAR</Text>
          
          <EmergencyCard
            type="success"
            title="Volunteer Opportunities"
            description="Join our dedicated team of volunteers. Training provided, no experience necessary."
            icon="volunteer-activism"
          >
            <EmergencyButton
              title="Apply to Volunteer"
              onPress={handleVolunteer}
              variant="success"
              size="medium"
            />
          </EmergencyCard>

          <EmergencyCard
            type="info"
            title="Donate to APSAR"
            description="Your support helps us maintain equipment, provide training, and save lives in our community."
            icon="favorite"
          >
            <EmergencyButton
              title="Make a Donation"
              onPress={handleDonation}
              variant="primary"
              size="medium"
            />
          </EmergencyCard>

          <EmergencyCard
            type="warning"
            title="Emergency Contact"
            description="For emergency situations, call 911. For non-emergency APSAR matters, contact us at (406) 555-0123."
            icon="call"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickActionsSection: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  filterSection: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  activeFilterText: {
    color: colors.surface,
  },
  aboutSection: {
    paddingHorizontal: spacing.sm,
  },
  aboutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  eventFooter: {
    marginTop: spacing.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  eventType: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginRight: spacing.md,
  },
  eventDate: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  participants: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  contactText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
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
  supportSection: {
    paddingHorizontal: spacing.sm,
    marginTop: spacing.lg,
  },
});

export default CommunityScreen;

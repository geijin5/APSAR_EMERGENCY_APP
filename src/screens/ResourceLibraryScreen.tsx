import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Searchbar,
  ActivityIndicator,
  Menu,
  IconButton,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../services/ApiService';
import {Resource, ResourceCategory} from '../types/index';
import {colors, spacing, typography} from '../utils/theme';
import {useAuth} from '../contexts/AuthContext';

const ResourceLibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const {isOfficer, isAdmin} = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadResources();
  }, [filterCategory]);

  const loadResources = async () => {
    try {
      const filters: any = {};
      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      const data = await apiService.getResources(filters);
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadResources();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce search - reload when user stops typing
    setTimeout(() => {
      if (searchQuery === query) {
        loadResources();
      }
    }, 500);
  };

  const getCategoryIcon = (category: ResourceCategory): string => {
    switch (category) {
      case 'maps':
        return 'map';
      case 'sops':
        return 'description';
      case 'manuals':
        return 'menu-book';
      case 'videos':
        return 'video-library';
      case 'forms':
        return 'assignment';
      case 'reference':
        return 'library-books';
      default:
        return 'folder';
    }
  };

  const getFileTypeIcon = (fileType?: string): string => {
    switch (fileType) {
      case 'pdf':
        return 'picture-as-pdf';
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'link':
        return 'link';
      default:
        return 'insert-drive-file';
    }
  };

  const handleResourcePress = async (resource: Resource) => {
    if (resource.externalUrl) {
      await Linking.openURL(resource.externalUrl);
    } else if (resource.fileUrl) {
      try {
        const blob = await apiService.downloadResource(resource.id);
        // Handle file download based on platform
        // For React Native, you'd typically use a file viewer or download manager
        console.log('Download resource:', resource.id);
      } catch (error) {
        console.error('Failed to download resource:', error);
      }
    }
  };

  const categories: {label: string; value: string}[] = [
    {label: 'All Categories', value: 'all'},
    {label: 'Maps', value: 'maps'},
    {label: 'SOPs', value: 'sops'},
    {label: 'Manuals', value: 'manuals'},
    {label: 'Videos', value: 'videos'},
    {label: 'Forms', value: 'forms'},
    {label: 'Reference', value: 'reference'},
    {label: 'Other', value: 'other'},
  ];

  const filteredResources = resources.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const renderResource = ({item}: {item: Resource}) => (
    <TouchableOpacity onPress={() => handleResourcePress(item)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Icon
                name={getCategoryIcon(item.category)}
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <Title style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                  {item.isPinned && (
                    <Icon name="push-pin" size={16} color={colors.primary} style={styles.pinIcon} />
                  )}
                </Title>
              </View>
              {item.description && (
                <Paragraph style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Paragraph>
              )}
              <View style={styles.metaRow}>
                <Chip
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                  icon={() => (
                    <Icon
                      name={getFileTypeIcon(item.fileType)}
                      size={14}
                      color={colors.textSecondary}
                    />
                  )}
                >
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Chip>
                {item.downloadCount !== undefined && item.downloadCount > 0 && (
                  <Paragraph style={styles.downloadCount}>
                    <Icon name="download" size={14} color={colors.textSecondary} />{' '}
                    {item.downloadCount}
                  </Paragraph>
                )}
              </View>
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor={colors.textSecondary}
              style={styles.chevron}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search resources..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          onIconPress={loadResources}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.filterButton}
            >
              <Icon name="filter-list" size={24} color={colors.primary} />
            </TouchableOpacity>
          }
        >
          {categories.map(cat => (
            <Menu.Item
              key={cat.value}
              onPress={() => {
                setFilterCategory(cat.value);
                setMenuVisible(false);
              }}
              title={cat.label}
              titleStyle={filterCategory === cat.value ? styles.selectedFilter : undefined}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filteredResources}
        renderItem={renderResource}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="folder-open" size={64} color={colors.textSecondary} />
            <Paragraph style={styles.emptyText}>No resources found</Paragraph>
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: spacing.sm,
  },
  filterButton: {
    padding: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h4,
    flex: 1,
  },
  pinIcon: {
    marginLeft: spacing.xs,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryChip: {
    height: 24,
    marginRight: spacing.sm,
  },
  categoryChipText: {
    fontSize: 11,
  },
  downloadCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  tagChip: {
    height: 22,
    marginRight: spacing.xs,
    marginTop: spacing.xs,
    backgroundColor: colors.lightGray,
  },
  tagText: {
    fontSize: 10,
    color: colors.text,
  },
  chevron: {
    margin: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  selectedFilter: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ResourceLibraryScreen;



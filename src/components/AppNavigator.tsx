import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography} from '../utils/theme';
import {NavigationParams} from '../types/index';
import {useAuth} from '../contexts/AuthContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';
import ReportDetailsScreen from '../screens/ReportDetailsScreen';
import AlertDetailsScreen from '../screens/AlertDetailsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
// Personnel screens
import PersonnelDashboardScreen from '../screens/PersonnelDashboardScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import CallOutListScreen from '../screens/CallOutListScreen';
import CallOutDetailsScreen from '../screens/CallOutDetailsScreen';
import SARMissionListScreen from '../screens/SARMissionListScreen';
import SARMissionDetailsScreen from '../screens/SARMissionDetailsScreen';
import IncidentListScreen from '../screens/IncidentListScreen';
import IncidentDetailsScreen from '../screens/IncidentDetailsScreen';
// New feature screens
import VehicleListScreen from '../screens/VehicleListScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import EquipmentListScreen from '../screens/EquipmentListScreen';
import ChecklistListScreen from '../screens/ChecklistListScreen';
import ResourceLibraryScreen from '../screens/ResourceLibraryScreen';
import CalloutReportFormScreen from '../screens/CalloutReportFormScreen';
import CalloutReportReviewScreen from '../screens/CalloutReportReviewScreen';

const Tab = createBottomTabNavigator<NavigationParams>();
const Stack = createStackNavigator<NavigationParams>();

const MainTabNavigator: React.FC = () => {
  const {isAdmin, isOfficer, isMember} = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Map':
              iconName = 'map';
              break;
            case 'Alerts':
              iconName = 'notifications';
              break;
            case 'Reports':
              iconName = 'report-problem';
              break;
            case 'Community':
              iconName = 'people';
              break;
            case 'Resources':
              iconName = 'local-hospital';
              break;
            case 'Admin':
              iconName = 'admin-panel-settings';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.mediumGray,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          ...typography.h4,
          color: colors.surface,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'APSAR Emergency',
          headerTitle: 'APSAR Emergency',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Emergency Map',
          headerTitle: 'Emergency Map',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          headerTitle: 'Emergency Alerts',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Report',
          headerTitle: 'Emergency Reports',
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: 'Community',
          headerTitle: 'Community Hub',
        }}
      />
      <Tab.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{
          title: 'Resources',
          headerTitle: 'Emergency Resources',
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: 'Admin',
            headerTitle: 'Admin Dashboard',
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const {isAuthenticated} = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Main' : 'Login'}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          ...typography.h4,
          color: colors.surface,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ReportDetails"
        component={ReportDetailsScreen}
        options={{
          title: 'Report Details',
          headerTitle: 'Report Details',
        }}
      />
      <Stack.Screen
        name="AlertDetails"
        component={AlertDetailsScreen}
        options={{
          title: 'Alert Details',
          headerTitle: 'Alert Details',
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          title: 'Event Details',
          headerTitle: 'Event Details',
        }}
      />
      {/* Personnel Screens */}
      <Stack.Screen
        name="PersonnelDashboard"
        component={PersonnelDashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'Personnel Dashboard',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          title: 'Chat',
          headerTitle: 'Internal Chat',
        }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={{
          title: 'Chat Room',
          headerTitle: 'Chat Room',
        }}
      />
      <Stack.Screen
        name="CallOuts"
        component={CallOutListScreen}
        options={{
          title: 'Call-Outs',
          headerTitle: 'Call-Outs',
        }}
      />
      <Stack.Screen
        name="CallOutDetails"
        component={CallOutDetailsScreen}
        options={{
          title: 'Call-Out Details',
          headerTitle: 'Call-Out Details',
        }}
      />
      <Stack.Screen
        name="SARMissions"
        component={SARMissionListScreen}
        options={{
          title: 'SAR Missions',
          headerTitle: 'SAR Missions',
        }}
      />
      <Stack.Screen
        name="SARMissionDetails"
        component={SARMissionDetailsScreen}
        options={{
          title: 'SAR Mission Details',
          headerTitle: 'SAR Mission Details',
        }}
      />
      <Stack.Screen
        name="Incidents"
        component={IncidentListScreen}
        options={{
          title: 'Incidents',
          headerTitle: 'Incidents',
        }}
      />
      <Stack.Screen
        name="IncidentDetails"
        component={IncidentDetailsScreen}
        options={{
          title: 'Incident Details',
          headerTitle: 'Incident Details',
        }}
      />
      {/* New feature screens */}
      <Stack.Screen
        name="Vehicles"
        component={VehicleListScreen}
        options={{
          title: 'Vehicles',
          headerTitle: 'Vehicle Management',
        }}
      />
      <Stack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
        options={{
          title: 'Vehicle Details',
          headerTitle: 'Vehicle Details',
        }}
      />
      <Stack.Screen
        name="Equipment"
        component={EquipmentListScreen}
        options={{
          title: 'Equipment',
          headerTitle: 'Equipment Management',
        }}
      />
      <Stack.Screen
        name="Checklists"
        component={ChecklistListScreen}
        options={{
          title: 'Checklists',
          headerTitle: 'Checklists',
        }}
      />
      <Stack.Screen
        name="ResourceLibrary"
        component={ResourceLibraryScreen}
        options={{
          title: 'Resources',
          headerTitle: 'Resource Library',
        }}
      />
      <Stack.Screen
        name="CalloutReportForm"
        component={CalloutReportFormScreen}
        options={{
          title: 'Callout Report',
          headerTitle: 'Callout Report',
        }}
      />
      <Stack.Screen
        name="CalloutReportReview"
        component={CalloutReportReviewScreen}
        options={{
          title: 'Review Report',
          headerTitle: 'Review Callout Report',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

# APSAR Emergency App

A comprehensive emergency mobile application for the Anaconda Pintler Search and Rescue (APSAR) organization. This app provides real-time emergency information, alerts, and community resources to help keep the public informed and safe during emergencies, search operations, and community events.

## 🚨 Features

### Core Functionality
- **Interactive Emergency Map** - Real-time zones, search areas, detours, and road closures
- **Live Alerts & Notifications** - Push notifications for emergency updates and warnings
- **Emergency Reporting** - Report missing persons, hazards, or emergency sightings
- **Community Hub** - Events, training, and volunteer opportunities
- **Emergency Resources** - Quick access to contacts, first aid, and shelter locations
- **Admin Dashboard** - APSAR team management interface

### Emergency-Style Design
- Professional red, orange, and dark gray color scheme
- High-contrast colors for accessibility
- Large fonts and clear typography
- Voice-over support ready
- Clean, modern interface similar to FEMA/NOAA apps

## 🏗️ Technical Architecture

### Built With
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation system
- **React Native Maps** - Interactive mapping
- **React Native Paper** - Material Design components
- **AsyncStorage** - Local data persistence
- **Push Notifications** - Real-time alerts

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AppNavigator.tsx
│   ├── EmergencyButton.tsx
│   ├── EmergencyCard.tsx
│   ├── EmergencyHeader.tsx
│   └── StatusIndicator.tsx
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── AlertsScreen.tsx
│   ├── ReportsScreen.tsx
│   ├── CommunityScreen.tsx
│   ├── ResourcesScreen.tsx
│   ├── AdminScreen.tsx
│   └── [Detail]Screens.tsx
├── services/           # Business logic and API
│   ├── AppService.ts
│   ├── LocationService.ts
│   ├── MapService.ts
│   └── NotificationService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utilities and theme
│   └── theme.ts
└── App.tsx             # Main app component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apsar-emergency-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start the Metro bundler**
   ```bash
   npm start
   ```

5. **Run the app**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

### Environment Configuration

Create a `.env` file in the root directory:
```env
# API Configuration
API_BASE_URL=https://api.apsar.org
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Push Notifications
FCM_SERVER_KEY=your_fcm_server_key

# Emergency Services
EMERGENCY_PHONE_NUMBER=911
APSAR_PHONE_NUMBER=(406) 555-0123
```

## 📱 App Features

### Interactive Map
- **Real-time Zones**: Search areas, restricted zones, detours
- **Color-coded Overlays**: Red (restricted), Yellow (caution), Green (clear)
- **GPS Tracking**: Current location with automatic updates
- **Directions**: Safe alternate routes around emergency areas

### Alerts System
- **Push Notifications**: Emergency updates and warnings
- **Filtering**: By type (search, weather, traffic, events)
- **Priority Levels**: High, medium, low priority alerts
- **Read Status**: Track which alerts have been viewed

### Emergency Reporting
- **Report Types**: Missing persons, hazards, emergency sightings
- **Location Pins**: Automatic GPS location capture
- **Photo Upload**: Up to 3 photos per report
- **Contact Info**: Optional reporter information
- **Status Tracking**: Pending, investigating, resolved

### Community Hub
- **Events**: Training sessions, public events, meetings
- **Volunteer Opportunities**: Join APSAR as a volunteer
- **Registration**: Sign up for events with capacity limits
- **Donation Links**: Support APSAR financially

### Emergency Resources
- **Quick Contacts**: 911, APSAR, police, fire, medical
- **Weather Warnings**: Real-time weather alerts
- **First Aid Tips**: Basic emergency medical information
- **Shelter Locations**: Emergency shelter information
- **Preparedness**: Emergency kit checklists

### Admin Dashboard
- **Zone Management**: Create and manage emergency zones
- **Alert Creation**: Send alerts to all users
- **Report Management**: Update report status and investigations
- **Analytics**: Overview of system activity

## 🔧 Configuration

### Map Configuration
The app uses Google Maps for mapping functionality. Configure your API key in the environment variables and ensure the following APIs are enabled:
- Maps SDK for Android
- Maps SDK for iOS
- Places API
- Directions API

### Push Notifications
Configure Firebase Cloud Messaging (FCM) for push notifications:
1. Create a Firebase project
2. Add your app to the project
3. Download configuration files
4. Set up FCM server key

### Permissions
The app requires the following permissions:
- **Location**: Fine and coarse location access
- **Camera**: Photo capture for reports
- **Storage**: Save images and offline data
- **Notifications**: Push notification delivery

## 🎨 Design System

### Color Palette
- **Primary Red**: `#D32F2F` - Emergency red
- **Warning Orange**: `#FF6F00` - Caution orange
- **Dark Gray**: `#424242` - Accent gray
- **Success Green**: `#4CAF50` - Clear/safe areas
- **Info Blue**: `#2196F3` - Information

### Typography
- **Headers**: Bold, large fonts for important information
- **Body**: Readable, medium-sized text
- **Emergency Text**: High-contrast, bold styling
- **Captions**: Smaller text for metadata

### Accessibility
- High-contrast color combinations
- Large touch targets (minimum 44px)
- Voice-over support
- Screen reader compatibility
- Keyboard navigation support

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests (with Detox)
npm run e2e

# Linting
npm run lint
```

### Test Coverage
- Component rendering tests
- Service logic tests
- Navigation flow tests
- Accessibility tests

## 📦 Building for Production

### Android
```bash
# Generate signed APK
npm run build:android
```

### iOS
```bash
# Build for App Store
npm run build:ios
```

## 🚀 Deployment

### App Store Deployment
1. **Android (Google Play)**
   - Generate signed APK/AAB
   - Upload to Google Play Console
   - Configure store listing and screenshots

2. **iOS (App Store)**
   - Archive the app in Xcode
   - Upload to App Store Connect
   - Submit for review

### Backend Integration
The app is designed to work with a REST API backend. Key endpoints include:
- `/api/zones` - Map zones and overlays
- `/api/alerts` - Emergency alerts
- `/api/reports` - Emergency reports
- `/api/events` - Community events
- `/api/contacts` - Emergency contacts

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use the established design system
3. Write tests for new features
4. Follow accessibility guidelines
5. Update documentation

### Code Style
- Use ESLint and Prettier
- Follow React Native conventions
- Use meaningful variable names
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Emergency Support
- **911** - For life-threatening emergencies
- **APSAR**: (406) 555-0123 - For search and rescue
- **App Support**: support@apsar.org

### Technical Support
- **Documentation**: [docs.apsar.org](https://docs.apsar.org)
- **Issues**: GitHub Issues
- **Email**: tech@apsar.org

## 🙏 Acknowledgments

- Anaconda Pintler Search and Rescue team
- React Native community
- Open source contributors
- Local emergency services

---

**APSAR Emergency App** - Keeping our community safe and informed. 🚨

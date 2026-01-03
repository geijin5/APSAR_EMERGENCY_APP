# APSAR Emergency Operations Management System

A comprehensive Search & Rescue operations management system for Anaconda Pintler Search and Rescue (APSAR), supporting equipment and vehicle tracking, training certifications, operational checklists, callout reporting, internal communications, and notifications.

## Features

### 🔐 Role-Based Access Control (RBAC)

Three permission levels with granular access control:

- **Admin**: Full access to all features, user management, system settings
- **Officer**: View all data, create/edit most records, approve reports, assign tasks
- **Member**: Limited access to assigned resources, complete checklists, submit reports

### 🚗 Vehicle Maintenance Tracking

- Vehicle profiles with unit numbers, types, mileage, and status
- Maintenance logs with service history
- Scheduled maintenance reminders with automatic notifications
- Document and photo uploads for service records
- Maintenance due/overdue alerts

### 📦 Equipment Management

- Comprehensive equipment inventory (medical, rope, comms, navigation, safety, tools)
- Assignment tracking to team members
- Inspection schedules with automated reminders
- Condition status tracking (Ready / Needs Service / Out of Service)
- Expiration tracking for time-sensitive items
- Alerts for inspections and expirations

### 🎓 Training & Certifications

- Member training records and history
- Certification tracking with expiration dates
- Certificate upload and storage
- Automatic expiration reminders (30-day warning)
- Officer/Admin approval workflow
- Training hour tracking

### ✅ Checklists (Digital + Printable)

- Custom checklist templates for:
  - Callouts
  - Vehicle checks
  - Equipment checks
  - Training events
  - General operations
- Assignable to members or teams
- Completion tracking with timestamps and signatures
- **Offline completion** with sync when online
- Print-friendly layout
- One-click PDF export
- Version control for templates
- Admin/Officer ability to lock templates

### 📚 Resource Library

- Searchable resource section containing:
  - Maps (PDFs, images, GIS links)
  - SOPs & documentation
  - Training manuals
  - Embedded or uploaded videos
  - Forms and reference materials
- Categorization and tagging
- Role-based access control
- Download tracking

### 💬 Internal Chat System

- Group chat and direct messaging
- Push notifications for new messages
- Read receipts
- Message history
- Admin/Officer moderation controls

### 🔔 Notifications System

Send push, email, SMS, and in-app notifications for:
- Chat messages
- Maintenance due/overdue
- Equipment inspections
- Training or certification expirations
- New callouts
- Checklist assignments
- Report approvals/rejections

### 📋 Callout Reporting

- Create callout records after each mission
- Individual member reports with:
  - Date & time
  - Incident type
  - Location (GPS coordinates)
  - Role on scene
  - Equipment used
  - Notes and observations
  - Photo/file attachments
- Officer/Admin review and approval workflow
- Export reports (PDF/CSV)

### 🗺️ Additional Features

- SAR Mission management
- Incident tracking
- Map zones and alerts
- Emergency reporting
- Community events
- Audit logs for critical changes

## Technical Architecture

### Frontend

- **Mobile App**: React Native (iOS & Android)
- **Web Platform**: React Native Web (responsive design)
- **UI Framework**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Storage**: Encrypted storage for sensitive data
- **Offline Support**: Local storage with sync

### Backend (To Be Implemented)

- **API**: RESTful API with role-based endpoints
- **Authentication**: JWT tokens with refresh tokens
- **Database**: PostgreSQL with JSONB support
- **File Storage**: Cloud storage for documents/photos
- **Push Notifications**: Firebase Cloud Messaging / APNs
- **Audit Logging**: Comprehensive audit trail

### Security

- Encrypted data storage
- Secure authentication with 2FA support (optional)
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- Audit logs for compliance

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppNavigator.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── screens/            # Screen components
│   ├── VehicleListScreen.tsx
│   ├── VehicleDetailsScreen.tsx
│   ├── EquipmentListScreen.tsx
│   ├── ChecklistListScreen.tsx
│   └── ...
├── services/           # API and service layers
│   ├── ApiService.ts
│   ├── AuthService.ts
│   └── ...
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utilities and theme
    └── theme.ts

docs/
├── DATABASE_SCHEMA.md  # Complete database schema
└── API_ENDPOINTS.md    # API endpoint documentation
```

## Database Schema

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete database schema documentation.

Key tables:
- `users` - User accounts and authentication
- `vehicles` - Vehicle profiles
- `maintenance_logs` - Maintenance records
- `equipment` - Equipment inventory
- `equipment_inspections` - Inspection records
- `certifications` - Member certifications
- `training_records` - Training history
- `checklist_templates` - Reusable checklist templates
- `checklists` - Checklist instances
- `resources` - Resource library items
- `callout_reports` - Individual callout reports
- `notifications` - User notifications
- `audit_logs` - Audit trail

## API Endpoints

See [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) for complete API documentation.

### Example Endpoints

- `GET /api/vehicles` - Get all vehicles
- `GET /api/equipment` - Get equipment inventory
- `GET /api/checklists` - Get checklists
- `GET /api/certifications` - Get certifications
- `POST /api/callout-reports` - Create callout report
- And many more...

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- React Native development environment
- For mobile: iOS (Xcode) or Android (Android Studio)
- For web: Modern web browser

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env with your API URL
   API_BASE_URL=https://api.anaconda-deerlodge-emergency.gov
   ```

4. For iOS:
   ```bash
   cd ios && pod install && cd ..
   ```

5. Run the app:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Start Metro bundler
   npm start
   ```

## 🚀 Deployment

### Quick Deploy to Render

See [README_DEPLOYMENT.md](README_DEPLOYMENT.md) for quick start guide.

### Full Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions including:
- Backend API deployment to Render
- Android APK builds via GitHub Actions
- Production setup and configuration

## Design Principles

### UX/UI

- **Clean, professional emergency-services design**
- **Dark mode support** (coming soon)
- **Large, touch-friendly buttons** for field use
- **Clear status indicators** (green/yellow/red)
- **Fast, intuitive navigation**
- **Offline-first** approach for field reliability

### Accessibility

- High contrast mode support
- Large text options
- VoiceOver support
- Screen reader compatibility

## Development Status

### ✅ Completed

- [x] Role system update (Admin/Officer/Member)
- [x] Comprehensive TypeScript types
- [x] Database schema design
- [x] API service layer (all endpoints defined)
- [x] API endpoint documentation
- [x] Vehicle Management screens (List & Details)
- [x] Equipment Management screens (List)
- [x] Checklist List screen
- [x] Navigation structure
- [x] Authentication service
- [x] Theme system

### 🚧 In Progress / To Do

- [ ] Complete Equipment Details screen
- [ ] Checklist Details & Template screens
- [ ] Training & Certifications screens
- [ ] Resource Library screens
- [ ] Enhanced Callout Reports screens
- [ ] Web platform UI
- [ ] Backend API implementation
- [ ] Offline sync implementation
- [ ] Push notification setup
- [ ] PDF export functionality
- [ ] Dark mode implementation
- [ ] Unit and integration tests
- [ ] Performance optimization

## Sample Data

The system includes sample data structures for APSAR operations. See the type definitions in `src/types/index.ts` for reference.

## Contributing

This is an internal system for APSAR. For contributions, please follow:
1. Code review process
2. Testing requirements
3. Documentation standards
4. Security guidelines

## License

Proprietary - Internal use only for Anaconda Pintler Search and Rescue

## Support

For technical support or questions, contact the development team.

---

**Built with ❤️ for Anaconda Pintler Search and Rescue**



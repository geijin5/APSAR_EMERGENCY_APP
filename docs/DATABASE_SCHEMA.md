# APSAR Emergency App - Database Schema

## Overview
This document describes the database schema for the Anaconda Pintler Search and Rescue operations management system.

## Tables

### users
Stores user accounts and authentication information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE | Email address |
| phone | VARCHAR(20) | | Phone number |
| password_hash | VARCHAR(255) | NOT NULL | Encrypted password |
| role | ENUM('admin', 'officer', 'member') | NOT NULL | User role |
| badge_number | VARCHAR(50) | | Badge/ID number |
| unit | VARCHAR(100) | | Unit/team name |
| is_active | BOOLEAN | DEFAULT true | Account status |
| two_factor_secret | VARCHAR(255) | | 2FA secret if enabled |
| two_factor_enabled | BOOLEAN | DEFAULT false | 2FA status |
| last_login_at | TIMESTAMP | | Last login timestamp |
| preferences | JSONB | | User preferences (notifications, etc.) |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- email (unique)
- role
- is_active

---

### vehicles
Stores vehicle profiles and information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique vehicle identifier |
| unit_number | VARCHAR(50) | UNIQUE NOT NULL | Vehicle unit number |
| type | ENUM | NOT NULL | Vehicle type (truck, atv, snowmobile, boat, trailer, other) |
| make | VARCHAR(100) | | Manufacturer |
| model | VARCHAR(100) | | Model name |
| year | INTEGER | | Year manufactured |
| vin | VARCHAR(50) | | Vehicle identification number |
| license_plate | VARCHAR(20) | | License plate |
| current_mileage | INTEGER | | Current mileage |
| status | ENUM | NOT NULL | Status (ready, in_service, maintenance, out_of_service) |
| notes | TEXT | | Additional notes |
| created_by | UUID | FK → users.id | Creator user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- unit_number (unique)
- status
- type

---

### maintenance_logs
Stores vehicle maintenance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log identifier |
| vehicle_id | UUID | FK → vehicles.id NOT NULL | Vehicle reference |
| type | VARCHAR(50) | NOT NULL | Maintenance type |
| description | TEXT | NOT NULL | Maintenance description |
| mileage | INTEGER | | Mileage at maintenance |
| cost | DECIMAL(10,2) | | Maintenance cost |
| performed_by | UUID | FK → users.id | Performer user ID |
| performed_at | TIMESTAMP | NOT NULL | When maintenance was performed |
| next_due_mileage | INTEGER | | Next due mileage |
| next_due_date | DATE | | Next due date |
| documents | JSONB | | Array of document URLs |
| created_by | UUID | FK → users.id | Creator user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- vehicle_id
- performed_at
- next_due_date

---

### equipment
Stores equipment inventory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique equipment identifier |
| name | VARCHAR(255) | NOT NULL | Equipment name |
| category | ENUM | NOT NULL | Category (medical, rope, comms, navigation, safety, tools, other) |
| serial_number | VARCHAR(100) | | Serial number |
| manufacturer | VARCHAR(100) | | Manufacturer |
| model | VARCHAR(100) | | Model |
| condition | ENUM | NOT NULL | Condition (ready, needs_service, out_of_service) |
| status | ENUM | NOT NULL | Status (available, assigned, in_use, maintenance, retired) |
| assigned_to | UUID | FK → users.id | Assigned user ID |
| location | VARCHAR(255) | | Storage location |
| expiration_date | DATE | | Expiration date (if applicable) |
| last_inspection_date | DATE | | Last inspection date |
| next_inspection_date | DATE | | Next inspection date |
| inspection_frequency | INTEGER | | Days between inspections |
| notes | TEXT | | Additional notes |
| photos | JSONB | | Array of photo URLs |
| created_by | UUID | FK → users.id | Creator user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- category
- status
- assigned_to
| next_inspection_date
| expiration_date

---

### equipment_inspections
Stores equipment inspection records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique inspection identifier |
| equipment_id | UUID | FK → equipment.id NOT NULL | Equipment reference |
| inspected_by | UUID | FK → users.id NOT NULL | Inspector user ID |
| inspected_at | TIMESTAMP | NOT NULL | Inspection timestamp |
| condition | ENUM | NOT NULL | Condition after inspection |
| notes | TEXT | | Inspection notes |
| photos | JSONB | | Array of photo URLs |
| next_inspection_date | DATE | | Calculated next inspection date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- equipment_id
- inspected_at

---

### equipment_assignments
Tracks equipment assignments to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique assignment identifier |
| equipment_id | UUID | FK → equipment.id NOT NULL | Equipment reference |
| assigned_to | UUID | FK → users.id NOT NULL | Assigned user ID |
| assigned_by | UUID | FK → users.id | Assigner user ID |
| assigned_at | TIMESTAMP | NOT NULL | Assignment timestamp |
| returned_at | TIMESTAMP | | Return timestamp |
| notes | TEXT | | Assignment notes |

**Indexes:**
- equipment_id
- assigned_to
- assigned_at

---

### certifications
Stores member certifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique certification identifier |
| user_id | UUID | FK → users.id NOT NULL | User reference |
| type | ENUM | NOT NULL | Certification type |
| name | VARCHAR(255) | NOT NULL | Certification name |
| issuer | VARCHAR(255) | | Issuing organization |
| certificate_number | VARCHAR(100) | | Certificate number |
| issued_date | DATE | NOT NULL | Issue date |
| expiration_date | DATE | | Expiration date |
| certificate_url | VARCHAR(500) | | URL to certificate file |
| notes | TEXT | | Additional notes |
| approved_by | UUID | FK → users.id | Approver user ID |
| approved_at | TIMESTAMP | | Approval timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- user_id
- expiration_date
- type

---

### training_records
Stores training history for members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique record identifier |
| user_id | UUID | FK → users.id NOT NULL | User reference |
| title | VARCHAR(255) | NOT NULL | Training title |
| description | TEXT | | Training description |
| type | VARCHAR(50) | | Training type |
| completed_date | DATE | NOT NULL | Completion date |
| instructor | VARCHAR(255) | | Instructor name |
| hours | DECIMAL(5,2) | | Training hours |
| certificate_url | VARCHAR(500) | | URL to certificate |
| notes | TEXT | | Additional notes |
| created_by | UUID | FK → users.id | Creator user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- user_id
- completed_date

---

### checklist_templates
Stores reusable checklist templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique template identifier |
| name | VARCHAR(255) | NOT NULL | Template name |
| type | ENUM | NOT NULL | Checklist type (callout, vehicle, equipment, training, general) |
| description | TEXT | | Template description |
| items | JSONB | NOT NULL | Array of checklist items |
| version | INTEGER | DEFAULT 1 | Template version number |
| is_locked | BOOLEAN | DEFAULT false | Lock status (only Admin/Officer can edit if locked) |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_by | UUID | FK → users.id | Creator user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| updated_by | UUID | FK → users.id | Last updater user ID |

**Indexes:**
- type
- is_active

---

### checklists
Stores checklist instances assigned to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique checklist identifier |
| template_id | UUID | FK → checklist_templates.id | Template reference |
| type | ENUM | NOT NULL | Checklist type |
| title | VARCHAR(255) | NOT NULL | Checklist title |
| assigned_to | UUID | FK → users.id NOT NULL | Assigned user ID |
| assigned_by | UUID | FK → users.id | Assigner user ID |
| status | ENUM | NOT NULL | Status (not_started, in_progress, completed, cancelled) |
| items | JSONB | NOT NULL | Array of item responses |
| completed_at | TIMESTAMP | | Completion timestamp |
| completed_by | UUID | FK → users.id | Completer user ID |
| signature | TEXT | | Signature data/URL |
| notes | TEXT | | Additional notes |
| location | JSONB | | Location coordinates |
| is_offline | BOOLEAN | DEFAULT false | Created offline flag |
| synced_at | TIMESTAMP | | Sync timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- assigned_to
- status
- template_id
| type

---

### resources
Stores resource library items (maps, SOPs, manuals, videos).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique resource identifier |
| title | VARCHAR(255) | NOT NULL | Resource title |
| description | TEXT | | Resource description |
| category | ENUM | NOT NULL | Category (maps, sops, manuals, videos, forms, reference, other) |
| tags | JSONB | | Array of tags |
| file_url | VARCHAR(500) | | URL to file (PDF, image) |
| external_url | VARCHAR(500) | | External link URL |
| embed_code | TEXT | | Embed code for videos |
| access_level | ENUM | NOT NULL | Access level (all, member, officer, admin) |
| file_type | VARCHAR(50) | | File type (pdf, image, video, document, link) |
| file_size | BIGINT | | File size in bytes |
| thumbnail_url | VARCHAR(500) | | Thumbnail image URL |
| uploaded_by | UUID | FK → users.id | Uploader user ID |
| download_count | INTEGER | DEFAULT 0 | Download count |
| is_pinned | BOOLEAN | DEFAULT false | Pinned status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- category
- access_level
- tags (GIN index for JSONB)

---

### callout_reports
Stores individual callout reports submitted by members.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique report identifier |
| callout_id | UUID | FK → call_outs.id | Callout reference |
| mission_id | UUID | FK → sar_missions.id | SAR mission reference |
| submitted_by | UUID | FK → users.id NOT NULL | Submitter user ID |
| date | DATE | NOT NULL | Callout date |
| start_time | TIMESTAMP | | Start time |
| end_time | TIMESTAMP | | End time |
| incident_type | VARCHAR(255) | NOT NULL | Incident type |
| location | JSONB | NOT NULL | Location coordinates |
| location_description | TEXT | | Location description |
| role_on_scene | VARCHAR(100) | | User's role on scene |
| equipment_used | JSONB | | Array of equipment IDs |
| notes | TEXT | | General notes |
| observations | TEXT | | Observations |
| photos | JSONB | | Array of photo URLs |
| documents | JSONB | | Array of document URLs |
| status | ENUM | NOT NULL | Status (draft, submitted, under_review, approved, rejected) |
| reviewed_by | UUID | FK → users.id | Reviewer user ID |
| reviewed_at | TIMESTAMP | | Review timestamp |
| review_notes | TEXT | | Review notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- submitted_by
- callout_id
- mission_id
- status
| date

---

### notifications
Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | FK → users.id NOT NULL | User reference |
| type | ENUM | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| channels | JSONB | NOT NULL | Array of channels (push, email, sms, in_app) |
| data | JSONB | | Additional data for deep linking |
| is_read | BOOLEAN | DEFAULT false | Read status |
| read_at | TIMESTAMP | | Read timestamp |
| action_url | VARCHAR(500) | | Action URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- user_id
- is_read
| type
| created_at

---

### audit_logs
Stores audit trail for critical changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log identifier |
| user_id | UUID | FK → users.id NOT NULL | User who performed action |
| action | ENUM | NOT NULL | Action type (create, update, delete, view, approve, reject, assign, complete) |
| entity | ENUM | NOT NULL | Entity type |
| entity_id | UUID | NOT NULL | Entity identifier |
| entity_name | VARCHAR(255) | | Entity name |
| changes | JSONB | | Changes made (old/new values) |
| ip_address | VARCHAR(45) | | IP address |
| user_agent | TEXT | | User agent string |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- user_id
- entity
- entity_id
| created_at

---

## Existing Tables (Reference)

### call_outs
Stores callout records (already exists in system).

### sar_missions
Stores SAR mission records (already exists in system).

### chat_rooms
Stores chat room records (already exists in system).

### chat_messages
Stores chat message records (already exists in system).

---

## Relationships

1. **users** → many **vehicles** (created_by)
2. **users** → many **equipment** (assigned_to, created_by)
3. **users** → many **certifications** (user_id)
4. **users** → many **training_records** (user_id)
5. **users** → many **checklists** (assigned_to, assigned_by)
6. **users** → many **callout_reports** (submitted_by, reviewed_by)
7. **vehicles** → many **maintenance_logs** (vehicle_id)
8. **equipment** → many **equipment_inspections** (equipment_id)
9. **equipment** → many **equipment_assignments** (equipment_id)
10. **checklist_templates** → many **checklists** (template_id)

---

## Notes

- All timestamps use UTC timezone
- UUIDs are used for all primary keys for better distributed system support
- JSONB columns are used for flexible schema (tags, preferences, arrays)
- Soft deletes can be implemented using `is_active` or `deleted_at` columns where needed
- Indexes are created on foreign keys and frequently queried columns
- Consider partitioning large tables (audit_logs, notifications) by date for performance



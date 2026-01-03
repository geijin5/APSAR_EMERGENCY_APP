# APSAR Emergency App - API Endpoints Documentation

## Base URL
```
https://api.anaconda-deerlodge-emergency.gov
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Vehicle Management Endpoints

### GET /api/vehicles
Get all vehicles
- **Auth**: Member+
- **Query Params**: None
- **Response**: `Vehicle[]`

### GET /api/vehicles/:id
Get vehicle by ID
- **Auth**: Member+
- **Response**: `Vehicle`

### POST /api/vehicles
Create vehicle
- **Auth**: Officer+
- **Body**: `Partial<Vehicle>`
- **Response**: `Vehicle`

### PUT /api/vehicles/:id
Update vehicle
- **Auth**: Officer+
- **Body**: `Partial<Vehicle>`
- **Response**: `Vehicle`

### DELETE /api/vehicles/:id
Delete vehicle
- **Auth**: Admin
- **Response**: `204 No Content`

### GET /api/vehicles/:id/maintenance
Get maintenance logs for vehicle
- **Auth**: Member+
- **Response**: `MaintenanceLog[]`

### POST /api/vehicles/:id/maintenance
Create maintenance log
- **Auth**: Officer+
- **Body**: `Partial<MaintenanceLog>`
- **Response**: `MaintenanceLog`

### GET /api/vehicles/maintenance/reminders
Get maintenance reminders
- **Auth**: Member+
- **Response**: `MaintenanceReminder[]`

---

## Equipment Management Endpoints

### GET /api/equipment
Get all equipment
- **Auth**: Member+
- **Query Params**: `category`, `status`, `assignedTo`
- **Response**: `Equipment[]`

### GET /api/equipment/:id
Get equipment by ID
- **Auth**: Member+
- **Response**: `Equipment`

### POST /api/equipment
Create equipment
- **Auth**: Officer+
- **Body**: `Partial<Equipment>`
- **Response**: `Equipment`

### PUT /api/equipment/:id
Update equipment
- **Auth**: Officer+
- **Body**: `Partial<Equipment>`
- **Response**: `Equipment`

### DELETE /api/equipment/:id
Delete equipment
- **Auth**: Admin
- **Response**: `204 No Content`

### GET /api/equipment/:id/inspections
Get inspections for equipment
- **Auth**: Member+
- **Response**: `EquipmentInspection[]`

### POST /api/equipment/:id/inspections
Create equipment inspection
- **Auth**: Officer+
- **Body**: `Partial<EquipmentInspection>`
- **Response**: `EquipmentInspection`

### POST /api/equipment/:id/assign
Assign equipment to user
- **Auth**: Officer+
- **Body**: `{userId: string, notes?: string}`
- **Response**: `EquipmentAssignment`

### POST /api/equipment/assignments/:id/return
Return equipment
- **Auth**: Officer+
- **Response**: `204 No Content`

### GET /api/equipment/assignments
Get equipment assignments
- **Auth**: Member+
- **Query Params**: `equipmentId`, `userId`
- **Response**: `EquipmentAssignment[]`

---

## Training & Certifications Endpoints

### GET /api/certifications
Get all certifications (Admin/Officer) or user's certifications (Member)
- **Auth**: Member+
- **Query Params**: `userId` (Officer+ only)
- **Response**: `Certification[]`

### GET /api/users/:userId/certifications
Get certifications for specific user
- **Auth**: Member+ (own certs) or Officer+ (any user)
- **Response**: `Certification[]`

### GET /api/certifications/:id
Get certification by ID
- **Auth**: Member+
- **Response**: `Certification`

### POST /api/certifications
Create certification
- **Auth**: Member+ (own) or Officer+ (any user)
- **Body**: `Partial<Certification>`
- **Response**: `Certification`

### PUT /api/certifications/:id
Update certification
- **Auth**: Member+ (own) or Officer+ (any)
- **Body**: `Partial<Certification>`
- **Response**: `Certification`

### DELETE /api/certifications/:id
Delete certification
- **Auth**: Officer+
- **Response**: `204 No Content`

### POST /api/certifications/:id/approve
Approve certification
- **Auth**: Officer+
- **Body**: `{notes?: string}`
- **Response**: `Certification`

### GET /api/certifications/expiring
Get expiring certifications
- **Auth**: Officer+
- **Query Params**: `days` (default: 30)
- **Response**: `Certification[]`

### GET /api/training
Get all training records (Admin/Officer) or user's records (Member)
- **Auth**: Member+
- **Query Params**: `userId` (Officer+ only)
- **Response**: `TrainingRecord[]`

### GET /api/users/:userId/training
Get training records for specific user
- **Auth**: Member+ (own) or Officer+ (any)
- **Response**: `TrainingRecord[]`

### POST /api/training
Create training record
- **Auth**: Member+ (own) or Officer+ (any)
- **Body**: `Partial<TrainingRecord>`
- **Response**: `TrainingRecord`

### PUT /api/training/:id
Update training record
- **Auth**: Member+ (own) or Officer+ (any)
- **Body**: `Partial<TrainingRecord>`
- **Response**: `TrainingRecord`

### DELETE /api/training/:id
Delete training record
- **Auth**: Officer+
- **Response**: `204 No Content`

---

## Checklists Endpoints

### GET /api/checklists/templates
Get checklist templates
- **Auth**: Member+
- **Query Params**: `type`
- **Response**: `ChecklistTemplate[]`

### GET /api/checklists/templates/:id
Get checklist template by ID
- **Auth**: Member+
- **Response**: `ChecklistTemplate`

### POST /api/checklists/templates
Create checklist template
- **Auth**: Officer+
- **Body**: `Partial<ChecklistTemplate>`
- **Response**: `ChecklistTemplate`

### PUT /api/checklists/templates/:id
Update checklist template (must not be locked unless Admin)
- **Auth**: Officer+
- **Body**: `Partial<ChecklistTemplate>`
- **Response**: `ChecklistTemplate`

### DELETE /api/checklists/templates/:id
Delete checklist template
- **Auth**: Admin
- **Response**: `204 No Content`

### GET /api/checklists
Get checklists
- **Auth**: Member+
- **Query Params**: `assignedTo`, `status`, `type`
- **Response**: `Checklist[]`

### GET /api/checklists/:id
Get checklist by ID
- **Auth**: Member+
- **Response**: `Checklist`

### POST /api/checklists
Create checklist
- **Auth**: Officer+ (assignments) or Member+ (self-initiated)
- **Body**: `Partial<Checklist>`
- **Response**: `Checklist`

### PUT /api/checklists/:id
Update checklist
- **Auth**: Member+ (assigned to them) or Officer+ (any)
- **Body**: `Partial<Checklist>`
- **Response**: `Checklist`

### POST /api/checklists/:id/complete
Complete checklist
- **Auth**: Member+ (assigned to them)
- **Body**: `{signature?: string, notes?: string}`
- **Response**: `Checklist`

### GET /api/checklists/:id/export/pdf
Export checklist to PDF
- **Auth**: Member+
- **Response**: `Blob` (PDF file)

### POST /api/checklists/sync
Sync offline checklists
- **Auth**: Member+
- **Body**: `{checklists: Checklist[]}`
- **Response**: `Checklist[]`

---

## Resource Library Endpoints

### GET /api/resources
Get resources (filtered by access level)
- **Auth**: Member+
- **Query Params**: `category`, `tag`, `search`
- **Response**: `Resource[]`

### GET /api/resources/:id
Get resource by ID
- **Auth**: Member+ (if access level allows)
- **Response**: `Resource`

### POST /api/resources
Create resource
- **Auth**: Officer+
- **Body**: `Partial<Resource>`
- **Response**: `Resource`

### PUT /api/resources/:id
Update resource
- **Auth**: Officer+
- **Body**: `Partial<Resource>`
- **Response**: `Resource`

### DELETE /api/resources/:id
Delete resource
- **Auth**: Admin
- **Response**: `204 No Content`

### POST /api/resources/:id/upload
Upload resource file
- **Auth**: Officer+
- **Body**: `FormData` (multipart/form-data)
- **Response**: `Resource`

### GET /api/resources/:id/download
Download resource file
- **Auth**: Member+ (if access level allows)
- **Response**: `Blob` (file)

---

## Callout Reports Endpoints

### GET /api/callout-reports
Get callout reports
- **Auth**: Member+ (own reports) or Officer+ (all)
- **Query Params**: `calloutId`, `missionId`, `status`
- **Response**: `CalloutReport[]`

### GET /api/callout-reports/:id
Get callout report by ID
- **Auth**: Member+ (own) or Officer+ (any)
- **Response**: `CalloutReport`

### POST /api/callout-reports
Create callout report
- **Auth**: Member+
- **Body**: `Partial<CalloutReport>`
- **Response**: `CalloutReport`

### PUT /api/callout-reports/:id
Update callout report (draft only)
- **Auth**: Member+ (own)
- **Body**: `Partial<CalloutReport>`
- **Response**: `CalloutReport`

### POST /api/callout-reports/:id/submit
Submit callout report for review
- **Auth**: Member+ (own)
- **Response**: `CalloutReport`

### POST /api/callout-reports/:id/review
Review callout report
- **Auth**: Officer+
- **Body**: `{action: 'approve' | 'reject', notes?: string}`
- **Response**: `CalloutReport`

### GET /api/callout-reports/export
Export callout reports
- **Auth**: Officer+
- **Query Params**: Filters + `format` ('pdf' | 'csv')
- **Response**: `Blob` (PDF or CSV file)

---

## Notifications Endpoints

### GET /api/notifications
Get user notifications
- **Auth**: Member+
- **Query Params**: `isRead`, `type`
- **Response**: `Notification[]`

### POST /api/notifications/:id/read
Mark notification as read
- **Auth**: Member+
- **Response**: `204 No Content`

### POST /api/notifications/read-all
Mark all notifications as read
- **Auth**: Member+
- **Response**: `204 No Content`

### DELETE /api/notifications/:id
Delete notification
- **Auth**: Member+
- **Response**: `204 No Content`

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": {...}
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API requests are rate-limited:
- **Member**: 100 requests/minute
- **Officer**: 200 requests/minute
- **Admin**: 500 requests/minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets



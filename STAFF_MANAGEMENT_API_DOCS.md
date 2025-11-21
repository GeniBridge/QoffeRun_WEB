# Staff Management API Documentation

## Overview
The Staff Management API provides endpoints to manage staff assignments across multiple branches in a chain. This system supports multi-branch assignments where staff can work at different branches with different roles and permissions.

## Authentication
All endpoints require authentication via Sanctum:
```
Authorization: Bearer {token}
```

## Base URL
```
/api/v1/admin/staff-management/
```

## Endpoints

### 1. Get Chain Staff Overview
**GET** `/chain-staff`

Returns comprehensive overview of all staff across the chain's branches.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "chains": [...],
    "staff_by_branch": {
      "branch_id": {
        "branch": {
          "id": 1,
          "name": "Via del Corso",
          "address": "Via del Corso 123",
          "chain_id": 1
        },
        "managers": [...],
        "staff": [...],
        "total_assigned": 5
      }
    },
    "managers_by_branch": {...},
    "all_assigned_staff": [...],
    "summary": {
      "total_branches": 3,
      "total_unique_staff": 10,
      "total_assignments": 15,
      "total_managers": 3
    }
  }
}
```

**Use Cases:**
- Chain owner dashboard overview
- Staff distribution analysis
- Manager assignments overview

### 2. Get All Assigned Staff
**GET** `/all-assigned`

Returns detailed view of all staff with their branch assignments.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "assigned_staff": [
      {
        "id": 1,
        "name": "Alessandro Verdi",
        "email": "alessandro@example.com",
        "role": "staff",
        "phone": "+39 123 456 7890",
        "employee_code": "EMP001",
        "branch_assignments": [
          {
            "branch_id": 1,
            "branch_name": "Via del Corso",
            "branch_address": "Via del Corso 123",
            "role_at_branch": "manager",
            "is_primary_branch": true,
            "assigned_at": "2024-01-15T10:00:00Z",
            "permissions": ["manage_inventory", "view_reports"],
            "work_schedule": {...}
          }
        ],
        "total_assignments": 2,
        "is_manager": true,
        "primary_branch": {...}
      }
    ],
    "total_staff": 10,
    "managers_count": 3,
    "staff_count": 7
  }
}
```

**Use Cases:**
- Staff directory with all assignments
- Multi-branch staff overview
- Assignment analysis

### 3. Get Branch Staff
**GET** `/branch/{branchId}`

Returns all staff assigned to a specific branch, separated by managers and regular staff.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "branch": {
      "id": 1,
      "name": "Via del Corso",
      "address": "Via del Corso 123",
      "chain_id": 1,
      "chain_name": "Caffè Roma"
    },
    "managers": [
      {
        "id": 1,
        "name": "Alessandro Verdi",
        "role_at_branch": "manager",
        "is_primary_branch": true,
        "permissions": ["manage_inventory", "view_reports"],
        "work_schedule": {...}
      }
    ],
    "staff": [...],
    "all_staff": [...],
    "summary": {
      "total_assigned": 5,
      "managers_count": 1,
      "staff_count": 4,
      "primary_assignments": 2
    }
  }
}
```

**Use Cases:**
- Branch-specific staff management
- Manager assignments per branch
- Branch staffing overview

### 4. Get Branch Managers Only
**GET** `/branch/{branchId}/managers`

Returns only managers assigned to a specific branch.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "branch": {...},
    "managers": [
      {
        "id": 1,
        "name": "Alessandro Verdi",
        "email": "alessandro@example.com",
        "role_at_branch": "manager",
        "is_primary_branch": true,
        "assigned_at": "2024-01-15T10:00:00Z",
        "permissions": ["manage_inventory", "view_reports"],
        "work_schedule": {...}
      }
    ],
    "total_managers": 1
  }
}
```

**Use Cases:**
- Manager-only views
- Branch management hierarchy
- Manager contact information

### 5. Assign User to Branch
**POST** `/assign`

Assigns a user to a branch with specific role and permissions.

**Request Body:**
```json
{
  "user_id": 1,
  "branch_id": 1,
  "role_at_branch": "manager",
  "is_primary_branch": true,
  "permissions": {
    "manage_inventory": true,
    "view_reports": true,
    "handle_cash": false,
    "manage_schedule": true
  },
  "work_schedule": {
    "monday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "tuesday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "wednesday": { "enabled": false, "start": "09:00", "end": "17:00" },
    "thursday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "friday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "saturday": { "enabled": false, "start": "09:00", "end": "17:00" },
    "sunday": { "enabled": false, "start": "09:00", "end": "17:00" }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User assigned to branch successfully",
  "data": {
    "assignment": {...}
  }
}
```

**Validation Rules:**
- `user_id`: required, exists in users table
- `branch_id`: required, exists in branches table, belongs to chain owner
- `role_at_branch`: required, in ['staff', 'barista', 'manager', 'branch_manager']
- `is_primary_branch`: boolean
- `permissions`: array of permission keys
- `work_schedule`: array of daily schedules

### 6. Remove User from Branch
**DELETE** `/remove`

Removes a user's assignment from a specific branch.

**Request Body:**
```json
{
  "user_id": 1,
  "branch_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User removed from branch successfully"
}
```

## Role Types

### Available Roles at Branch Level:
- **staff**: Basic staff member
- **barista**: Coffee preparation specialist
- **manager**: Branch manager with full permissions
- **branch_manager**: Alternative manager designation

### Permission Types:
- **manage_inventory**: Can manage stock and inventory
- **view_reports**: Can view sales and performance reports  
- **handle_cash**: Can handle cash transactions and till
- **manage_schedule**: Can manage staff schedules

## Work Schedule Format
```json
{
  "monday": { 
    "enabled": true, 
    "start": "09:00", 
    "end": "17:00" 
  },
  "tuesday": { 
    "enabled": false, 
    "start": "09:00", 
    "end": "17:00" 
  }
  // ... for all days of the week
}
```

## Error Responses

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Chain owner required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Branch not found or access denied"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "user_id": ["User is already assigned to this branch"],
    "branch_id": ["Branch does not belong to your chain"]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to assign user: Database connection error"
}
```

## Sample Data Structure

### Current Sample Data (from Seeder):
- **Caffè Roma Chain**: 3 branches (Via del Corso, Trastevere, Termini)
- **10 Staff Members**: Various roles across branches
- **Multiple Assignments**: Staff working at 2-3 branches each

### Key Staff Examples:
1. **Alessandro Verdi**: Manager at Via del Corso (primary) + Trastevere
2. **Giulia Bianchi**: Barista at Trastevere (primary) + Termini
3. **Marco Rossi**: Staff at Via del Corso + Termini (primary)

## Usage Examples

### Frontend Integration:
```javascript
// Get chain overview
const response = await fetch('/api/v1/admin/staff-management/chain-staff', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get specific branch staff
const branchStaff = await fetch(`/api/v1/admin/staff-management/branch/1`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Assign staff to branch
const assignment = await fetch('/api/v1/admin/staff-management/assign', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 1,
    branch_id: 1,
    role_at_branch: 'manager',
    is_primary_branch: true,
    permissions: { manage_inventory: true, view_reports: true }
  })
});
```

## Security Considerations

1. **Chain Owner Only**: All endpoints require chain owner role
2. **Branch Validation**: Users can only assign staff to their own branches
3. **Soft Deletes**: Assignments are soft-deleted (unassigned_at field)
4. **Audit Trail**: All assignments are timestamped
5. **Permission Validation**: Permissions are validated against allowed list

## Performance Notes

1. **Eager Loading**: Relationships are eager loaded to minimize queries
2. **Indexing**: Foreign keys and pivot table are indexed
3. **Caching**: Consider caching chain staff data for large chains
4. **Pagination**: For large staff lists, implement pagination in frontend

This API provides comprehensive staff management capabilities for multi-branch operations while maintaining security and performance standards.
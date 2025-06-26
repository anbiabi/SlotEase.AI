# SlotEase Location-Based System API Specifications

## Base Configuration

**Base URL:** `https://api.slotease.com/v1`
**Authentication:** OAuth 2.0 Bearer Token
**Content-Type:** `application/json`
**Rate Limiting:** 1000 requests per hour per API key

## Authentication Endpoints

### POST /auth/oauth/token
Obtain access token for API access.

**Request:**
```json
{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "scope": "read write"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

## Location Services

### POST /location/detect
Auto-detect user location and timezone.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5
  },
  "user_id": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10.5,
      "timestamp": 1703123456789
    },
    "timezone": {
      "timeZone": "America/New_York",
      "offset": -300,
      "abbreviation": "EST",
      "isDST": false,
      "utcOffset": "-05:00"
    },
    "location_id": "loc_abc123"
  }
}
```

### GET /location/services/nearby
Find public services within specified radius.

**Query Parameters:**
- `latitude` (required): User latitude
- `longitude` (required): User longitude
- `radius` (optional): Search radius in meters (default: 5000)
- `service_types` (optional): Comma-separated service types
- `limit` (optional): Maximum results (default: 20)

**Example Request:**
```
GET /location/services/nearby?latitude=40.7128&longitude=-74.0060&radius=5000&service_types=hospital,bank&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service_123",
        "name": "City General Hospital",
        "type": "hospital",
        "category": "healthcare",
        "distance": 1250.5,
        "coordinates": {
          "latitude": 40.7200,
          "longitude": -74.0100
        },
        "address": {
          "street": "123 Medical Center Dr",
          "city": "New York",
          "state": "NY",
          "postalCode": "10001",
          "country": "US",
          "formatted": "123 Medical Center Dr, New York, NY 10001"
        },
        "contact": {
          "phone": "+1-555-HOSPITAL",
          "email": "info@cityhospital.com",
          "website": "https://cityhospital.com"
        },
        "availability": {
          "status": "open",
          "currentCapacity": 45,
          "maxCapacity": 100,
          "estimatedWaitTime": 25,
          "queueLength": 12,
          "nextAvailableSlot": "2024-01-15T14:30:00Z",
          "lastUpdated": "2024-01-15T12:00:00Z"
        },
        "rating": {
          "average": 4.2,
          "count": 1247
        },
        "features": ["Emergency Care", "Specialist Consultations"],
        "accessibility": {
          "wheelchairAccessible": true,
          "hearingAssistance": true,
          "visualAssistance": false,
          "signLanguage": true,
          "elevatorAccess": true,
          "parkingAvailable": true,
          "publicTransportAccess": true
        },
        "operatingHours": {
          "Monday": {"open": "00:00", "close": "23:59", "isOpen": true},
          "Tuesday": {"open": "00:00", "close": "23:59", "isOpen": true}
        }
      }
    ],
    "total": 15,
    "radius": 5000,
    "center": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
}
```

## Service Connection Management

### POST /services/{service_id}/connect
Establish connection with a public service.

**Path Parameters:**
- `service_id`: Unique service identifier

**Request:**
```json
{
  "auth_method": "oauth2",
  "credentials": {
    "client_id": "service_client_id",
    "client_secret": "service_client_secret"
  },
  "timeout": 30000,
  "retry_attempts": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connection_id": "conn_abc123",
    "status": "connected",
    "established_at": "2024-01-15T12:00:00Z",
    "expires_at": "2024-01-15T13:00:00Z"
  }
}
```

### GET /services/{service_id}/health
Check service health and connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "response_time": 150,
    "last_check": "2024-01-15T12:00:00Z",
    "uptime_percentage": 99.5
  }
}
```

### GET /services/{service_id}/availability
Get real-time service availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "open",
    "current_capacity": 45,
    "max_capacity": 100,
    "estimated_wait_time": 25,
    "queue_length": 12,
    "next_available_slots": [
      "2024-01-15T14:30:00Z",
      "2024-01-15T15:00:00Z",
      "2024-01-15T15:30:00Z"
    ],
    "last_updated": "2024-01-15T12:00:00Z"
  }
}
```

## Booking Operations

### POST /services/{service_id}/bookings
Create a new booking.

**Request:**
```json
{
  "user_id": "user_123",
  "service_type": "consultation",
  "preferred_time": "2024-01-15T14:30:00Z",
  "duration": 30,
  "priority": "medium",
  "notes": "First-time visit",
  "contact": {
    "phone": "+1-555-0123",
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking_abc123",
    "confirmation_code": "ABC123",
    "status": "confirmed",
    "scheduled_time": "2024-01-15T14:30:00Z",
    "estimated_wait_time": 15,
    "queue_position": 3,
    "check_in_required": true,
    "check_in_window": {
      "start": "2024-01-15T14:15:00Z",
      "end": "2024-01-15T14:45:00Z"
    }
  }
}
```

### PUT /services/{service_id}/bookings/{booking_id}
Modify an existing booking.

**Request:**
```json
{
  "preferred_time": "2024-01-15T15:00:00Z",
  "notes": "Updated appointment time"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking_abc123",
    "status": "modified",
    "scheduled_time": "2024-01-15T15:00:00Z",
    "modification_fee": 0,
    "updated_at": "2024-01-15T12:30:00Z"
  }
}
```

### DELETE /services/{service_id}/bookings/{booking_id}
Cancel a booking.

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking_abc123",
    "status": "cancelled",
    "cancellation_fee": 0,
    "refund_amount": 50.00,
    "cancelled_at": "2024-01-15T12:30:00Z"
  }
}
```

## AI Integration Endpoints

### POST /ai/requests
Submit standardized AI service request.

**Request:**
```json
{
  "service_id": "service_123",
  "user_id": "user_123",
  "type": "booking",
  "data": {
    "service_type": "consultation",
    "preferred_time": "2024-01-15T14:30:00Z",
    "duration": 30
  },
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request_id": "ai_req_abc123",
    "status": "pending",
    "estimated_processing_time": 30,
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### GET /ai/requests/{request_id}
Get AI request status.

**Response:**
```json
{
  "success": true,
  "data": {
    "request_id": "ai_req_abc123",
    "status": "completed",
    "processing_time": 25,
    "response": {
      "booking_id": "booking_abc123",
      "confirmation_code": "ABC123",
      "recommendations": [
        "Consider booking 30 minutes earlier for shorter wait time"
      ]
    },
    "created_at": "2024-01-15T12:00:00Z",
    "completed_at": "2024-01-15T12:00:25Z"
  }
}
```

### POST /ai/optimize-schedule
Request AI schedule optimization.

**Request:**
```json
{
  "service_id": "service_123",
  "constraints": {
    "max_wait_time": 30,
    "preferred_hours": ["09:00", "17:00"],
    "capacity_target": 80
  },
  "timeframe": "week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimization_id": "opt_abc123",
    "recommendations": [
      {
        "type": "capacity_increase",
        "description": "Add 2 additional slots at 10:00 AM",
        "impact": "Reduce wait time by 15 minutes",
        "confidence": 0.85
      }
    ],
    "projected_improvements": {
      "wait_time_reduction": 15,
      "capacity_increase": 20,
      "satisfaction_improvement": 0.3
    }
  }
}
```

### POST /ai/predict-demand
Get demand predictions.

**Query Parameters:**
- `timeframe`: Prediction timeframe (hour, day, week, month)

**Request:**
```json
{
  "service_id": "service_123",
  "timeframe": "week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "date": "2024-01-15",
        "hour": 9,
        "predicted_demand": 25,
        "confidence": 0.92,
        "factors": ["historical_pattern", "weather", "events"]
      }
    ],
    "summary": {
      "peak_hours": ["09:00", "14:00"],
      "low_demand_periods": ["12:00", "16:00"],
      "weekly_trend": "increasing"
    }
  }
}
```

## Notification Services

### POST /notifications/send
Send notification to user.

**Request:**
```json
{
  "user_id": "user_123",
  "service_id": "service_123",
  "type": "reminder",
  "channels": ["sms", "email"],
  "data": {
    "appointment_time": "2024-01-15T14:30:00Z",
    "location": "City General Hospital",
    "confirmation_code": "ABC123"
  },
  "schedule_time": "2024-01-15T13:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notification_id": "notif_abc123",
    "status": "scheduled",
    "channels_sent": ["sms", "email"],
    "delivery_time": "2024-01-15T13:30:00Z"
  }
}
```

## Feedback Collection

### POST /feedback
Submit service feedback.

**Request:**
```json
{
  "service_id": "service_123",
  "user_id": "user_123",
  "booking_id": "booking_abc123",
  "rating": 4,
  "comment": "Great service, minimal wait time",
  "categories": {
    "wait_time": 5,
    "service_quality": 4,
    "accessibility": 4,
    "staff": 5
  },
  "verified": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback_id": "feedback_abc123",
    "status": "submitted",
    "impact_on_rating": 0.02,
    "submitted_at": "2024-01-15T15:00:00Z"
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "The provided coordinates are invalid",
    "details": {
      "latitude": "Must be between -90 and 90",
      "longitude": "Must be between -180 and 180"
    },
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

## Common Error Codes

- `INVALID_COORDINATES`: Invalid latitude/longitude values
- `SERVICE_NOT_FOUND`: Requested service does not exist
- `CONNECTION_FAILED`: Unable to connect to service
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `UNAUTHORIZED`: Invalid or expired access token
- `BOOKING_UNAVAILABLE`: Requested time slot not available
- `GEOFENCE_VIOLATION`: User outside allowed geographic area
- `SERVICE_MAINTENANCE`: Service temporarily unavailable

## Rate Limiting

API responses include rate limiting headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1703127056
X-RateLimit-Window: 3600
```

## Webhooks

Services can register webhooks for real-time updates:

### POST /webhooks/register

**Request:**
```json
{
  "service_id": "service_123",
  "url": "https://your-service.com/webhooks/slotease",
  "events": ["booking.created", "availability.updated"],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload Example

```json
{
  "event": "booking.created",
  "data": {
    "booking_id": "booking_abc123",
    "service_id": "service_123",
    "user_id": "user_123",
    "scheduled_time": "2024-01-15T14:30:00Z"
  },
  "timestamp": "2024-01-15T12:00:00Z",
  "signature": "sha256=abc123..."
}
```

This API specification provides comprehensive endpoints for location-based service discovery, connection management, booking operations, AI integration, and real-time notifications.
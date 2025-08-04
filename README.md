# MediFlow API Documentation

This is the backend API service for the Health Connect healthcare/medical application. The API provides endpoints for user authentication, patient management, and medication tracking.

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-1)
  - [Users](#users)
  - [Patients](#patients)
  - [Medications](#medications)
- [Error Handling](#error-handling)
- [Setup and Installation](#setup-and-installation)
- [Testing](#testing)

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/signup` and `/auth/login` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Authentication

#### Sign Up
```http
POST /auth/signup
```
Creates a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "doctor" // Optional, defaults to "staff"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "doctor",
      "isActive": true
    }
  }
}
```

**Common Errors:**
- 400: Invalid input data
- 409: Email already exists

#### Login
```http
POST /auth/login
```
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "doctor"
    }
  }
}
```

**Common Errors:**
- 400: Missing email or password
- 401: Invalid credentials

#### Logout
```http
GET /auth/logout
```
Logs out the current user.

**Response (200 OK):**
```json
{
  "status": "success"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
```
Initiates password reset process.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Token sent to email!"
}
```

#### Reset Password
```http
PATCH /auth/reset-password/:token
```
Resets password using the token from email.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

#### Update Password
```http
PATCH /auth/update-password
```
Updates password for logged-in user.

**Request Body:**
```json
{
  "passwordCurrent": "oldpassword123",
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

### Users (Admin Only)

#### Get All Users
```http
GET /users
```
Retrieves all active users.

**Response (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "doctor"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "role": "admin"
      }
    ]
  }
}
```

#### Get User by ID
```http
GET /users/:id
```
Retrieves a specific user by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "doctor"
    }
  }
}
```

#### Update User
```http
PATCH /users/:id
```
Updates user information.

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@example.com",
  "role": "doctor"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Updated",
      "lastName": "Name",
      "email": "updated@example.com",
      "role": "doctor"
    }
  }
}
```

#### Delete User
```http
DELETE /users/:id
```
Soft deletes a user (sets isActive to false).

**Response (204 No Content):**
```json
{
  "status": "success",
  "data": null
}
```

### Patients

#### Get All Patients
```http
GET /patients
```
Retrieves all active patients.

**Response (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "patients": [
      {
        "id": "507f1f77bcf86cd799439021",
        "firstName": "Jane",
        "lastName": "Smith",
        "dateOfBirth": "1990-01-01",
        "gender": "female",
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "state": "CA",
          "zipCode": "12345",
          "country": "USA"
        },
        "contact": {
          "phone": "555-123-4567",
          "email": "jane.smith@example.com"
        }
      }
    ]
  }
}
```

#### Get Patient by ID
```http
GET /patients/:id
```
Retrieves a specific patient by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439021",
      "firstName": "Jane",
      "lastName": "Smith",
      "dateOfBirth": "1990-01-01",
      "gender": "female",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
      },
      "contact": {
        "phone": "555-123-4567",
        "email": "jane.smith@example.com"
      },
      "medicalHistory": "Previous conditions...",
      "allergies": ["Penicillin", "Peanuts"],
      "medications": ["Medication A", "Medication B"],
      "emergencyContact": {
        "name": "John Smith",
        "relationship": "Spouse",
        "phone": "555-987-6543"
      },
      "insurance": {
        "provider": "HealthCare Inc",
        "policyNumber": "HC123456",
        "groupNumber": "GRP789"
      }
    }
  }
}
```

#### Create Patient (Admin/Doctor Only)
```http
POST /patients
```
Creates a new patient record.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-01",
  "gender": "female",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  },
  "contact": {
    "phone": "555-123-4567",
    "email": "jane.smith@example.com"
  },
  "medicalHistory": "Previous conditions...",
  "allergies": ["Penicillin", "Peanuts"],
  "medications": ["Medication A", "Medication B"],
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "555-987-6543"
  },
  "insurance": {
    "provider": "HealthCare Inc",
    "policyNumber": "HC123456",
    "groupNumber": "GRP789"
  }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439021",
      "firstName": "Jane",
      "lastName": "Smith",
      "dateOfBirth": "1990-01-01",
      "gender": "female",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
      },
      "contact": {
        "phone": "555-123-4567",
        "email": "jane.smith@example.com"
      },
      "medicalHistory": "Previous conditions...",
      "allergies": ["Penicillin", "Peanuts"],
      "medications": ["Medication A", "Medication B"],
      "emergencyContact": {
        "name": "John Smith",
        "relationship": "Spouse",
        "phone": "555-987-6543"
      },
      "insurance": {
        "provider": "HealthCare Inc",
        "policyNumber": "HC123456",
        "groupNumber": "GRP789"
      }
    }
  }
}
```

#### Update Patient (Admin/Doctor Only)
```http
PATCH /patients/:id
```
Updates patient information.

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "contact": {
    "phone": "555-999-8888"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id": "507f1f77bcf86cd799439021",
      "firstName": "Updated",
      "lastName": "Name",
      "dateOfBirth": "1990-01-01",
      "gender": "female",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "12345",
        "country": "USA"
      },
      "contact": {
        "phone": "555-999-8888",
        "email": "jane.smith@example.com"
      }
    }
  }
}
```

#### Delete Patient (Admin Only)
```http
DELETE /patients/:id
```
Soft deletes a patient (sets isActive to false).

**Response (204 No Content):**
```json
{
  "status": "success",
  "data": null
}
```

### Medications

#### Get All Medications
```http
GET /medications
```
Retrieves all active medications.

**Response (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "medications": [
      {
        "id": "507f1f77bcf86cd799439031",
        "name": "Medication A",
        "description": "Description of medication",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "route": "oral",
        "startDate": "2024-01-01",
        "endDate": "2024-02-01",
        "status": "active",
        "patient": "507f1f77bcf86cd799439021",
        "prescribedBy": "507f1f77bcf86cd799439011"
      }
    ]
  }
}
```

#### Get Medication by ID
```http
GET /medications/:id
```
Retrieves a specific medication by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "medication": {
      "id": "507f1f77bcf86cd799439031",
      "name": "Medication A",
      "description": "Description of medication",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "route": "oral",
      "startDate": "2024-01-01",
      "endDate": "2024-02-01",
      "status": "active",
      "patient": "507f1f77bcf86cd799439021",
      "prescribedBy": "507f1f77bcf86cd799439011",
      "instructions": "Take with food",
      "sideEffects": ["Nausea", "Headache"],
      "contraindications": ["Pregnancy", "Liver disease"]
    }
  }
}
```

#### Create Medication (Admin/Doctor Only)
```http
POST /medications
```
Creates a new medication record.

**Request Body:**
```json
{
  "name": "Medication Name",
  "description": "Description of medication",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "route": "oral",
  "startDate": "2024-01-01",
  "endDate": "2024-02-01",
  "status": "active",
  "patient": "507f1f77bcf86cd799439021",
  "prescribedBy": "507f1f77bcf86cd799439011",
  "instructions": "Take with food",
  "sideEffects": ["Nausea", "Headache"],
  "contraindications": ["Pregnancy", "Liver disease"]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "medication": {
      "id": "507f1f77bcf86cd799439031",
      "name": "Medication Name",
      "description": "Description of medication",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "route": "oral",
      "startDate": "2024-01-01",
      "endDate": "2024-02-01",
      "status": "active",
      "patient": "507f1f77bcf86cd799439021",
      "prescribedBy": "507f1f77bcf86cd799439011",
      "instructions": "Take with food",
      "sideEffects": ["Nausea", "Headache"],
      "contraindications": ["Pregnancy", "Liver disease"]
    }
  }
}
```

#### Update Medication (Admin/Doctor Only)
```http
PATCH /medications/:id
```
Updates medication information.

**Request Body:**
```json
{
  "dosage": "1000mg",
  "frequency": "Once daily",
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "medication": {
      "id": "507f1f77bcf86cd799439031",
      "name": "Medication Name",
      "description": "Description of medication",
      "dosage": "1000mg",
      "frequency": "Once daily",
      "route": "oral",
      "startDate": "2024-01-01",
      "endDate": "2024-02-01",
      "status": "completed",
      "patient": "507f1f77bcf86cd799439021",
      "prescribedBy": "507f1f77bcf86cd799439011"
    }
  }
}
```

#### Delete Medication (Admin Only)
```http
DELETE /medications/:id
```
Soft deletes a medication (sets isActive to false).

**Response (204 No Content):**
```json
{
  "status": "success",
  "data": null
}
```

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

Common status codes and their meanings:
- 200: Success
- 201: Created
- 400: Bad Request (Invalid input data)
- 401: Unauthorized (Not logged in)
- 403: Forbidden (No permission)
- 404: Not Found (Resource doesn't exist)
- 500: Internal Server Error

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mediflow
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

Run tests with:
```bash
npm test
``` 
# MediFlow Healthcare API

Welcome to MediFlow! This is a modern, secure, and developer-friendly backend API designed for clinics, hospitals, and health tech startups. MediFlow helps you manage patients, appointments, diagnoses, medications, prescriptions, and billing—all in one place.

Whether you’re building a patient portal, a clinic dashboard, or a telemedicine platform, MediFlow gives you the building blocks for a seamless healthcare experience.

---

## 🚀 Features at a Glance
- **Secure authentication** with JWT and role-based access (admin, doctor, nurse, pharmacist, biller)
- **User management** for staff and providers
- **Patient onboarding** and medical record management
- **Appointment scheduling** with conflict checking
- **Diagnosis and treatment tracking**
- **Medication and prescription management**
- **Billing and invoicing** for services and medications
- **Interactive API docs** at `/docs` (Scalar) or `/swagger` (optional)

---

## 🛠️ Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/mediflow-backend.git
   cd mediflow-backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Set up your environment:**
   Create a `.env` file:
   ```env
   PORT=5500
   MONGODB_URI=mongodb://localhost:27017/mediflow
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```
5. **Access the API docs:**

  ⚠️- It might take  up to a minute to access the docs due to the API being hosted on Render's free  tier.The instance will spin down with inactivity, which can delay requests by 50 seconds or more.
   - Interactive: [https://mediflow-ts-backend.onrender.com/docs](https://mediflow-ts-backend.onrender.com/docs)
   - Raw OpenAPI: [https://mediflow-ts-backend.onrender.com/openapi.json](https://mediflow-ts-backend.onrender.com/openapi.json)

---

## 🔐 Authentication
All endpoints (except `/auth/signup` and `/auth/login`) require a JWT token. Include it in the `Authorization` header:
```
Authorization: Bearer <your_token>
```

---

## 📚 API Modules & Endpoints

### Users
- **Admins** can create, update, view, and soft-delete users.
- Each user has a role (admin, doctor, nurse, pharmacist, biller) and can log in securely.

### Patients
- Store and update patient demographics, contact info, medical history, allergies, medications, emergency contacts, and insurance.
- Only authorized staff can create or update patient records.

### Appointments
- Schedule, update, and cancel appointments.
- Supports time slots, provider assignment, and conflict checking.

### Diagnoses
- Record diagnoses, symptoms, physical exams, vital signs, ICD-10 codes, severity, and treatment plans.

### Medications
- Catalog medications, assign to patients, track dosage, frequency, route, and stock.

### Prescriptions
- Doctors and pharmacists can create, fill, and refill prescriptions, with tracking for refills and status.

### Invoices
- Generate, update, and process invoices for medical services, medications, and appointments, with payment tracking.

---

## 📦 API Versioning

All endpoints are now versioned! Use `/api/v1/` as the base path for all API requests. This ensures backward compatibility and smooth upgrades in the future.

---

## 📝 Example: Creating a Patient
```http
POST /api/v1/patients
```
**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-01",
  "gender": "female",
  "contact": { "phone": "555-123-4567", "email": "jane.smith@example.com" }
}
```
**Response:**
```json
{
  "status": "success",
  "data": { "patient": { ... } }
}
```

---

## ⚠️ Error Handling
All errors are returned in a consistent format:
```json
{
  "status": "error",
  "message": "Error message here"
}
```
Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## 🛡️ Input Validation & Security

MediFlow uses [express-validator](https://express-validator.github.io/) to ensure all incoming data is validated and sanitized before reaching your business logic or database. Every route that accepts user input (authentication, user, patient, medication, appointment, diagnosis, prescription, invoice) is protected by validation middleware.

- **Validation:** Each endpoint checks for required fields, correct types, and valid values (e.g., email format, password length, allowed enums, valid Mongo IDs, etc.).
- **Sanitization:** All string inputs are trimmed and checked for emptiness. Dates and numbers are validated for format and range.
- **Error Handling:** If validation fails, the API returns a clear error response:
  ```json
  {
    "status": "error",
    "message": "Validation failed",
    "errors": [
      { "field": "email", "message": "Valid email is required" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
  ```
- **Security:**
  - All endpoints are protected by authentication and role-based authorization.
  - Helmet, CORS, rate limiting, and input sanitization are enabled by default.
  - Passwords are hashed with bcrypt before storage.
  - Sensitive error details are hidden in production.

**Best Practice:** Always validate and sanitize input on both client and server. MediFlow makes this easy and automatic for you.

---





## 📄 License
MediFlow is open source under the [MIT License](https://opensource.org/licenses/MIT).

---





For full API details, see the interactive docs at `/docs` or the OpenAPI spec at `/openapi.json`. 

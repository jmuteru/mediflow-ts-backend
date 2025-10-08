import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'MediFlow Healthcare API',
    version: '1.0.0',
    description: `Welcome to MediFlow! This API is your gateway to building modern, secure, and efficient healthcare applications. MediFlow is designed for clinics, hospitals, and health tech startups who want to manage patients, appointments, diagnoses, medications, prescriptions, and billing—all in one place.

With MediFlow, you can:
- Register and manage users with roles like admin, doctor, nurse, pharmacist, and biller
- Onboard and update patients, including their medical history, allergies, and insurance
- Schedule, update, and track appointments with conflict checking and provider assignment
- Record diagnoses, symptoms, physical exams, and treatment plans
- Catalog and assign medications, track inventory, and manage prescriptions
- Generate and process invoices for services and medications
- Secure every endpoint with JWT authentication and role-based access

The API is fully documented and easy to explore at /docs (or /swagger if enabled). Whether you’re building a patient portal, a clinic dashboard, or a telemedicine platform, MediFlow gives you the building blocks for a seamless healthcare experience.

**Get started today and bring your healthcare ideas to life!**`,
    contact: {
      name: 'MediFlow Team',
      email: 'support@mediflow.com',
      url: 'https://mediflow.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    { url: '/api/v1', description: 'API v1 Base' }
  ],
  tags: [
    { name: 'Authentication', description: 'User signup, login, password management, and token refresh.' },
    { name: 'Users', description: 'User management and administration.' },
    { name: 'Patients', description: 'Patient records, contacts, and medical history.' },
    { name: 'Appointments', description: 'Appointment scheduling, updates, and slot management.' },
    { name: 'Diagnoses', description: 'Diagnosis creation, updates, and retrieval.' },
    { name: 'Medications', description: 'Medication catalog, assignment, and management.' },
    { name: 'Prescriptions', description: 'Prescription creation, filling, and refills.' },
    { name: 'Invoices', description: 'Billing, invoice creation, payment, and status tracking.' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'doctor', 'nurse', 'pharmacist', 'biller'] },
          isActive: { type: 'boolean' }
        }
      },
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' }
            }
          },
          contact: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              email: { type: 'string' }
            }
          },
          medicalHistory: { type: 'string' },
          allergies: { type: 'array', items: { type: 'string' } },
          medications: { type: 'array', items: { type: 'string' } },
          emergencyContact: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              relationship: { type: 'string' },
              phone: { type: 'string' }
            }
          },
          insurance: {
            type: 'object',
            properties: {
              provider: { type: 'string' },
              policyNumber: { type: 'string' },
              groupNumber: { type: 'string' }
            }
          },
          isActive: { type: 'boolean' }
        }
      },
      Medication: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          dosage: { type: 'string' },
          frequency: { type: 'string' },
          route: { type: 'string', enum: ['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'other'] },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['active', 'completed', 'discontinued'] },
          patient: { type: 'string' },
          prescribedBy: { type: 'string' },
          instructions: { type: 'string' },
          sideEffects: { type: 'array', items: { type: 'string' } },
          contraindications: { type: 'array', items: { type: 'string' } },
          unitPrice: { type: 'number' },
          currency: { type: 'string', enum: ['GBP', 'USD', 'EUR', 'KES', 'ETH', 'BTC'] },
          packSize: { type: 'number' },
          manufacturer: { type: 'string' },
          batchNumber: { type: 'string' },
          expiryDate: { type: 'string', format: 'date' },
          stockQuantity: { type: 'number' },
          reorderLevel: { type: 'number' },
          isActive: { type: 'boolean' }
        }
      },
      Diagnosis: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          patient: { type: 'string' },
          diagnosedBy: { type: 'string' },
          appointment: { type: 'string' },
          diagnosisDate: { type: 'string', format: 'date' },
          primaryDiagnosis: { type: 'string' },
          secondaryDiagnoses: { type: 'array', items: { type: 'string' } },
          icd10Codes: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'string' },
          physicalExam: { type: 'object', additionalProperties: { type: 'string' } },
          vitalSigns: { type: 'object', additionalProperties: { type: 'string' } },
          severity: { type: 'string', enum: ['mild', 'moderate', 'severe', 'critical'] },
          treatmentPlan: { type: 'object', additionalProperties: true },
          followUpDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
          notes: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          patient: { type: 'string' },
          provider: { type: 'string' },
          date: { type: 'string', format: 'date' },
          time: { type: 'string' },
          duration: { type: 'number' },
          type: { type: 'string', enum: ['Annual Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Other'] },
          status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no-show'] },
          location: { type: 'string' },
          reason: { type: 'string' },
          notes: { type: 'string' },
          isActive: { type: 'boolean' },
          createdBy: { type: 'string' },
          updatedBy: { type: 'string' }
        }
      },
      Prescription: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          patient: { type: 'string' },
          medication: { type: 'string' },
          prescribedBy: { type: 'string' },
          dateIssued: { type: 'string', format: 'date' },
          quantity: { type: 'string' },
          refillsAllowed: { type: 'number' },
          refillsRemaining: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'filled', 'refilled', 'cancelled'] },
          instructions: { type: 'string' },
          filledBy: { type: 'string' },
          filledDate: { type: 'string', format: 'date' },
          expirationDate: { type: 'string', format: 'date' }
        }
      },
      Invoice: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          invoiceNumber: { type: 'string' },
          patient: { type: 'string' },
          provider: { type: 'string' },
          date: { type: 'string', format: 'date' },
          dueDate: { type: 'string', format: 'date' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'paid', 'overdue', 'cancelled'] },
          paymentMethod: { type: 'string', enum: ['cash', 'card', 'defi', 'insurance'] },
          paymentDate: { type: 'string', format: 'date' },
          notes: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  },
  security: [
    { bearerAuth: [] }
  ]
};

export const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition as any,
  apis: [
    'src/routes/**/*.ts',
    'src/controllers/**/*.ts',
  ]
});



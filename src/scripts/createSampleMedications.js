const mongoose = require('mongoose');
const Medication = require('../models/medication.model');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

const logger = (message) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
};

async function createSampleMedications() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger('Connected to MongoDB');

    // Find or create a sample doctor
    let doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      doctor = await User.create({
        email: 'doctor@mediflow.com',
        password: 'password123',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'doctor'
      });
      logger(`Created sample doctor: ${doctor._id}`);
    }

    // Find or create a sample patient
    let patient = await Patient.findOne({ firstName: 'John', lastName: 'Doe' });
    if (!patient) {
      patient = await Patient.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        contact: {
          phone: '555-123-4567',
          email: 'john.doe@example.com'
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-987-6543'
        }
      });
      logger(`Created sample patient: ${patient._id}`);
    }

    // Clear existing medications
    await Medication.deleteMany({});
    logger('Cleared existing medications');

    // Create sample medications
    const sampleMedications = [
      {
        name: 'Aspirin',
        description: 'Pain reliever and anti-inflammatory medication',
        dosage: '325mg',
        frequency: 'Once daily',
        route: 'oral',
        startDate: new Date(),
        patient: patient._id,
        prescribedBy: doctor._id,
        instructions: 'Take with food to reduce stomach irritation',
        sideEffects: ['Stomach upset', 'Heartburn'],
        contraindications: ['Bleeding disorders', 'Allergy to aspirin'],
        unitPrice: 8.00,
        currency: 'GBP',
        packSize: 30,
        manufacturer: 'Generic Pharma',
        batchNumber: 'ASP001',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        stockQuantity: 100,
        reorderLevel: 20,
        isActive: true
      },
      {
        name: 'Lisinopril',
        description: 'ACE inhibitor for high blood pressure',
        dosage: '10mg',
        frequency: 'Once daily',
        route: 'oral',
        startDate: new Date(),
        patient: patient._id,
        prescribedBy: doctor._id,
        instructions: 'Take at the same time each day',
        sideEffects: ['Dry cough', 'Dizziness', 'Headache'],
        contraindications: ['Pregnancy', 'History of angioedema'],
        unitPrice: 20.00,
        currency: 'GBP',
        packSize: 30,
        manufacturer: 'CardioMed',
        batchNumber: 'LIS001',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        stockQuantity: 75,
        reorderLevel: 15,
        isActive: true
      },
      {
        name: 'Metformin',
        description: 'Diabetes medication to control blood sugar',
        dosage: '500mg',
        frequency: 'Twice daily',
        route: 'oral',
        startDate: new Date(),
        patient: patient._id,
        prescribedBy: doctor._id,
        instructions: 'Take with meals to reduce stomach upset',
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        contraindications: ['Kidney disease', 'Liver disease'],
        unitPrice: 12.00,
        currency: 'GBP',
        packSize: 60,
        manufacturer: 'DiabetesCare',
        batchNumber: 'MET001',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        stockQuantity: 120,
        reorderLevel: 25,
        isActive: true
      },
      {
        name: 'Amoxicillin',
        description: 'Antibiotic for bacterial infections',
        dosage: '250mg',
        frequency: 'Three times daily',
        route: 'oral',
        startDate: new Date(),
        patient: patient._id,
        prescribedBy: doctor._id,
        instructions: 'Complete the full course even if feeling better',
        sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
        contraindications: ['Penicillin allergy'],
        unitPrice: 16.00,
        currency: 'GBP',
        packSize: 21,
        manufacturer: 'AntiBio Labs',
        batchNumber: 'AMX001',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        stockQuantity: 50,
        reorderLevel: 10,
        isActive: true
      },
      {
        name: 'Ibuprofen',
        description: 'Non-steroidal anti-inflammatory drug (NSAID)',
        dosage: '200mg',
        frequency: 'As needed, up to 3 times daily',
        route: 'oral',
        startDate: new Date(),
        patient: patient._id,
        prescribedBy: doctor._id,
        instructions: 'Take with food or milk',
        sideEffects: ['Stomach upset', 'Dizziness', 'Headache'],
        contraindications: ['Stomach ulcers', 'Kidney disease'],
        unitPrice: 6.50,
        currency: 'GBP',
        packSize: 24,
        manufacturer: 'PainRelief Inc',
        batchNumber: 'IBU001',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        stockQuantity: 200,
        reorderLevel: 40,
        isActive: true
      }
    ];

    // Create medications
    const createdMedications = await Medication.insertMany(sampleMedications);
    logger(`Created ${createdMedications.length} sample medications:`);
    
    createdMedications.forEach((med, index) => {
      logger(`${index + 1}. ${med.name} (${med.dosage}) - ID: ${med._id}`);
    });

    logger('\nSample medications created successfully!');
    logger('You can now see medications in the prescription dropdown.');

  } catch (error) {
    logger(`Error creating sample medications: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createSampleMedications();
}

module.exports = createSampleMedications;

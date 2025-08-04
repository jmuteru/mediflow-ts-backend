const mongoose = require('mongoose');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Configure logging
const logger = morgan('dev');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function createTestData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    if (process.env.NODE_ENV === 'development') {
      logger('Connected to MongoDB');
    }

    // Create test patient
    const patient = await Patient.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('1985-04-12'),
      gender: 'female',
      address: {
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02108',
        country: 'USA'
      },
      contact: {
        phone: '555-123-4567',
        email: 'sarah.johnson@example.com'
      },
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Spouse',
        phone: '555-987-6543'
      }
    });

    if (process.env.NODE_ENV === 'development') {
      logger(`Created test patient: ${patient._id}`);
    }

    // Create test provider
    const provider = await User.create({
      email: 'john.smith@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'doctor'
    });

    if (process.env.NODE_ENV === 'development') {
      logger(`Created test provider: ${provider._id}`);
      logger('\nTest data created successfully!');
      logger('Use these IDs in your appointment creation:');
      logger(`Patient ID: pat_${patient._id}`);
      logger(`Provider ID: doc_${provider._id}`);
    }

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger(`Error creating test data: ${error}`);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createTestData(); 
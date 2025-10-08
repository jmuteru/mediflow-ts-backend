import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function createTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    if (process.env.NODE_ENV === 'development') { console.log('Connected to MongoDB'); }

    const patient = await Patient.create({
      firstName: 'Sarah', lastName: 'Johnson', dateOfBirth: new Date('1985-04-12'), gender: 'female',
      address: { street: '123 Main St', city: 'Boston', state: 'MA', zipCode: '02108', country: 'USA' },
      contact: { phone: '555-123-4567', email: 'sarah.johnson@example.com' },
      emergencyContact: { name: 'John Johnson', relationship: 'Spouse', phone: '555-987-6543' }
    } as any);
    if (process.env.NODE_ENV === 'development') { console.log(`Created test patient: ${patient._id}`); }

    const provider = await User.create({ email: 'john.smith@example.com', password: 'password123', firstName: 'John', lastName: 'Smith', role: 'doctor' } as any);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Created test provider: ${provider._id}`);
      console.log('\nTest data created successfully!');
      console.log('Use these IDs in your appointment creation:');
      console.log(`Patient ID: pat_${patient._id}`);
      console.log(`Provider ID: doc_${provider._id}`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') { console.log(`Error creating test data: ${error}`); }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

void createTestData();



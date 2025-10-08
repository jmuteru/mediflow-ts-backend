import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function createPatients() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const patients = [
      { firstName: 'Sarah', lastName: 'Johnson', dateOfBirth: new Date('1985-04-12'), gender: 'female', address: { street: '123 Main St', city: 'Boston', state: 'MA', zipCode: '02108', country: 'USA' }, contact: { phone: '555-123-4567', email: 'sarah.johnson@example.com' }, emergencyContact: { name: 'John Johnson', relationship: 'Spouse', phone: '555-987-6543' } },
      { firstName: 'Michael', lastName: 'Chen', dateOfBirth: new Date('1992-08-23'), gender: 'male', address: { street: '456 Oak Ave', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA' }, contact: { phone: '555-234-5678', email: 'michael.chen@example.com' }, emergencyContact: { name: 'Lisa Chen', relationship: 'Sister', phone: '555-876-5432' } },
      { firstName: 'Emily', lastName: 'Davis', dateOfBirth: new Date('1978-12-05'), gender: 'female', address: { street: '789 Pine St', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' }, contact: { phone: '555-345-6789', email: 'emily.davis@example.com' }, emergencyContact: { name: 'Robert Davis', relationship: 'Husband', phone: '555-765-4321' } },
      { firstName: 'David', lastName: 'Wilson', dateOfBirth: new Date('1990-03-15'), gender: 'male', address: { street: '321 Elm St', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'USA' }, contact: { phone: '555-456-7890', email: 'david.wilson@example.com' }, emergencyContact: { name: 'Jennifer Wilson', relationship: 'Mother', phone: '555-654-3210' } }
    ];

    for (const patientData of patients) {
      const patient = await Patient.create(patientData as any);
      console.log(`Created patient: ${patient.firstName} ${patient.lastName} - ID: ${patient._id}`);
    }

    console.log('\nAll patients created successfully!');
  } catch (error) {
    console.error('Error creating patients:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

void createPatients();



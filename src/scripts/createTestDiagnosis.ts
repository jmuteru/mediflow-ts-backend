import mongoose from 'mongoose';
import Diagnosis from '../models/diagnosis.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function createTestDiagnosis() {
  await mongoose.connect(MONGODB_URI);
  try {
    let patient = await Patient.findOne({ firstName: 'John', lastName: 'Doe' });
    if (!patient) {
      patient = await Patient.create({ firstName: 'John', lastName: 'Doe', dateOfBirth: new Date('1990-01-01'), gender: 'male', address: { street: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '12345', country: 'USA' }, contact: { phone: '555-123-4567', email: 'john.doe@example.com' }, medicalHistory: 'Hypertension, Type 2 Diabetes', allergies: ['Penicillin'], medications: ['Lisinopril', 'Metformin'], emergencyContact: { name: 'Jane Doe', relationship: 'Spouse', phone: '555-987-6543' }, insurance: { provider: 'Blue Cross Blue Shield', policyNumber: 'BCBS123456789', groupNumber: 'GRP789' } } as any);
    }
    let doctor = await User.findOne({ email: 'doctor@mediflow.com' });
    if (!doctor) {
      doctor = await User.create({ firstName: 'Dr. Sarah', lastName: 'Johnson', email: 'doctor@mediflow.com', password: 'password123', role: 'doctor' } as any);
    }
    let appointment = await Appointment.findOne({ patient: patient._id });
    if (!appointment) {
      appointment = await Appointment.create({ patient: patient._id, provider: doctor._id, date: new Date(), time: '10:00 AM', duration: 30, type: 'Follow-up', status: 'scheduled', location: 'Main Clinic', reason: 'Hypertension follow-up' } as any);
    }
    const diagnosis = await Diagnosis.create({
      patient: patient._id,
      diagnosedBy: doctor._id,
      appointment: appointment._id,
      primaryDiagnosis: 'Essential Hypertension',
      secondaryDiagnoses: ['Type 2 Diabetes Mellitus', 'Hyperlipidemia'],
      icd10Codes: ['I10', 'E11.9', 'E78.5'],
      symptoms: 'Patient reports occasional headaches and fatigue. Blood pressure readings consistently elevated.',
      physicalExam: { general: 'Alert and oriented, no acute distress', cardiovascular: 'Regular rate and rhythm, no murmurs, gallops, or rubs', respiratory: 'Clear to auscultation bilaterally', gastrointestinal: 'Soft, non-tender, non-distended', musculoskeletal: 'Normal range of motion, no edema', neurological: 'Intact cranial nerves, normal motor and sensory function', skin: 'Warm and dry, no rashes or lesions' },
      vitalSigns: { bloodPressure: '150/95', heartRate: '78', temperature: '98.6', respiratoryRate: '16', oxygenSaturation: '98', weight: '75', height: '170' },
      severity: 'moderate',
      treatmentPlan: { medications: [ { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take in the morning with or without food' }, { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: 'Ongoing', instructions: 'Take with meals to reduce gastrointestinal side effects' } ], procedures: ['Blood pressure monitoring', 'Blood glucose monitoring'], followUp: 'Return in 3 months for blood pressure check and medication adjustment if needed', notes: 'Patient advised on lifestyle modifications including low-sodium diet and regular exercise' },
      followUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      notes: 'Patient education provided on hypertension management and diabetes care',
      status: 'completed'
    } as any);
    console.log('Test diagnosis created successfully:', diagnosis._id);
    console.log('Patient:', patient.firstName, patient.lastName);
    console.log('Doctor:', doctor.firstName, doctor.lastName);
    console.log('Appointment:', appointment._id);
    console.log('Primary Diagnosis:', diagnosis.primaryDiagnosis);
  } catch (error) {
    console.error('Error creating test diagnosis:', error);
  } finally {
    await mongoose.connection.close();
  }
}

void createTestDiagnosis();



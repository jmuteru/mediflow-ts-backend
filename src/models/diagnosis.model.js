const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  diagnosedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Diagnosing doctor reference is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment reference is required']
  },
  diagnosisDate: {
    type: Date,
    required: [true, 'Diagnosis date is required'],
    default: Date.now
  },
  primaryDiagnosis: {
    type: String,
    required: [true, 'Primary diagnosis is required'],
    trim: true
  },
  secondaryDiagnoses: [{
    type: String,
    trim: true
  }],
  icd10Codes: [{
    type: String,
    trim: true
  }],
  symptoms: {
    type: String,
    required: [true, 'Symptoms description is required']
  },
  physicalExam: {
    general: String,
    cardiovascular: String,
    respiratory: String,
    gastrointestinal: String,
    musculoskeletal: String,
    neurological: String,
    skin: String
  },
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    respiratoryRate: String,
    oxygenSaturation: String,
    weight: String,
    height: String
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
    default: 'moderate'
  },
  treatmentPlan: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    procedures: [String],
    followUp: String,
    notes: String
  },
  followUpDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for frequently queried fields
diagnosisSchema.index({ patient: 1 });
diagnosisSchema.index({ appointment: 1 });
diagnosisSchema.index({ diagnosedBy: 1 });
diagnosisSchema.index({ diagnosisDate: -1 });

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

module.exports = Diagnosis; 
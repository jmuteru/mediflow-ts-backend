const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
  patient: {
    type: String,
    ref: 'Patient',
    required: true
  },
  medication: {
    type: String,
    ref: 'Medication',
    required: true
  },
  prescribedBy: {
    type: String,
    ref: 'User',
    required: true
  },
  dateIssued: {
    type: Date,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  refillsAllowed: {
    type: Number,
    required: true,
    min: 0
  },
  refillsRemaining: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'filled', 'refilled', 'cancelled'],
    default: 'pending',
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  filledBy: {
    type: String, // Pharmacy ID
    default: null
  },
  filledDate: {
    type: Date,
    default: null
  },
  expirationDate: {
    type: Date
  }
}, {
  // This will add createdAt and updatedAt fields
  timestamps: true 
});

// Add index for frequently queried fields
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ medication: 1 });

// Create the model
const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
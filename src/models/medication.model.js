const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required']
  },
  route: {
    type: String,
    required: [true, 'Route of administration is required'],
    enum: ['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'other']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued'],
    default: 'active'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Prescribing doctor reference is required']
  },
  instructions: {
    type: String
  },
  sideEffects: [{
    type: String
  }],
  contraindications: [{
    type: String
  }],
  // Pricing information
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  currency: {
    type: String,
    default: 'GBP',
    enum: ['GBP', 'USD', 'EUR', 'KES', 'ETH', 'BTC']
  },
  packSize: {
    type: Number,
    default: 1,
    min: [1, 'Pack size must be at least 1']
  },
  manufacturer: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: [0, 'Reorder level cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication; 
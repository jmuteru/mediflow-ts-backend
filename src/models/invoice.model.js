const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  type: {
    type: String,
    enum: ['consultation', 'medication', 'additional'],
    default: 'additional'
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication'
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
    // Remove required validation since it's auto-generated
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'defi', 'insurance']
  },
  paymentDate: {
    type: Date
  },
  items: [invoiceItemSchema],
  notes: {
    type: String
  },
  processFlowId: {
    type: String
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  // Billing breakdown
  consultationFee: {
    type: Number,
    default: 0
  },
  medicationTotal: {
    type: Number,
    default: 0
  },
  additionalChargesTotal: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  // Payment details
  paymentDetails: {
    transactionId: String,
    cardLast4: String,
    walletAddress: String,
    transactionHash: String,
    cryptoCurrency: String,
    cashReceived: Number,
    changeGiven: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = Date.now();
      const sequence = (count + 1).toString().padStart(4, '0');
      this.invoiceNumber = `INV-${timestamp}-${sequence}`;
      console.log('Generated invoice number:', this.invoiceNumber);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to simple timestamp-based number
      this.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  }
  next();
});

// Calculate totals before saving
invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.consultationFee = this.items
      .filter(item => item.type === 'consultation')
      .reduce((sum, item) => sum + item.total, 0);
    
    this.medicationTotal = this.items
      .filter(item => item.type === 'medication')
      .reduce((sum, item) => sum + item.total, 0);
    
    this.additionalChargesTotal = this.items
      .filter(item => item.type === 'additional')
      .reduce((sum, item) => sum + item.total, 0);
    
    this.subtotal = this.consultationFee + this.medicationTotal + this.additionalChargesTotal;
    this.amount = this.subtotal - (this.discountAmount || 0);
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;

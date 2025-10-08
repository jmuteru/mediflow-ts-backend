import mongoose, { Document, Model } from 'mongoose';

export type InvoiceStatus = 'pending' | 'in_progress' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'defi' | 'insurance';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'consultation' | 'medication' | 'additional';
  medicationId?: mongoose.Types.ObjectId;
  prescriptionId?: mongoose.Types.ObjectId;
}

export interface IPaymentDetails {
  transactionId?: string;
  cardLast4?: string;
  walletAddress?: string;
  transactionHash?: string;
  cryptoCurrency?: string;
  cashReceived?: number;
  changeGiven?: number;
}

export interface IInvoice {
  invoiceNumber?: string;
  patient: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  date: Date;
  dueDate: Date;
  amount: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  items: IInvoiceItem[];
  notes?: string;
  processFlowId?: string;
  prescriptionId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  consultationFee: number;
  medicationTotal: number;
  additionalChargesTotal: number;
  subtotal: number;
  discountAmount: number;
  paymentDetails?: IPaymentDetails;
  isActive: boolean;
}

export interface IInvoiceDocument extends IInvoice, Document {}
export interface IInvoiceModel extends Model<IInvoiceDocument> {}

const invoiceItemSchema = new mongoose.Schema<IInvoiceItem>({
  description: { type: String, required: [true, 'Item description is required'] },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: [1, 'Quantity must be at least 1'] },
  unitPrice: { type: Number, required: [true, 'Unit price is required'], min: [0, 'Unit price cannot be negative'] },
  total: { type: Number, required: [true, 'Total is required'], min: [0, 'Total cannot be negative'] },
  type: { type: String, enum: ['consultation', 'medication', 'additional'], default: 'additional' },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication' },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
});

const invoiceSchema = new mongoose.Schema<IInvoiceDocument>({
  invoiceNumber: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: [true, 'Patient reference is required'] },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Provider reference is required'] },
  date: { type: Date, required: [true, 'Invoice date is required'], default: Date.now },
  dueDate: { type: Date, required: [true, 'Due date is required'] },
  amount: { type: Number, required: [true, 'Total amount is required'], min: [0, 'Amount cannot be negative'] },
  status: { type: String, enum: ['pending', 'in_progress', 'paid', 'overdue', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'defi', 'insurance'] },
  paymentDate: { type: Date },
  items: [invoiceItemSchema],
  notes: { type: String },
  processFlowId: { type: String },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  consultationFee: { type: Number, default: 0 },
  medicationTotal: { type: Number, default: 0 },
  additionalChargesTotal: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  paymentDetails: {
    transactionId: String,
    cardLast4: String,
    walletAddress: String,
    transactionHash: String,
    cryptoCurrency: String,
    cashReceived: Number,
    changeGiven: Number
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    try {
      const count = await (this.constructor as unknown as IInvoiceModel).countDocuments();
      const timestamp = Date.now();
      const sequence = (count + 1).toString().padStart(4, '0');
      this.invoiceNumber = `INV-${timestamp}-${sequence}`;
      // eslint-disable-next-line no-console
      console.log('Generated invoice number:', this.invoiceNumber);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating invoice number:', error);
      this.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  }
  next();
});

invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.consultationFee = this.items.filter(item => item.type === 'consultation').reduce((sum, item) => sum + item.total, 0);
    this.medicationTotal = this.items.filter(item => item.type === 'medication').reduce((sum, item) => sum + item.total, 0);
    this.additionalChargesTotal = this.items.filter(item => item.type === 'additional').reduce((sum, item) => sum + item.total, 0);
    this.subtotal = this.consultationFee + this.medicationTotal + this.additionalChargesTotal;
    this.amount = this.subtotal - (this.discountAmount || 0);
  }
  next();
});

const Invoice: IInvoiceModel = mongoose.model<IInvoiceDocument, IInvoiceModel>('Invoice', invoiceSchema);

export default Invoice;



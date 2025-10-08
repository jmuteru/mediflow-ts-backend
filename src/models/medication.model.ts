import mongoose, { Document, Model } from 'mongoose';

export type AdministrationRoute = 'oral' | 'intravenous' | 'intramuscular' | 'subcutaneous' | 'topical' | 'other';
export type MedicationStatus = 'active' | 'completed' | 'discontinued';
export type Currency = 'GBP' | 'USD' | 'EUR' | 'KES' | 'ETH' | 'BTC';

export interface IMedication {
  name: string;
  description: string;
  dosage: string;
  frequency: string;
  route: AdministrationRoute;
  startDate: Date;
  endDate?: Date;
  status: MedicationStatus;
  patient: mongoose.Types.ObjectId;
  prescribedBy: mongoose.Types.ObjectId;
  instructions?: string;
  sideEffects?: string[];
  contraindications?: string[];
  unitPrice: number;
  currency: Currency;
  packSize: number;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: Date;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface IMedicationDocument extends IMedication, Document {}
export interface IMedicationModel extends Model<IMedicationDocument> {}

const medicationSchema = new mongoose.Schema<IMedicationDocument>({
  name: { type: String, required: [true, 'Medication name is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  dosage: { type: String, required: [true, 'Dosage is required'] },
  frequency: { type: String, required: [true, 'Frequency is required'] },
  route: { type: String, required: [true, 'Route of administration is required'], enum: ['oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical', 'other'] },
  startDate: { type: Date, required: [true, 'Start date is required'] },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'discontinued'], default: 'active' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: [true, 'Patient reference is required'] },
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Prescribing doctor reference is required'] },
  instructions: { type: String },
  sideEffects: [{ type: String }],
  contraindications: [{ type: String }],
  unitPrice: { type: Number, required: [true, 'Unit price is required'], min: [0, 'Unit price cannot be negative'] },
  currency: { type: String, default: 'GBP', enum: ['GBP', 'USD', 'EUR', 'KES', 'ETH', 'BTC'] },
  packSize: { type: Number, default: 1, min: [1, 'Pack size must be at least 1'] },
  manufacturer: { type: String, trim: true },
  batchNumber: { type: String, trim: true },
  expiryDate: { type: Date },
  stockQuantity: { type: Number, default: 0, min: [0, 'Stock quantity cannot be negative'] },
  reorderLevel: { type: Number, default: 10, min: [0, 'Reorder level cannot be negative'] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Medication: IMedicationModel = mongoose.model<IMedicationDocument, IMedicationModel>('Medication', medicationSchema);

export default Medication;



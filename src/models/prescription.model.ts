import mongoose, { Document, Model } from 'mongoose';

export type PrescriptionStatus = 'pending' | 'filled' | 'refilled' | 'cancelled';

export interface IPrescription {
  patient: mongoose.Types.ObjectId | string;
  medication: mongoose.Types.ObjectId | string;
  prescribedBy: mongoose.Types.ObjectId | string;
  dateIssued: Date;
  quantity: string;
  refillsAllowed: number;
  refillsRemaining: number;
  status: PrescriptionStatus;
  instructions: string;
  filledBy?: string | null;
  filledDate?: Date | null;
  expirationDate?: Date;
}

export interface IPrescriptionDocument extends IPrescription, Document {}
export interface IPrescriptionModel extends Model<IPrescriptionDocument> {}

const prescriptionSchema = new mongoose.Schema<IPrescriptionDocument>({
  patient: { type: String, ref: 'Patient', required: true },
  medication: { type: String, ref: 'Medication', required: true },
  prescribedBy: { type: String, ref: 'User', required: true },
  dateIssued: { type: Date, required: true },
  quantity: { type: String, required: true },
  refillsAllowed: { type: Number, required: true, min: 0 },
  refillsRemaining: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'filled', 'refilled', 'cancelled'], default: 'pending', required: true },
  instructions: { type: String, required: true },
  filledBy: { type: String, default: null },
  filledDate: { type: Date, default: null },
  expirationDate: { type: Date }
}, { timestamps: true });

prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ medication: 1 });

const Prescription: IPrescriptionModel = mongoose.model<IPrescriptionDocument, IPrescriptionModel>('Prescription', prescriptionSchema);

export default Prescription;



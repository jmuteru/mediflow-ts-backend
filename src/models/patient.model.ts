import mongoose, { Document, Model } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IContact {
  phone: string;
  email?: string;
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IInsurance {
  provider?: string;
  policyNumber?: string;
  groupNumber?: string;
}

export interface IPatient {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: IAddress;
  contact: IContact;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  emergencyContact: IEmergencyContact;
  insurance?: IInsurance;
  isActive: boolean;
}

export interface IPatientDocument extends IPatient, Document {}
export interface IPatientModel extends Model<IPatientDocument> {}

const patientSchema = new mongoose.Schema<IPatientDocument>({
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName: { type: String, required: [true, 'Last name is required'], trim: true },
  dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
  gender: { type: String, enum: ['male', 'female', 'other'], required: [true, 'Gender is required'] },
  address: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    zipCode: { type: String, required: [true, 'ZIP code is required'] },
    country: { type: String, required: [true, 'Country is required'], default: 'USA' }
  },
  contact: {
    phone: { type: String, required: [true, 'Phone number is required'] },
    email: { type: String, trim: true, lowercase: true }
  },
  medicalHistory: { type: String },
  allergies: [{ type: String }],
  medications: [{ type: String }],
  emergencyContact: {
    name: { type: String, required: [true, 'Emergency contact name is required'] },
    relationship: { type: String, required: [true, 'Emergency contact relationship is required'] },
    phone: { type: String, required: [true, 'Emergency contact phone is required'] }
  },
  insurance: {
    provider: { type: String },
    policyNumber: { type: String },
    groupNumber: { type: String }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Patient: IPatientModel = mongoose.model<IPatientDocument, IPatientModel>('Patient', patientSchema);

export default Patient;



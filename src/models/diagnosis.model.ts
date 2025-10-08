import mongoose, { Document, Model } from 'mongoose';

export type DiagnosisSeverity = 'mild' | 'moderate' | 'severe' | 'critical';
export type DiagnosisStatus = 'pending' | 'completed' | 'cancelled';

export interface IDiagnosis {
  patient: mongoose.Types.ObjectId;
  diagnosedBy: mongoose.Types.ObjectId;
  appointment: mongoose.Types.ObjectId;
  diagnosisDate: Date;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  icd10Codes?: string[];
  symptoms: string;
  physicalExam?: Record<string, string>;
  vitalSigns?: Record<string, string>;
  severity: DiagnosisSeverity;
  treatmentPlan?: {
    medications?: { name?: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[];
    procedures?: string[];
    followUp?: string;
    notes?: string;
  };
  followUpDate?: Date;
  status: DiagnosisStatus;
  notes?: string;
  isActive: boolean;
}

export interface IDiagnosisDocument extends IDiagnosis, Document {}
export interface IDiagnosisModel extends Model<IDiagnosisDocument> {}

const diagnosisSchema = new mongoose.Schema<IDiagnosisDocument>({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: [true, 'Patient reference is required'] },
  diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Diagnosing doctor reference is required'] },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: [true, 'Appointment reference is required'] },
  diagnosisDate: { type: Date, required: [true, 'Diagnosis date is required'], default: Date.now },
  primaryDiagnosis: { type: String, required: [true, 'Primary diagnosis is required'], trim: true },
  secondaryDiagnoses: [{ type: String, trim: true }],
  icd10Codes: [{ type: String, trim: true }],
  symptoms: { type: String, required: [true, 'Symptoms description is required'] },
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
  severity: { type: String, enum: ['mild', 'moderate', 'severe', 'critical'], default: 'moderate' },
  treatmentPlan: {
    medications: [{ name: String, dosage: String, frequency: String, duration: String, instructions: String }],
    procedures: [String],
    followUp: String,
    notes: String
  },
  followUpDate: { type: Date },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

diagnosisSchema.index({ patient: 1 });
diagnosisSchema.index({ appointment: 1 });
diagnosisSchema.index({ diagnosedBy: 1 });
diagnosisSchema.index({ diagnosisDate: -1 });

const Diagnosis: IDiagnosisModel = mongoose.model<IDiagnosisDocument, IDiagnosisModel>('Diagnosis', diagnosisSchema);

export default Diagnosis;



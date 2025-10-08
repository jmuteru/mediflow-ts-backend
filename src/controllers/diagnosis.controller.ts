import Diagnosis from '../models/diagnosis.model.js';
import Appointment from '../models/appointment.model.js';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import catchAsync from '../middleware/async.js';
import AppError from '../utils/appError.js';

export const getAllDiagnoses = catchAsync(async (_req, res) => {
  const diagnoses = await Diagnosis.find({ isActive: true })
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: diagnoses.length, data: { diagnoses } });
});

export const getDiagnosisById = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id)
    .populate('patient', 'firstName lastName dateOfBirth gender')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type status');
  if (!diagnosis) return next(new AppError('Diagnosis not found', 404));
  res.status(200).json({ status: 'success', data: { diagnosis } });
});

export const createDiagnosis = catchAsync(async (req, res) => {
  const { patient, appointment, primaryDiagnosis, secondaryDiagnoses, icd10Codes, symptoms, physicalExam, vitalSigns, severity, treatmentPlan, followUpDate, notes } = req.body;
  const appointmentDoc = await Appointment.findById(appointment);
  if (!appointmentDoc) throw new AppError('Appointment not found', 404);
  if (String(appointmentDoc.patient) !== patient) throw new AppError('Appointment does not belong to the specified patient', 400);
  const diagnosis = await Diagnosis.create({
    patient,
    diagnosedBy: req.user!.id,
    appointment,
    primaryDiagnosis,
    secondaryDiagnoses: secondaryDiagnoses || [],
    icd10Codes: icd10Codes || [],
    symptoms,
    physicalExam: physicalExam || {},
    vitalSigns: vitalSigns || {},
    severity: severity || 'moderate',
    treatmentPlan: treatmentPlan || {},
    followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    notes
  });
  const populatedDiagnosis = await Diagnosis.findById(diagnosis._id)
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type');
  res.status(201).json({ status: 'success', data: { diagnosis: populatedDiagnosis } });
});

export const updateDiagnosis = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);
  if (!diagnosis) return next(new AppError('Diagnosis not found', 404));
  if (diagnosis.status === 'completed') return next(new AppError('Cannot update completed diagnosis', 400));
  const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type');
  res.status(200).json({ status: 'success', data: { diagnosis: updatedDiagnosis } });
});

export const deleteDiagnosis = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);
  if (!diagnosis) return next(new AppError('Diagnosis not found', 404));
  diagnosis.isActive = false;
  await diagnosis.save();
  res.status(204).json({ status: 'success', data: null });
});

export const getDiagnosesByPatient = catchAsync(async (req, res) => {
  const diagnoses = await Diagnosis.find({ patient: req.params.patientId, isActive: true })
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type status')
    .sort({ diagnosisDate: -1 });
  res.status(200).json({ status: 'success', results: diagnoses.length, data: { diagnoses } });
});

export const getDiagnosesByAppointment = catchAsync(async (req, res) => {
  const diagnoses = await Diagnosis.find({ appointment: req.params.appointmentId, isActive: true })
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type status');
  res.status(200).json({ status: 'success', results: diagnoses.length, data: { diagnoses } });
});

export const completeDiagnosis = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);
  if (!diagnosis) return next(new AppError('Diagnosis not found', 404));
  diagnosis.status = 'completed';
  await diagnosis.save();
  const updatedDiagnosis = await Diagnosis.findById(diagnosis._id)
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type');
  res.status(200).json({ status: 'success', data: { diagnosis: updatedDiagnosis } });
});



const Diagnosis = require('../models/diagnosis.model');
const Appointment = require('../models/appointment.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const catchAsync = require('../middleware/async');
const AppError = require('../utils/appError');

// Get all diagnoses
exports.getAllDiagnoses = catchAsync(async (req, res) => {
  const diagnoses = await Diagnosis.find({ isActive: true })
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: diagnoses.length,
    data: {
      diagnoses
    }
  });
});

// Get diagnosis by ID
exports.getDiagnosisById = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id)
    .populate('patient', 'firstName lastName dateOfBirth gender')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type status');

  if (!diagnosis) {
    return next(new AppError('Diagnosis not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      diagnosis
    }
  });
});

// Create new diagnosis
exports.createDiagnosis = catchAsync(async (req, res) => {
  const {
    patient,
    appointment,
    primaryDiagnosis,
    secondaryDiagnoses,
    icd10Codes,
    symptoms,
    physicalExam,
    vitalSigns,
    severity,
    treatmentPlan,
    followUpDate,
    notes
  } = req.body;

  // Validate that appointment exists and belongs to the patient
  const appointmentDoc = await Appointment.findById(appointment);
  if (!appointmentDoc) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointmentDoc.patient.toString() !== patient) {
    throw new AppError('Appointment does not belong to the specified patient', 400);
  }

  // Create diagnosis
  const diagnosis = await Diagnosis.create({
    patient,
    diagnosedBy: req.user.id,
    appointment,
    primaryDiagnosis,
    secondaryDiagnoses: secondaryDiagnoses || [],
    icd10Codes: icd10Codes || [],
    symptoms,
    physicalExam: physicalExam || {},
    vitalSigns: vitalSigns || {},
    severity: severity || 'moderate',
    treatmentPlan: treatmentPlan || {},
    followUpDate: followUpDate ? new Date(followUpDate) : null,
    notes
  });

  // Populate the created diagnosis
  const populatedDiagnosis = await Diagnosis.findById(diagnosis._id)
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type');

  res.status(201).json({
    status: 'success',
    data: {
      diagnosis: populatedDiagnosis
    }
  });
});

// Update diagnosis
exports.updateDiagnosis = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    return next(new AppError('Diagnosis not found', 404));
  }

  // Only allow updates if diagnosis is not completed
  if (diagnosis.status === 'completed') {
    return next(new AppError('Cannot update completed diagnosis', 400));
  }

  const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('patient', 'firstName lastName')
   .populate('diagnosedBy', 'firstName lastName')
   .populate('appointment', 'date time type');

  res.status(200).json({
    status: 'success',
    data: {
      diagnosis: updatedDiagnosis
    }
  });
});

// Delete diagnosis (soft delete)
exports.deleteDiagnosis = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    return next(new AppError('Diagnosis not found', 404));
  }

  diagnosis.isActive = false;
  await diagnosis.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get diagnoses by patient ID
exports.getDiagnosesByPatient = catchAsync(async (req, res) => {
  const diagnoses = await Diagnosis.find({ 
    patient: req.params.patientId,
    isActive: true 
  })
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type status')
    .sort({ diagnosisDate: -1 });

  res.status(200).json({
    status: 'success',
    results: diagnoses.length,
    data: {
      diagnoses
    }
  });
});

// Get diagnoses by appointment ID
exports.getDiagnosesByAppointment = catchAsync(async (req, res) => {
  const diagnoses = await Diagnosis.find({ 
    appointment: req.params.appointmentId,
    isActive: true 
  })
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type status');

  res.status(200).json({
    status: 'success',
    results: diagnoses.length,
    data: {
      diagnoses
    }
  });
});

// Complete diagnosis (mark as completed)
exports.completeDiagnosis = catchAsync(async (req, res, next) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    return next(new AppError('Diagnosis not found', 404));
  }

  diagnosis.status = 'completed';
  await diagnosis.save();

  const updatedDiagnosis = await Diagnosis.findById(diagnosis._id)
    .populate('patient', 'firstName lastName')
    .populate('diagnosedBy', 'firstName lastName')
    .populate('appointment', 'date time type');

  res.status(200).json({
    status: 'success',
    data: {
      diagnosis: updatedDiagnosis
    }
  });
}); 
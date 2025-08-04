const Prescription = require('../models/prescription.model');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');


exports.getAllPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'firstName lastName dateOfBirth')
      .populate('medication', 'name dosage')
      .populate('prescribedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth')
      .populate('medication', 'name dosage')
      .populate('prescribedBy', 'firstName lastName');

    if (!prescription) {
      return next(new AppError(`Prescription not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private
exports.createPrescription = async (req, res, next) => {
  try {
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.body.patient) ||
        !mongoose.Types.ObjectId.isValid(req.body.medication) ||
        !mongoose.Types.ObjectId.isValid(req.body.prescribedBy)) {
      return next(new AppError('Invalid ID format for patient, medication, or prescribedBy', 400));
    }

    const prescription = await Prescription.create(req.body);

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private
exports.updatePrescription = async (req, res, next) => {
  try {
    let prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return next(new AppError(`Prescription not found with id of ${req.params.id}`, 404));
    }

    // Check if filledBy ID is valid if provided
    if (req.body.filledBy && !mongoose.Types.ObjectId.isValid(req.body.filledBy)) {
      return next(new AppError('Invalid ID format for filledBy', 400));
    }

    prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private
exports.deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return next(new AppError(`Prescription not found with id of ${req.params.id}`, 404));
    }

    await prescription.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get prescriptions by patient ID
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
exports.getPrescriptionsByPatient = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.patientId)) {
      return next(new AppError('Invalid patient ID format', 400));
    }

    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('medication', 'name dosage')
      .populate('prescribedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fill prescription
// @route   POST /api/prescriptions/:id/fill
// @access  Private
exports.fillPrescription = async (req, res, next) => {
  try {
    const { pharmacyId } = req.body;

    if (!pharmacyId) {
      return next(new AppError('Please provide a pharmacy ID', 400));
    }

    let prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return next(new AppError(`Prescription not found with id of ${req.params.id}`, 404));
    }

    if (prescription.status !== 'pending') {
      return next(new AppError(`Prescription is already ${prescription.status}`, 400));
    }

    prescription = await Prescription.findByIdAndUpdate(req.params.id, {
      status: 'filled',
      filledBy: pharmacyId,
      filledDate: new Date()
    }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refill prescription
// @route   POST /api/prescriptions/:id/refill
// @access  Private
exports.refillPrescription = async (req, res, next) => {
  try {
    let prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return next(new AppError(`Prescription not found with id of ${req.params.id}`, 404));
    }

    if (prescription.refillsRemaining <= 0) {
      return next(new AppError('No refills remaining for this prescription', 400));
    }

    if (prescription.status !== 'filled' && prescription.status !== 'refilled') {
      return next(new AppError(`Cannot refill a prescription with status: ${prescription.status}`, 400));
    }

    // Check if prescription has expired
    if (prescription.expirationDate && new Date(prescription.expirationDate) < new Date()) {
      return next(new AppError('This prescription has expired', 400));
    }

    prescription = await Prescription.findByIdAndUpdate(req.params.id, {
      status: 'refilled',
      refillsRemaining: prescription.refillsRemaining - 1
    }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (err) {
    next(err);
  }
};
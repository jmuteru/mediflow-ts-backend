const Patient = require('../models/patient.model');
const AppError = require('../utils/appError');

exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({ isActive: true });

    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: {
        patients
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const newPatient = await Patient.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        patient: newPatient
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return next(new AppError('No patient found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 
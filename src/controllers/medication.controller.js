const Medication = require('../models/medication.model');
const AppError = require('../utils/appError');

exports.getAllMedications = async (req, res, next) => {
  try {
    const medications = await Medication.find({ isActive: true });

    res.status(200).json({
      status: 'success',
      results: medications.length,
      data: {
        medications
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return next(new AppError('No medication found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        medication
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createMedication = async (req, res, next) => {
  try {
    const newMedication = await Medication.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        medication: newMedication
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!medication) {
      return next(new AppError('No medication found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        medication
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!medication) {
      return next(new AppError('No medication found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 
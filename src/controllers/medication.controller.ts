import { Request, Response, NextFunction } from 'express';
import Medication from '../models/medication.model.js';
import AppError from '../utils/appError.js';

export const getAllMedications = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const medications = await Medication.find({ isActive: true });
    res.status(200).json({ status: 'success', results: medications.length, data: { medications } });
  } catch (error) {
    next(error);
  }
};

export const getMedication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) return next(new AppError('No medication found with that ID', 404));
    res.status(200).json({ status: 'success', data: { medication } });
  } catch (error) {
    next(error);
  }
};

export const createMedication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newMedication = await Medication.create(req.body);
    res.status(201).json({ status: 'success', data: { medication: newMedication } });
  } catch (error) {
    next(error);
  }
};

export const updateMedication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medication = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medication) return next(new AppError('No medication found with that ID', 404));
    res.status(200).json({ status: 'success', data: { medication } });
  } catch (error) {
    next(error);
  }
};

export const deleteMedication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medication = await Medication.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!medication) return next(new AppError('No medication found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};



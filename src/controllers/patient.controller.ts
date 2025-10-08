import { Request, Response, NextFunction } from 'express';
import Patient from '../models/patient.model.js';
import AppError from '../utils/appError.js';

export const getAllPatients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await Patient.find({ isActive: true });
    res.status(200).json({ status: 'success', results: patients.length, data: { patients } });
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return next(new AppError('No patient found with that ID', 404));
    res.status(200).json({ status: 'success', data: { patient } });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPatient = await Patient.create(req.body);
    res.status(201).json({ status: 'success', data: { patient: newPatient } });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return next(new AppError('No patient found with that ID', 404));
    res.status(200).json({ status: 'success', data: { patient } });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!patient) return next(new AppError('No patient found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};



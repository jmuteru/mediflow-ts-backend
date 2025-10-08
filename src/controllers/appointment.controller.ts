import Appointment, { IAppointmentDocument } from '../models/appointment.model.js';
import Patient, { IPatientDocument } from '../models/patient.model.js';
import User, { IUserDocument } from '../models/user.model.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

const extractId = (formattedId: unknown): string | null => {
  if (!formattedId) return null;
  if (typeof formattedId === 'string' && formattedId.match(/^[0-9a-fA-F]{24}$/)) return formattedId;
  if (typeof formattedId === 'string' && formattedId.includes('_')) return formattedId.split('_')[1];
  return formattedId as string;
};

type PopulatedAppointment = IAppointmentDocument & {
  patient?: IPatientDocument | mongoose.Types.ObjectId | any;
  provider?: IUserDocument | mongoose.Types.ObjectId | any;
};

const formatAppointmentResponse = (appointment: PopulatedAppointment) => {
  const formatted = appointment.toObject();
  formatted.id = `apt_${appointment._id}`;
  if (formatted.patient && typeof formatted.patient === 'object') {
    const p = formatted.patient as IPatientDocument;
    formatted.patient = {
      id: `pat_${p._id}`,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      contact: p.contact
    };
  } else if (formatted.patient) {
    formatted.patient = `pat_${formatted.patient}`;
  }
  if (formatted.provider && typeof formatted.provider === 'object') {
    const pr = formatted.provider as IUserDocument;
    formatted.provider = {
      id: `usr_${pr._id}`,
      firstName: pr.firstName,
      lastName: pr.lastName,
      role: pr.role,
      specialty: (pr as any).specialty
    };
  } else if (formatted.provider) {
    formatted.provider = `usr_${formatted.provider}`;
  }
  delete formatted._id;
  delete formatted.__v;
  return formatted;
};

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(String(req.query.page), 10) || 1;
    const limit = Math.min(parseInt(String(req.query.limit), 10) || 20, 100);
    const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { isActive: true };
    if (req.query.patient) query.patient = extractId(req.query.patient);
    if (req.query.provider) query.provider = extractId(req.query.provider);
    if (req.query.status) query.status = req.query.status;
    if (req.query.date) {
      const startDate = new Date(String(req.query.date));
      if (isNaN(startDate.getTime())) return next(new AppError('Invalid date format', 400));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1, time: 1 });
    const total = await Appointment.countDocuments(query);
  const formattedAppointments = appointments.map(a => formatAppointmentResponse(a as PopulatedAppointment));
    res.status(200).json({ success: true, results: appointments.length, total, page, pages: Math.ceil(total / limit), data: formattedAppointments });
  } catch (error: unknown) {
    const err = error as any;
    if (error instanceof mongoose.Error.CastError) return next(new AppError('Invalid ID format', 400));
    next(new AppError('Error fetching appointments', 500));
  }
};

export const getAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty');
    if (!appointment) return next(new AppError('No appointment found with that ID', 404));
    const formattedAppointment = formatAppointmentResponse(appointment);
    res.status(200).json({ success: true, data: formattedAppointment });
  } catch (error: unknown) {
    const err = error as any;
    if (err instanceof mongoose.Error.CastError) return next(new AppError('Invalid appointment ID', 400));
    next(new AppError('Error fetching appointment', 500));
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patientId = extractId(req.body.patient);
    const providerId = extractId(req.body.provider);
    const [patient, provider] = await Promise.all([Patient.findById(patientId), User.findById(providerId)]);
    if (!patient) return next(new AppError('Patient not found', 404));
    if (!provider) return next(new AppError('Provider not found', 404));
  const appointmentDate = new Date(String(req.body.date));
  const appointmentData = { ...req.body, patient: patientId, provider: providerId, date: appointmentDate, createdBy: (req.user as any)?._id || providerId };
    const appointment = await Appointment.create(appointmentData);
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty');
    const formattedAppointment = formatAppointmentResponse(populatedAppointment);
    res.status(201).json({ success: true, data: formattedAppointment, message: 'Appointment created successfully' });
  } catch (error: unknown) {
    const err = error as any;
    if (err instanceof mongoose.Error.ValidationError) return next(new AppError(err.message, 400));
    if (err instanceof mongoose.Error.CastError) return next(new AppError('Invalid ID format', 400));
    next(new AppError('Failed to create appointment: ' + err.message, 500));
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
  const updateData: Record<string, unknown> = { ...req.body };
    if (req.body.patient) updateData.patient = extractId(req.body.patient);
    if (req.body.provider) updateData.provider = extractId(req.body.provider);
    if (req.body.date) updateData.date = new Date(req.body.date);
    if (updateData.time || updateData.date || updateData.duration) {
      const existingAppointment = await Appointment.findById(req.params.id);
      if (!existingAppointment) return next(new AppError('No appointment found with that ID', 404));
  const hasConflict = await Appointment.checkConflicts((updateData.provider as any) || existingAppointment.provider, (updateData.date as any) || existingAppointment.date, (updateData.time as any) || existingAppointment.time, (updateData.duration as any) || existingAppointment.duration, req.params.id);
      if (hasConflict) return next(new AppError('This time slot conflicts with an existing appointment', 400));
    }
  updateData.updatedBy = (req.user as any)!._id;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty');
    if (!appointment) return next(new AppError('No appointment found with that ID', 404));
    const formattedAppointment = formatAppointmentResponse(appointment);
    res.status(200).json({ success: true, data: formattedAppointment, message: 'Appointment updated successfully' });
  } catch (error: unknown) {
    const err = error as any;
    if (err instanceof mongoose.Error.ValidationError) return next(new AppError(err.message, 400));
    if (err instanceof mongoose.Error.CastError) return next(new AppError('Invalid ID format', 400));
    next(new AppError('Error updating appointment', 500));
  }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { isActive: false, updatedBy: req.user!._id }, { new: true });
    if (!appointment) return next(new AppError('No appointment found with that ID', 404));
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error: unknown) {
    const err = error as any;
    if (err instanceof mongoose.Error.CastError) return next(new AppError('Invalid appointment ID', 400));
    next(new AppError('Error deleting appointment', 500));
  }
};

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, date } = req.query as { provider?: string; date?: string };
    if (!provider || !date) return next(new AppError('Provider and date are required', 400));
    const providerId = extractId(provider);
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) return next(new AppError('Invalid date format', 400));
  const appointments = await Appointment.find({ provider: providerId, date: { $gte: appointmentDate, $lt: new Date(new Date(appointmentDate).setDate(appointmentDate.getDate() + 1)) }, isActive: true });
    const allSlots = generateTimeSlots();
  const bookedSlots = appointments.map(apt => (apt as IAppointmentDocument).time);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    res.status(200).json({ success: true, data: { date, provider, availableSlots, bookedSlots } });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) return next(new AppError('Invalid provider ID', 400));
    next(new AppError('Error fetching available slots', 500));
  }
};

const generateTimeSlots = (startTime = '08:00 AM', endTime = '05:00 PM', interval = 30) => {
  const slots: string[] = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  while (start < end) {
    slots.push(start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    start.setMinutes(start.getMinutes() + interval);
  }
  return slots;
};



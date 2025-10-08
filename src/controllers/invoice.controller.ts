import { Request, Response, NextFunction } from 'express';
import Invoice from '../models/invoice.model.js';
import Prescription from '../models/prescription.model.js';
import AppError from '../utils/appError.js';

export const getAllInvoices = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await Invoice.find({ isActive: true })
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .populate('prescriptionId', 'status dateIssued')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
  } catch (error) { next(error); }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .populate('prescriptionId', 'status dateIssued')
      .populate('items.medicationId', 'name dosage');
    if (!invoice) return next(new AppError('No invoice found with that ID', 404));
    res.status(200).json({ status: 'success', data: { invoice } });
  } catch (error) { next(error); }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.dueDate) req.body.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const newInvoice = await Invoice.create(req.body);
    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .populate('prescriptionId', 'status dateIssued');
    res.status(201).json({ status: 'success', data: { invoice: populatedInvoice } });
  } catch (error) { next(error); }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email');
    if (!invoice) return next(new AppError('No invoice found with that ID', 404));
    res.status(200).json({ status: 'success', data: { invoice } });
  } catch (error) { next(error); }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!invoice) return next(new AppError('No invoice found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (error) { next(error); }
};

export const getInvoicesByPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await Invoice.find({ patient: req.params.patientId, isActive: true })
      .populate('provider', 'firstName lastName role email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
  } catch (error) { next(error); }
};

export const getInvoicesByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await Invoice.find({ status: req.params.status, isActive: true })
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
  } catch (error) { next(error); }
};

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentMethod, paymentDetails } = req.body as { paymentMethod?: string; paymentDetails?: unknown };
    if (!paymentMethod) return next(new AppError('Payment method is required', 400));
    const validPaymentMethods = ['cash', 'card', 'defi', 'insurance'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return next(new AppError(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`, 400));
    }
    const updateData = { status: 'paid', paymentMethod, paymentDate: new Date(), paymentDetails };
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email');
    if (!invoice) return next(new AppError('No invoice found with that ID', 404));
    if (invoice.prescriptionId) {
      try {
        await Prescription.findByIdAndUpdate(invoice.prescriptionId, { status: 'filled', filledDate: new Date() }, { new: true, runValidators: true });
      } catch { /* no-op */ }
    }
    res.status(200).json({ status: 'success', data: { invoice } });
  } catch (error) { next(error); }
};

export const getInvoiceStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await Invoice.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalInvoices = await Invoice.countDocuments({ isActive: true });
    const totalRevenueAgg = await Invoice.aggregate([
      { $match: { status: 'paid', isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.status(200).json({ status: 'success', data: { stats, totalInvoices, totalRevenue: totalRevenueAgg[0]?.total || 0 } });
  } catch (error) { next(error); }
};



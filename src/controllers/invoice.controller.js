const Invoice = require('../models/invoice.model');
const Prescription = require('../models/prescription.model');
const AppError = require('../utils/appError');

// Get all invoices
exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ isActive: true })
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .populate('prescriptionId', 'status dateIssued')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: {
        invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .populate('prescriptionId', 'status dateIssued')
      .populate('items.medicationId', 'name dosage');

    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new invoice
exports.createInvoice = async (req, res, next) => {
  try {
    // Calculate due date (30 days from now if not provided)
    if (!req.body.dueDate) {
      req.body.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const newInvoice = await Invoice.create(req.body);

    // Populate the created invoice
    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role email')
      .populate('prescriptionId', 'status dateIssued');

    res.status(201).json({
      status: 'success',
      data: {
        invoice: populatedInvoice
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update invoice
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('patient', 'firstName lastName dateOfBirth contact')
     .populate('provider', 'firstName lastName role email');

    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete invoice (soft delete)
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get invoices by patient
exports.getInvoicesByPatient = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ 
      patient: req.params.patientId,
      isActive: true 
    })
    .populate('provider', 'firstName lastName role email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: {
        invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get invoices by status
exports.getInvoicesByStatus = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ 
      status: req.params.status,
      isActive: true 
    })
    .populate('patient', 'firstName lastName dateOfBirth contact')
    .populate('provider', 'firstName lastName role email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: {
        invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

// Process payment
exports.processPayment = async (req, res, next) => {
  try {
    console.log('Processing payment for invoice:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { paymentMethod, paymentDetails } = req.body;

    // Validate required fields
    if (!paymentMethod) {
      return next(new AppError('Payment method is required', 400));
    }

    // Validate payment method enum
    const validPaymentMethods = ['cash', 'card', 'defi', 'insurance'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return next(new AppError(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`, 400));
    }

    const updateData = {
      status: 'paid',
      paymentMethod,
      paymentDate: new Date(),
      paymentDetails
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('patient', 'firstName lastName dateOfBirth contact')
     .populate('provider', 'firstName lastName role email');

    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }

    console.log('Payment processed successfully for invoice:', invoice._id);

    // Update prescription status to "filled" if prescriptionId exists
    if (invoice.prescriptionId) {
      try {
        await Prescription.findByIdAndUpdate(
          invoice.prescriptionId,
          {
            status: 'filled',
            filledDate: new Date()
          },
          { new: true, runValidators: true }
        );
        console.log(`Prescription ${invoice.prescriptionId} status updated to "filled" after payment`);
      } catch (prescriptionError) {
        console.error('Failed to update prescription status:', prescriptionError);
        // Don't fail the payment process if prescription update fails
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    next(error);
  }
};

// Get invoice statistics
exports.getInvoiceStats = async (req, res, next) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalInvoices = await Invoice.countDocuments({ isActive: true });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid', isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        totalInvoices,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

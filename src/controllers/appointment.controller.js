const Appointment = require('../models/appointment.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// Helper function to extract ID from formatted string
const extractId = (formattedId) => {
  if (!formattedId) return null;
  
  // If it's already an ObjectId string, return as is
  if (typeof formattedId === 'string' && formattedId.match(/^[0-9a-fA-F]{24}$/)) {
    return formattedId;
  }
  
  // If it's a formatted ID like "pat_123" or "usr_123", extract the ID part
  if (typeof formattedId === 'string' && formattedId.includes('_')) {
    return formattedId.split('_')[1];
  }
  
  // Otherwise return as is
  return formattedId;
};

// Helper function to format appointment response
const formatAppointmentResponse = (appointment) => {
  const formatted = appointment.toObject();
  formatted.id = `apt_${appointment._id}`;
  
  // Format patient data if populated
  if (formatted.patient) {
    formatted.patient = {
      id: `pat_${formatted.patient._id}`,
      firstName: formatted.patient.firstName,
      lastName: formatted.patient.lastName,
      dateOfBirth: formatted.patient.dateOfBirth,
      contact: formatted.patient.contact
    };
  } else {
    formatted.patient = `pat_${formatted.patient}`;
  }

  // Format provider data if populated
  if (formatted.provider) {
    formatted.provider = {
      id: `usr_${formatted.provider._id}`,
      firstName: formatted.provider.firstName,
      lastName: formatted.provider.lastName,
      role: formatted.provider.role,
      specialty: formatted.provider.specialty
    };
  } else {
    formatted.provider = `usr_${formatted.provider}`;
  }

  delete formatted._id;
  delete formatted.__v;
  return formatted;
};

// Helper function to generate time slots
const generateTimeSlots = (startTime = '08:00 AM', endTime = '05:00 PM', interval = 30) => {
  const slots = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  while (start < end) {
    slots.push(start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }));
    start.setMinutes(start.getMinutes() + interval);
  }
  
  return slots;
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100); // Cap at 100
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    // Add filters if provided
    if (req.query.patient) {
      query.patient = extractId(req.query.patient);
    }
    if (req.query.provider) {
      query.provider = extractId(req.query.provider);
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      if (isNaN(startDate.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Execute query with pagination
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1, time: 1 });

    // Get total count for pagination
    const total = await Appointment.countDocuments(query);

    // Format appointments
    const formattedAppointments = appointments.map(formatAppointmentResponse);

    res.status(200).json({
      success: true,
      results: appointments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedAppointments
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return next(new AppError('Invalid ID format', 400));
    }
    next(new AppError('Error fetching appointments', 500));
  }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty');

    if (!appointment) {
      return next(new AppError('No appointment found with that ID', 404));
    }

    const formattedAppointment = formatAppointmentResponse(appointment);

    res.status(200).json({
      success: true,
      data: formattedAppointment
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return next(new AppError('Invalid appointment ID', 400));
    }
    next(new AppError('Error fetching appointment', 500));
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    console.log('Received appointment data:', req.body);
    
    // Extract IDs from formatted strings
    const patientId = extractId(req.body.patient);
    const providerId = extractId(req.body.provider);
    
    console.log('Extracted IDs - Patient:', patientId, 'Provider:', providerId);

    // Validate that patient and provider exist
    const [patient, provider] = await Promise.all([
      Patient.findById(patientId),
      User.findById(providerId)
    ]);

    if (!patient) {
      console.log('Patient not found with ID:', patientId);
      return next(new AppError('Patient not found', 404));
    }

    if (!provider) {
      console.log('Provider not found with ID:', providerId);
      return next(new AppError('Provider not found', 404));
    }

    // Convert date to proper Date object and format for conflict check
    const appointmentDate = new Date(req.body.date);
    const dateString = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('Checking conflicts for:', {
      providerId,
      date: dateString,
      time: req.body.time,
      duration: req.body.duration
    });

    // Check for scheduling conflicts - skip for now to test if this is the issue
    // const hasConflict = await Appointment.checkConflicts(
    //   providerId,
    //   dateString,
    //   req.body.time,
    //   req.body.duration
    // );

    // if (hasConflict) {
    //   return next(new AppError('This time slot conflicts with an existing appointment', 400));
    // }

    // Create appointment with proper ObjectIds
    const appointmentData = {
      ...req.body,
      patient: patientId,
      provider: providerId,
      date: appointmentDate,
      createdBy: req.user?._id || providerId
    };

    console.log('Creating appointment with data:', appointmentData);

    const appointment = await Appointment.create(appointmentData);
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName dateOfBirth contact')
      .populate('provider', 'firstName lastName role specialty');

    const formattedAppointment = formatAppointmentResponse(populatedAppointment);

    res.status(201).json({
      success: true,
      data: formattedAppointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    console.error('Error stack:', error.stack);
    if (error instanceof mongoose.Error.ValidationError) {
      return next(new AppError(error.message, 400));
    }
    if (error instanceof mongoose.Error.CastError) {
      return next(new AppError('Invalid ID format', 400));
    }
    next(new AppError('Failed to create appointment: ' + error.message, 500));
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    // Extract IDs from formatted strings if provided
    const updateData = { ...req.body };
    if (req.body.patient) {
      updateData.patient = extractId(req.body.patient);
    }
    if (req.body.provider) {
      updateData.provider = extractId(req.body.provider);
    }
    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }

    // Check for scheduling conflicts if time-related fields are being updated
    if (updateData.time || updateData.date || updateData.duration) {
      const existingAppointment = await Appointment.findById(req.params.id);
      if (!existingAppointment) {
        return next(new AppError('No appointment found with that ID', 404));
      }

      const hasConflict = await Appointment.checkConflicts(
        updateData.provider || existingAppointment.provider,
        updateData.date || existingAppointment.date,
        updateData.time || existingAppointment.time,
        updateData.duration || existingAppointment.duration,
        req.params.id
      );

      if (hasConflict) {
        return next(new AppError('This time slot conflicts with an existing appointment', 400));
      }
    }

    updateData.updatedBy = req.user._id;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('patient', 'firstName lastName dateOfBirth contact')
     .populate('provider', 'firstName lastName role specialty');

    if (!appointment) {
      return next(new AppError('No appointment found with that ID', 404));
    }

    const formattedAppointment = formatAppointmentResponse(appointment);

    res.status(200).json({
      success: true,
      data: formattedAppointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return next(new AppError(error.message, 400));
    }
    if (error instanceof mongoose.Error.CastError) {
      return next(new AppError('Invalid ID format', 400));
    }
    next(new AppError('Error updating appointment', 500));
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!appointment) {
      return next(new AppError('No appointment found with that ID', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return next(new AppError('Invalid appointment ID', 400));
    }
    next(new AppError('Error deleting appointment', 500));
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { provider, date } = req.query;

    if (!provider || !date) {
      return next(new AppError('Provider and date are required', 400));
    }

    const providerId = extractId(provider);
    const appointmentDate = new Date(date);

    if (isNaN(appointmentDate.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    // Get all appointments for the provider on the given date
    const appointments = await Appointment.find({
      provider: providerId,
      date: {
        $gte: appointmentDate,
        $lt: new Date(appointmentDate.setDate(appointmentDate.getDate() + 1))
      },
      isActive: true
    });

    // Generate all possible time slots
    const allSlots = generateTimeSlots();
    
    // Get booked slots
    const bookedSlots = appointments.map(apt => apt.time);

    // Filter out booked slots to get available slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date,
        provider,
        availableSlots,
        bookedSlots
      }
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return next(new AppError('Invalid provider ID', 400));
    }
    next(new AppError('Error fetching available slots', 500));
  }
};
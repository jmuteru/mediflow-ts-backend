const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route to get appointments (for testing)
router.get('/public', async (req, res) => {
  try {
    const Appointment = require('../models/appointment.model');
    const appointments = await Appointment.find({ isActive: true })
      .populate('patient', 'firstName lastName dateOfBirth gender contact')
      .populate('provider', 'firstName lastName role email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments'
    });
  }
});

// Protect all routes after this
router.use(authMiddleware.protect);

// Routes
router
  .route('/')
  .get(appointmentController.getAllAppointments)
  .post(appointmentController.createAppointment);

router
  .route('/:id')
  .get(appointmentController.getAppointment)
  .patch(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

// Available slots route
router.get('/available-slots', appointmentController.getAvailableSlots);

module.exports = router; 
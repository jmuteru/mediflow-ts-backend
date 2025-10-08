import express from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(appointmentController.getAllAppointments)
  .post(appointmentController.createAppointment);

router.route('/:id')
  .get(appointmentController.getAppointment)
  .patch(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

router.get('/available-slots', appointmentController.getAvailableSlots);

export default router;


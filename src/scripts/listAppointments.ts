import mongoose from 'mongoose';
import Appointment from '../models/appointment.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function listAppointments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const appointments = await Appointment.find({ isActive: true })
      .populate('patient', 'firstName lastName')
      .populate('provider', 'firstName lastName role');
    console.log(`\nFound ${appointments.length} appointments:`);
    if (appointments.length === 0) {
      console.log('No appointments found in the database.');
    } else {
      appointments.forEach((appointment, index) => {
        console.log(`\n${index + 1}. Appointment ID: ${appointment._id}`);
        // @ts-ignore populated types
        console.log(`   Patient: ${appointment.patient?.firstName} ${appointment.patient?.lastName}`);
        // @ts-ignore populated types
        console.log(`   Provider: ${appointment.provider?.firstName} ${appointment.provider?.lastName} (${appointment.provider?.role})`);
        console.log(`   Date: ${appointment.date}`);
        console.log(`   Time: ${appointment.time}`);
        console.log(`   Type: ${appointment.type}`);
        console.log(`   Status: ${appointment.status}`);
        console.log(`   Location: ${appointment.location}`);
        console.log(`   Reason: ${appointment.reason}`);
      });
    }
  } catch (error) {
    console.error('Error listing appointments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

void listAppointments();



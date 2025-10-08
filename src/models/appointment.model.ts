import mongoose, { Document, Model } from 'mongoose';

export type AppointmentType = 'Annual Check-up' | 'Follow-up' | 'Consultation' | 'Emergency' | 'Other';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface IAppointment {
  patient: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  date: Date;
  time: string; // HH:MM AM/PM
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  location: string;
  reason: string;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IAppointmentDocument extends IAppointment, Document {
  id?: string; // virtual
}

export interface IAppointmentModel extends Model<IAppointmentDocument> {
  checkConflicts(
    provider: mongoose.Types.ObjectId,
    date: Date,
    time: string,
    duration: number,
    excludeId?: mongoose.Types.ObjectId | string | null
  ): Promise<boolean>;
}

const appointmentSchema = new mongoose.Schema<IAppointmentDocument>({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: [true, 'Appointment must have a patient'] },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Appointment must have a provider'] },
  date: {
    type: Date,
    required: [true, 'Appointment must have a date'],
    validate: {
      validator: function(date: Date) { return date >= new Date(new Date().setHours(0, 0, 0, 0)); },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Appointment must have a time'],
    validate: {
      validator: function(time: string) { const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/; return timeRegex.test(time); },
      message: 'Invalid time format. Use HH:MM AM/PM format'
    }
  },
  duration: { type: Number, required: [true, 'Appointment must have a duration'], min: [15, 'Duration must be at least 15 minutes'], max: [180, 'Duration cannot exceed 180 minutes'], validate: { validator: (d: number) => d % 15 === 0, message: 'Duration must be in 15-minute increments' } },
  type: { type: String, required: [true, 'Appointment must have a type'], enum: ['Annual Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Other'] },
  status: { type: String, required: [true, 'Appointment must have a status'], enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  location: { type: String, required: [true, 'Appointment must have a location'], trim: true },
  reason: { type: String, required: [true, 'Appointment must have a reason'], trim: true, maxlength: [500, 'Reason cannot be longer than 500 characters'] },
  notes: { type: String, trim: true, maxlength: [1000, 'Notes cannot be longer than 1000 characters'] },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Appointment must have a creator'] },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

appointmentSchema.virtual('id').get(function(this: IAppointmentDocument) { return `apt_${this._id}`; });

appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ provider: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ isActive: 1 });

appointmentSchema.pre('save', function(next) {
  if ((this as IAppointmentDocument).isModified('time')) {
    const match = this.time.match(/(\d+):(\d+) (AM|PM)/);
    if (match) {
      const [, hours, , period] = match;
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const businessStart = process.env.BUSINESS_START_TIME || '08:00';
      const businessEnd = process.env.BUSINESS_END_TIME || '17:00';
      const [startHour] = businessStart.split(':').map(Number);
      const [endHour] = businessEnd.split(':').map(Number);
      if (hour < startHour || hour >= endHour) { return next(new Error('Appointment time must be within business hours')); }
    }
  }
  next();
});

appointmentSchema.statics.checkConflicts = async function(provider, date, time, duration, excludeId = null) {
  const startTime = new Date(`${date.toISOString().split('T')[0]}T${time}`);
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const query: Record<string, unknown> = { provider, date, isActive: true };
  if (excludeId) query._id = { $ne: excludeId };
  const conflicts = await this.find({
    ...query,
    $or: [
      { $and: [{ time: { $lte: time } }, { $expr: { $gt: [{ $add: [{ $toDate: { $concat: ['$date', 'T', '$time'] } }, { $multiply: ['$duration', 60000] }] }, startTime] } }] },
      { $and: [{ time: { $gte: time } }, { $expr: { $lt: [{ $toDate: { $concat: ['$date', 'T', '$time'] } }, endTime] } }] }
    ]
  });
  return conflicts.length > 0;
};

const Appointment: IAppointmentModel = mongoose.model<IAppointmentDocument, IAppointmentModel>('Appointment', appointmentSchema);

export default Appointment;



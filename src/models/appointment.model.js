const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Appointment must have a patient']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must have a provider']
  },
  date: {
    type: Date,
    required: [true, 'Appointment must have a date'],
    validate: {
      validator: function(date) {
        return date >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Appointment must have a time'],
    validate: {
      validator: function(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/;
        return timeRegex.test(time);
      },
      message: 'Invalid time format. Use HH:MM AM/PM format'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Appointment must have a duration'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes'],
    validate: {
      validator: function(duration) {
        return duration % 15 === 0;
      },
      message: 'Duration must be in 15-minute increments'
    }
  },
  type: {
    type: String,
    required: [true, 'Appointment must have a type'],
    enum: ['Annual Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Other']
  },
  status: {
    type: String,
    required: [true, 'Appointment must have a status'],
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  location: {
    type: String,
    required: [true, 'Appointment must have a location'],
    trim: true
  },
  reason: {
    type: String,
    required: [true, 'Appointment must have a reason'],
    trim: true,
    maxlength: [500, 'Reason cannot be longer than 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be longer than 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must have a creator']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for appointment ID
appointmentSchema.virtual('id').get(function() {
  return `apt_${this._id}`;
});

// Indexes for efficient querying
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ provider: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ isActive: 1 });

// Pre-save middleware to validate business hours
appointmentSchema.pre('save', async function(next) {
  if (this.isModified('time')) {
    const [hours, minutes, period] = this.time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const businessStart = process.env.BUSINESS_START_TIME || '08:00';
    const businessEnd = process.env.BUSINESS_END_TIME || '17:00';
    const [startHour] = businessStart.split(':').map(Number);
    const [endHour] = businessEnd.split(':').map(Number);

    if (hour < startHour || hour >= endHour) {
      return next(new Error('Appointment time must be within business hours'));
    }
  }
  next();
});

// Method to check for scheduling conflicts
appointmentSchema.statics.checkConflicts = async function(provider, date, time, duration, excludeId = null) {
  const startTime = new Date(`${date}T${time}`);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const query = {
    provider,
    date,
    isActive: true,
    _id: { $ne: excludeId }
  };

  const conflicts = await this.find({
    ...query,
    $or: [
      {
        $and: [
          { time: { $lte: time } },
          { $expr: { $gt: [{ $add: [{ $toDate: { $concat: ['$date', 'T', '$time'] } }, { $multiply: ['$duration', 60000] }] }, startTime] } }
        ]
      },
      {
        $and: [
          { time: { $gte: time } },
          { $expr: { $lt: [{ $toDate: { $concat: ['$date', 'T', '$time'] } }, endTime] } }
        ]
      }
    ]
  });

  return conflicts.length > 0;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 
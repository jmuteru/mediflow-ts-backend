const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test users
    const users = [
      {
        email: 'alice.smith@mediflow.com',
        password: hashedPassword,
        firstName: 'Dr. Alice',
        lastName: 'Smith',
        role: 'doctor',
        specialty: 'General Medicine'
      },
      {
        email: 'ben.johnson@mediflow.com',
        password: hashedPassword,
        firstName: 'Nurse Ben',
        lastName: 'Johnson',
        role: 'nurse',
        specialty: 'General Nursing'
      },
      {
        email: 'carol.williams@mediflow.com',
        password: hashedPassword,
        firstName: 'Dr. Carol',
        lastName: 'Williams',
        role: 'doctor',
        specialty: 'Cardiology'
      },
      {
        email: 'david.brown@mediflow.com',
        password: hashedPassword,
        firstName: 'Nurse David',
        lastName: 'Brown',
        role: 'nurse',
        specialty: 'Emergency Care'
      }
    ];

    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`Created user: ${user.firstName} ${user.lastName} (${user.role}) - ID: ${user._id}`);
    }

    console.log('\nAll users created successfully!');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createUsers(); 
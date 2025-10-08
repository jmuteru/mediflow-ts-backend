import mongoose from 'mongoose';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect';

async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      { email: 'alice.smith@mediflow.com', password: hashedPassword, firstName: 'Dr. Alice', lastName: 'Smith', role: 'doctor' },
      { email: 'ben.johnson@mediflow.com', password: hashedPassword, firstName: 'Nurse Ben', lastName: 'Johnson', role: 'nurse' },
      { email: 'carol.williams@mediflow.com', password: hashedPassword, firstName: 'Dr. Carol', lastName: 'Williams', role: 'doctor' },
      { email: 'david.brown@mediflow.com', password: hashedPassword, firstName: 'Nurse David', lastName: 'Brown', role: 'nurse' }
    ];

    for (const userData of users) {
      const user = await User.create(userData as any);
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

void createUsers();



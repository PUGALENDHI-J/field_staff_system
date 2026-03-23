const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/field_staff_system');
    
    // Check if admin already exists
    const existing = await User.findOne({ phone: '7010425239' }); // Using company number as admin for testing
    if (existing) {
      await User.deleteOne({ _id: existing._id });
      console.log('Old test admin removed');
    }

    const admin = new User({
      name: 'Pradeep Admin',
      phone: '7010425239',
      password: 'admin123',
      role: 'Admin',
      base_salary: 50000
    });

    await admin.save();
    console.log('Test Admin created: 7010425239 / admin123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/field_staff_db');
  const admins = await User.find({ role: 'Admin' });
  console.log('Admins found:', admins.map(a => ({ phone: a.phone, name: a.name })));
  process.exit();
}

checkAdmin();

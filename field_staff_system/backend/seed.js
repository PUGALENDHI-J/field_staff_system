const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Import Models
const User = require('./models/User');
const Task = require('./models/Task');
const Stock = require('./models/Stock');
const Transaction = require('./models/Transaction');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();
    await Stock.deleteMany();
    await Transaction.deleteMany();

    console.log('Old Data Cleared');

    // Create Admin User
    const admin = await User.create({
      name: 'System Admin',
      phone: '9999999999',
      password: 'admin123',
      role: 'Admin',
      base_salary: 50000
    });

    // Create Staff Users
    const staff1 = await User.create({
      name: 'John Doe',
      phone: '8888888888',
      password: 'staff123',
      role: 'Staff',
      base_salary: 25000
    });

    const staff2 = await User.create({
      name: 'Jane Smith',
      phone: '7777777777',
      password: 'staff123',
      role: 'Staff',
      base_salary: 28000
    });

    console.log('Users Created');

    // Create Tasks
    await Task.create([
      { clientName: 'ABC Corp', assignedTo: staff1._id, status: 'Pending', notes: 'Deliver docs' },
      { clientName: 'XYZ Ind.', assignedTo: staff2._id, status: 'Completed', notes: 'Signed contract' },
      { clientName: 'Global Tech', assignedTo: staff1._id, status: 'In Progress' },
    ]);

    // Create Stocks
    await Stock.create([
      { itemName: 'Sample Product A', quantity: 150, price: 1200 },
      { itemName: 'Demo Kit B', quantity: 45, price: 5000 },
    ]);

    // Create Transactions
    await Transaction.create([
      { userId: staff1._id, amount: 5000, type: 'Collection', description: 'Advance payment from ABC Corp' },
      { userId: staff2._id, amount: 1000, type: 'Advance', description: 'Travel expenses' },
    ]);

    console.log('Seed Data Successfully Inserted!');
    process.exit();

  } catch (err) {
    console.error('Error with seed data:', err);
    process.exit(1);
  }
};

seedData();

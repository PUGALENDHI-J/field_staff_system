const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load env vars FIRST before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── MIDDLEWARE ─────────────────────────────────────────────────────────
app.use(helmet());
if (process.env.NODE_ENV === 'production') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  // Keep public login attempts throttled without blocking authenticated staff/admin APIs.
  app.use('/api/v1/auth', authLimiter);
}
app.use(cors());
app.use(express.json({ limit: '10mb' })); // limit payload size
app.use('/uploads', express.static('uploads'));

// ── AUTH ROUTE (shared) ────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/authRoutes'));

// ── ADMIN ROUTES (/api/admin/*) ────────────────────────────────────────
// All protected by: protect + admin middleware inside each route file
app.use('/api/admin/users',        require('./routes/admin/userRoutes'));
app.use('/api/admin/tasks',        require('./routes/admin/taskRoutes'));
app.use('/api/admin/attendance',   require('./routes/admin/attendanceRoutes'));
app.use('/api/admin/stocks',       require('./routes/admin/stockRoutes'));
app.use('/api/admin/transactions', require('./routes/admin/transactionRoutes'));
app.use('/api/admin/reports',      require('./routes/admin/reportRoutes'));
app.use('/api/admin/performance',  require('./routes/performanceRoutes'));

// ── STAFF ROUTES (/api/staff/*) ────────────────────────────────────────
// All protected by: protect middleware, data scoped to req.user._id
app.use('/api/staff/tasks',        require('./routes/staff/taskRoutes'));
app.use('/api/staff/attendance',   require('./routes/staff/attendanceRoutes'));
app.use('/api/staff/profile',      require('./routes/staff/profileRoutes'));
app.use('/api/staff/transactions', require('./routes/staff/transactionRoutes'));

// ── HEALTH CHECK ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'API is running', version: '1.0.0' }));

// ── ERROR HANDLING ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ── 404 HANDLER ────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

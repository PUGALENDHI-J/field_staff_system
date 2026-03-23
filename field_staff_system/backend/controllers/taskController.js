const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// ── ADMIN CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get all tasks (admin)
// @route   GET /api/admin/tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name phone')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create task (admin)
// @route   POST /api/admin/tasks
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { clientName, contactNumber, assignedTo, notes, date } = req.body;
    if (!clientName || !contactNumber || !assignedTo) {
      return res.status(400).json({ message: 'clientName, contactNumber and assignedTo are required' });
    }
    const task = await Task.create({ clientName, contactNumber, assignedTo, notes, date: date || Date.now() });
    const populated = await task.populate('assignedTo', 'name phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin update task (status, assignedTo, etc.)
// @route   PUT /api/admin/tasks/:id
const adminUpdateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { clientName, contactNumber, assignedTo, status, notes, date } = req.body;
    if (clientName !== undefined) task.clientName = clientName;
    if (contactNumber !== undefined) task.contactNumber = contactNumber;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (date !== undefined) task.date = date;

    await task.save();
    const updated = await Task.findById(task._id).populate('assignedTo', 'name phone');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete task (admin)
// @route   DELETE /api/admin/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── STAFF CONTROLLERS ──────────────────────────────────────────────────

// @desc    Get MY tasks only (staff) — IDOR protected
// @route   GET /api/staff/tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).sort({ date: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Staff updates task status/notes/location ONLY — no clientName, no reassign
// @route   PUT /api/staff/tasks/:id
const staffUpdateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    // Staff can ONLY update these fields
    const { status, notes, location } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Completed'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    if (status !== undefined) task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (location !== undefined) task.location = location;
    if (status === 'Completed') {
      task.completedAt = new Date();
      if (location !== undefined) task.completionLocation = location;
    } else if (status !== undefined && status !== 'Completed') {
      task.completedAt = undefined;
      task.completionLocation = undefined;
    }

    // Append to update history
    task.updates = task.updates || [];
    task.updates.push({
      updatedBy: req.user._id,
      status: task.status,
      notes: notes || '',
      location: location || {},
      timestamp: new Date(),
    });

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTasks, createTask, adminUpdateTask, deleteTask, getMyTasks, staffUpdateTask };

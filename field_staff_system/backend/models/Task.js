const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    clientName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    completedAt: { type: Date },
    completionLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    proofImageURL: { type: String },
    // Append-only update history from staff
    updates: [
      {
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: String,
        notes: String,
        location: { lat: Number, lng: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

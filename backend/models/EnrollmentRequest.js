const mongoose = require('mongoose');

const enrollmentRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Ensure one pending request per student per club
enrollmentRequestSchema.index({ student: 1, club: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);

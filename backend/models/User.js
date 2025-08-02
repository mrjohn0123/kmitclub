const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'club_coordinator', 'admin'],
    required: true
  },
  // Student-specific fields
  rollNo: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    sparse: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: function() {
      return this.role === 'student';
    }
  },
  year: {
    type: String,
    enum: ['1', '2', '3', '4'],
    required: function() {
      return this.role === 'student';
    }
  },
  // Club coordinator specific fields
  clubName: {
    type: String,
    required: function() {
      return this.role === 'club_coordinator';
    }
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'club_coordinator' || this.role === 'admin';
    }
  },
  // Common fields
  phone: {
    type: String,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
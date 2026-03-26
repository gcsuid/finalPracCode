const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
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
    required: true
  }
}, { timestamps: true });

UserSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this.id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', UserSchema);

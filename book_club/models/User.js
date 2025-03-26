const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema only once
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio:      { type: String, default: '' },         // For an author CV
  profileImage: { type: String, default: '' }      // For an author image URL
});

// Pre-save middleware to hash the password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare incoming password to the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
module.exports = mongoose.model('User', userSchema);

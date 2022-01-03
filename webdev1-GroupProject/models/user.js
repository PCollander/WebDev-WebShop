const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    set: v => (v.length < 10 ? v : bcrypt.hashSync(v)),
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'customer'],
    default: 'customer',
    trim: true,
    lowercase: true,
  },
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password password of the user
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 *
 */
userSchema.methods.checkPassword = async function (password) {
  return await Promise.resolve(bcrypt.compareSync(password, this.password));
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;

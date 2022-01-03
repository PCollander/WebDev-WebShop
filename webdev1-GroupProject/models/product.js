const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
    min: 0,
  },
  image: {
    type: String,
    lowercase: true,
    trim: true,
    //match: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
  },
});

// Omit the version key when serialized to JSON
productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;

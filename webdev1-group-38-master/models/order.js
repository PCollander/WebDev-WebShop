const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  items: {
    type: [
      {
        product: {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
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
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
      },
    ],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
  },
});

// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;

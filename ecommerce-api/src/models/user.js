import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
});

const User = mongoose.model('User', UserSchema);

export default User;
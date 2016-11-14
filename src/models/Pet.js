import mongoose from 'mongoose';
const { Schema } = mongoose;

const PetSchema = new Schema({
  type: String,
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Pet', PetSchema);

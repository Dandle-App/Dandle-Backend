import mongoose from 'mongoose';

export interface UserI extends mongoose.Document {
  username: string;
  password: string;
  name: string;
  refresh_tokens: [string];
}

// define schema
export const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  staff_name: {
    type: String,
    default: '',
  },
  refresh_tokens: [String],
});

// create model
const User = mongoose.model<UserI>('User', userSchema);
export default User;

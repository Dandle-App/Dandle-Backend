import mongoose from 'mongoose';

export const orgEmbeddedSchema = new mongoose.Schema({
  org_id: {
    type: String,
    unique: true,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  staff_id: {
    type: String,
    unique: true,
  },
});

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
  orgs: [orgEmbeddedSchema],
});

// create model
const User: mongoose.Model<any> = mongoose.model('User', userSchema);
export default User;

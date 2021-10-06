import mongoose from 'mongoose';

export interface OrgEmbeddedI extends mongoose.Document {
  org_id: string;
  is_admin: boolean;
  staff_id: string;
}

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

export interface UserI extends mongoose.Document {
  username: string;
  password: string;
  staff_name: string;
  orgs: [OrgEmbeddedI];
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
  orgs: [orgEmbeddedSchema],
  refresh_tokens: [String],
});

// create model
const User = mongoose.model<UserI>('User', userSchema);
export default User;

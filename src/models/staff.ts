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

export interface StaffI extends mongoose.Document {
  username: string;
  password: string;
  staff_name: string;
  orgs: [OrgEmbeddedI];
  refresh_tokens: [string];
}

// define schema

// TODO change to password_hash
export const staffSchema = new mongoose.Schema({
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
const Staff = mongoose.model<StaffI>('Staff', staffSchema);
export default Staff;

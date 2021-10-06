import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  request_type: String,
  description: String,
  additional_info: String,
  priority: Number,
});

const occupantSchema = new mongoose.Schema({
  name: String,
  phone_number: String,
  requests: [requestSchema],
});

const unitSchema = new mongoose.Schema({
  unit_id: String,
  occupant: [occupantSchema],
  qr_code: String,
  assigned_staff: [String],
});

const sectionSchema = new mongoose.Schema({
  section_name: String,
  labor_category: String,
  units: [unitSchema],
});

// define schema
const orgSchema = new mongoose.Schema({
  company_name: String,
  company_email: {
    type: String,
    unique: true,
  },
  company_phone_num: String,
  org_code: String,
  password_hash: String,
  street_address: String,
  city: String,
  country: String,
  state: String,
  zip: Number,
  sections: [sectionSchema],
});

// create model
const Organization: mongoose.Model<any> = mongoose.model(
  'Organization',
  orgSchema,
);
export default Organization;

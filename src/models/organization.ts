import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  request_type: String,
  description: String,
  additional_info: String,
  priority: Number,
});

export interface OccupantI extends mongoose.Document {
  name: string;
  phone_number: string;
}

const occupantSchema = new mongoose.Schema({
  name: String,
  phone_number: String,
  requests: [requestSchema],
});

export interface UnitI extends mongoose.Document {
  unit_id: string;
  occupant: [OccupantI];
  qr_code: string;
  assigned_staff: [string];
}

const unitSchema = new mongoose.Schema({
  unit_id: String,
  occupant: [occupantSchema],
  qr_code: String,
  assigned_staff: [String], // staff id
});

export interface SectionI extends mongoose.Document {
  section_name: string;
  labor_category: string;
  units: [UnitI];
}

const sectionSchema = new mongoose.Schema({
  section_name: String,
  labor_category: String,
  units: [unitSchema],
});

export interface OrgI extends mongoose.Document {
  company_name: string;
  company_email: string;
  company_phone_num: string;
  org_code: string;
  password_hash: string;
  street_address: string;
  city: string;
  country: string;
  state: string;
  zip: Number;
  sections: [SectionI];
}

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
const Organization: mongoose.Model<OrgI> = mongoose.model(
  'Organization',
  orgSchema,
);
export default Organization;

import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  staff_id: Number,
  staff_name: String,
  org: [
    {
      org_id: String,
      is_admin: Boolean,
    },
  ],
});

// define schema
const orgSchema = new mongoose.Schema({
  name: String,
  location: String,
  section: [
    {
      section_name: String,
      labor_category: String,
      units: [
        {
          unit_number: String,
          occupant: [
            {
              name: String,
              phone_number: String,
              request: {
                menu1: String,
                menu2: String,
                menu3: String,
                menu4: String,
              },
            },
          ],
          qr_code: String,
          assigned_staff: Number,
        },
      ],
    },
  ],
});

// create model
const Organization: mongoose.Model<any> = mongoose.model(
  'Organization',
  orgSchema,
);
export default Organization;

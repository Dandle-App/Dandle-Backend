import mongoose from 'mongoose';

// define schema
const orgSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// create model
const User: mongoose.Model<any> = mongoose.model(
    'User',
    orgSchema
);
export default User;

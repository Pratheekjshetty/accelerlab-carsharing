import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  address: {
    firstName:{type: String, required: true },
    lastName:{type: String, required: true },
    email:{type: String, required: true },
    phone:{type: Number, required: true},
    dob:{type: Date, required: true},
    gender:{type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
    alemail:{type: String, required: true},
    alphone:{type: Number, required: true},
  },
  adharnumber: { type: Number, required: true },
  licencenumber: { type: String, required: true },
  expiredate: { type: Date, required: true },
  preferredLocation:{type: String, required: true },
  experience: { type: String, required: true },
  reference: { type: Number, required: true },
  language: { type: String, required: true },
  availability: { type: String, required: true },
  driversLicense: { type: String, required: true },
  proofOfAddress: { type: String, required: true },
  status: { type: String, default: 'Driver Applied' },
  date: { type: Date, default: Date.now() },
});

const driverModel = mongoose.models.driver || mongoose.model('driver', driverSchema);
export default driverModel;

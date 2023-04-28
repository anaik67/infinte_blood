import mongoose, { SchemaType } from "mongoose";

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  donorWeight: {
    type: Number,
    required: true,
  },
  donorHeight: {
    type: Number,
    required: true,
  },
  donorBloodGroup: {
    type: String,
    required: true,
  },
});

const Donation = mongoose.model("donation", donationSchema);
export default Donation;

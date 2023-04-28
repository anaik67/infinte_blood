import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: "String",
    required: true,
  },
  lastName: {
    type: "String",
    required: true,
  },
  username: {
    type: "String",
    required: true,
    unique: true,
  },
  password: {
    type: "String",
    required: true,
  },
  dob: {
    type: "Date",
    required: true,
  },
  phone: {
    type: "Number",
  },
  address: {
    type: "String",
  },
});

const user = mongoose.model("User", userSchema);
export default user;

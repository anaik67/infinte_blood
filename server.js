import express from "express";
import mongoose from "mongoose";

import User from "./schemas/userSchema.js";
import Donation from "./schemas/donationSchema.js";

import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import user from "./schemas/userSchema.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/blood_donation")
  .then(() => {
    console.log("DB Connected Successfully");
  })
  .catch((err) => console.error(err));

//Home Page
app.get("/", (req, res) => {
  res.render("index");
});

//Signin Page
app.get("/signin", (req, res) => {
  res.render("signin", { message: "" });
});
app.post("/signin", async (req, res) => {
  const body = req.body;

  const result = await User.findOne({ username: body.username });

  if (!result) {
    res.render("signin", {
      message: "User does not exist. Please Sign Up first.",
    });
    return;
  } 
    
  if(!body.password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$")){
    res.render("signup", {
      message: "Password should be atleast 8 characters long, have one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  if (body.password !== result.password) {
    res.render("signin", {
      message: "Password entered incorrectly",
    });
    return;
  }

    let date = result.dob;
    var now = new Date();
    var current_year = now.getFullYear();
    var year_diff = current_year - date.getFullYear();

    if (year_diff < 19) {
      res.render("signin", {
        message: "Not eligible to donate blood.",
      });
      return;
    }

    const donation = new Donation({
      donorId: result._id,
      donorWeight: body.weight,
      donorHeight: body.height,
      donorBloodGroup: body.group,
    });

    await donation.save();

    res.render("signin", {
      message: `Donation Entry added successfully.`,
    });
  });

//Signup Page
app.get("/signup", async (req, res) => {
  res.render("signup", { message: "" });
});

app.get("/find", (req, res) => {
  res.render("find", { donors: [] });
});

app.get("/about", (req,res)=>{
  res.render("aboutus")
})

app.post("/find", async (req, res) => {
  const compatibility = {
    "A+": ["A+", "A-", "O+", "O-"],
    "O+": ["O+", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB+": ["A+", "A-", "O+", "O-", "B+", "B-", "AB+", "AB-"],
    "A-": ["A-", "O-"],
    "O-": ["O-"],
    "B-": ["B-", "O-"],
    "AB-": ["A-", "O-", "B-", "AB-"],
  };

  const results = await Donation.find({
    donorBloodGroup: { $in: compatibility[req.body.group] },
  })
  .sort("donorBloodGroup")
  .populate({ path: "donorId", model: "User" });


  console.log(results);
  res.render("find", { donors: results });
});

app.post("/signup", async (req, res) => {
  const body = req.body;

  const result = await User.findOne({ username: body.username });

  if (result) {
    res.render("signup", {
      message: "Username exists. Please select another",
    });
    return;
  }

  if(body.phone.length !== 10){
    res.render("signup", {
      message: "Phone number should be of 10 digits",
    });
    return;
  }

  if(!body.password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$")){
    res.render("signup", {
      message: "Password should be atleast 8 characters long, have one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  const newUser = new User({
    firstName: body.firstname,
    lastName: body.lastname,
    username: body.username,
    password: body.password,
    address: body.address,
    phone: body.phone,
    dob: body.dob,
  });

  await newUser.save();
  res.render("signup", { message: "User registered successfully" });
});

app.get("/donations/:userId", async (req,res)=>{
  const id = req.params.userId;

  const results = await User.findById(id);
  res.send(results)
})

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

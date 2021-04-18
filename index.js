const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth } = require("./middleware/auth");

const User = require("./models/User");

const app = express();
app.use(bodyParser.json());

app.use(cors());

app.get("/api", async (req, res) => {
  const data = await axios.get("https://www.worldpop.org/rest/data/pop/wpgp");
  res.json(data.data);
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    password: hashedPassword,
  });

  await user.save();

  res.status(201).json(user);
});

app.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  //check if user with given password exist
  const userExist = await User.findOne({ email });

  if (!userExist) {
    return res.status(404).json({ msg: "Unauthenticated user" });
  }

  const passwordMatch = await bcrypt.compare(password, userExist.password);

  if (!passwordMatch) {
    return res.status(404).json({ msg: "Unauthenticated user" });
  }

  console.log(userExist);

  const token = await jwt.sign(userExist._doc, "somesupersecretstring", {
    expiresIn: "1h",
  });

  res.json({ token });
});

app.post("/api/iso3", auth, async (req, res) => {
  const { iso3 } = req.body;
  console.log(req.user);

  const data = await axios.get(
    `https://www.worldpop.org/rest/data/pop/wpgp?iso3=${iso3}`
  );

  res.json(data.data);
});

mongoose
  .connect(
    `mongodb+srv://ROnnI:roni1234@cluster0.kqgou.mongodb.net/populate?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Mongo db connected successfully");
    app.listen(4000, () => console.log("App listening on 4000"));
  })
  .catch((err) => {
    console.log(err);
  });

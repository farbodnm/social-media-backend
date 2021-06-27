const router = require("express").Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/user");

router.post("/register", async(req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new userModel({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    });
  
    const user = await newUser.save();
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post("/login", async(req, res) => {
  try {
    const user = await userModel.findOne({
      $or: [{
          email: req.body.credential
      }, {
          username: req.body.credential
      }]
    });
    !user && res.status(404).json("User not found");
    const enteredPassword = await bcrypt.compare(req.body.password, user.password);
    !enteredPassword && res.status(400).json("Wrong password.")

    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err);
  }
})

module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const checkAuth = require("../middleware/check-authorization");
const upload = require("../middleware/upload");

// Update
router.put("/:id", checkAuth, upload.single("file"), async (req, res) => {
  if (req.body.userid === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {
      const user = await userModel.findById(req.params.id)
      if (user.username !== req.userData.username) {
        return res.status(401).json({
          message: "Token auth failed.",
        });
      };
      await userModel.findByIdAndUpdate(req.params.id, {
        $set: {
          profilePicture: req.file ? req.file.path : user.profilePicture,
          username: req.body.username ? req.body.username : user.username,
          firstName: req.body.firstName ? req.body.firstName : user.firstName,
          lastName: req.body.lastName ? req.body.lastName : user.lastName,
          email: req.body.email ? req.body.email : user.email,
          password: req.body.password ? req.body.password : user.password,
          desc: req.body.desc ? req.body.desc : user.desc,
          city: req.body.city ? req.body.city : user.city,
          country: req.body.country ? req.body.country : user.country,
          relationship: req.body.relationship ? req.body.relationship : user.relationship
        }
      });
      res.status(200).json("Your account has been updated successfully.");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only update your own account.");
  }
});

// Upload cover image
router.put("/:id/cover", checkAuth, upload.single("file"), async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
    console.log('1')
    if (user.username !== req.userData.username) {
      return res.status(401).json({
        message: "Token auth failed.",
      });
    };
    if (req.body.userid === req.params.id) {
      console.log('2')
      await user.updateOne(req.params.id, {
        $set: {
          coverPicture: req.file ? req.file.path : user.coverPicture
        }
      });
      res.status(200).json("Your account has been updated successfully.");
    } else {
      return res.status(403).json("You can only update your own account.");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
})

// Delete
router.delete("/:id", checkAuth, async (req, res) => {
  if (req.body.userid === req.params.id || req.body.isAdmin) {
    try {
      const user = await userModel.findById(req.params.id)
      if (user.username !== req.userData.username) {
        return res.status(401).json({
          message: "Token auth failed.",
        });
      }

      await userModel.findByIdAndDelete(req.params.id);
      res.status(200).json("Your account has been deleted successfully.");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only delete your own account.");
  }
});

// Get
router.get("/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    const {
      password,
      updatedAt,
      ...other
    } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Get profile.
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await userModel.findOne({
      username: req.params.username
    })
    if (user) {
      const {
        password,
        updatedAt,
        ...other
      } = user._doc;
      res.status(200).json(other);
    } else {
      return res.status(404).json("User not found.");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
})

// Search
router.get("/search/:username", async (req, res) => {
  const usernameRegex = new RegExp(req.params.username + ".*", "i");
  try {
    const user = await userModel.find({
      username: usernameRegex
    }).select("username firstName lastName profilePicture");
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Follow request
router.put("/:id/follow", checkAuth, async (req, res) => {
  if (req.body.userid !== req.params.id) {
    try {
      const targetUser = await userModel.findById(req.params.id);
      const user = await userModel.findById(req.body.userid);

      if (user.username !== req.userData.username) {
        return res.status(401).json({
          message: "Token auth failed.",
        });
      }

      if (!targetUser.followers.includes(req.body.userid) && !targetUser.requests.includes(req.body.userid)) {
        await targetUser.updateOne({
          $push: {
            requests: req.body.userid
          }
        });
        res.status(200).json("Request successfully sent.");
      } else if (targetUser.followers.includes(req.body.userid)) {
        res.status(403).json("You are already following this person.");
      } else {
        res.status(403).json("You have already sent a request to follow this person.");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself...")
  }
});

// Accept request
router.put("/:id/accept", checkAuth, async (req, res) => {
  if (req.body.userid !== req.params.id) {
    try {
      const targetUser = await userModel.findById(req.params.id);
      const user = await userModel.findById(req.body.userid);

      if (user.username !== req.userData.username) {
        return res.status(401).json({
          message: "Token auth failed.",
        });
      }

      if (user.requests.includes(req.params.id)) {
        await targetUser.updateOne({
          $push: {
            following: req.body.userid
          }
        });
        await user.updateOne({
          $push: {
            followers: req.params.id
          }
        });
        await user.updateOne({
          $pull: {
            requests: req.params.id
          }
        });
        res.status(200).json("Request successfully accepted.");
      } else {
        res.status(403).json("This person hasn't requested to follow you.");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself...")
  }
});

// Unfollow
router.put("/:id/unfollow", checkAuth, async (req, res) => {
  if (req.body.userid !== req.params.id) {
    try {
      const targetUser = await userModel.findById(req.params.id);
      const user = await userModel.findById(req.body.userid);

      if (user.username !== req.userData.username) {
        return res.status(401).json({
          message: "Token auth failed.",
        });
      }

      if (targetUser.followers.includes(req.body.userid)) {
        await targetUser.updateOne({
          $pull: {
            followers: req.body.userid
          }
        });
        await user.updateOne({
          $pull: {
            following: req.params.id
          }
        });
        res.status(200).json("Succesfully unfollowed.");
      } else {
        res.status(403).json("You aren't following this person.");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself...")
  }
});

module.exports = router;
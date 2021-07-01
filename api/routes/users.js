const router = require("express").Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const checkAuth = require("../middleware/check-authorization");

// Update
router.put("/:id", checkAuth, async (req, res) => {
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
      }
      await userModel.findByIdAndUpdate(req.params.id, {
        $set: req.body
      });
      res.status(200).json("Your account has been updated successfully.");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only update your own account.");
  }
});

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

// Follow
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

      if (!targetUser.followers.includes(req.body.userid)) {
        await targetUser.updateOne({
          $push: {
            followers: req.body.userid
          }
        });
        await user.updateOne({
          $push: {
            following: req.params.id
          }
        });
        res.status(200).json("Succesfully followed.");
      } else {
        res.status(403).json("You are already following this person.");
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
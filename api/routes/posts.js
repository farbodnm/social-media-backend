const router = require("express").Router();
const postModel = require("../models/post");
const userModel = require("../models/user");
const checkAuth = require("../middleware/check-authorization");
const upload = require("../middleware/upload");

// Create
router.post("/", checkAuth, upload.single("file"), async (req, res) => {
  const user = await userModel.findById(req.body.userid)
  if (user.username !== req.userData.username) {
    return res.status(401).json({
      message: "Token auth failed.",
    });
  }

  const newPost = new postModel({
    userid: req.body.userid,
    desc: req.body.desc,
    media: req.file ? req.file.path : null,
    mediatype: req.file ? req.file.mimetype.split("/")[0] : null
  });
  console.log(newPost)
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
})

// Update
router.put("/:id", checkAuth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userid)
    if (user.username !== req.userData.username) {
      return res.status(401).json({
        message: "Token auth failed.",
      });
    }

    const post = await postModel.findById(req.params.id);
    if (post.userid === req.body.userid) {
      await post.updateOne({
        $set: req.body
      });
      res.status(200).json("Post successfully updated.");
    } else {
      res.status(403).json("You can only update your own posts.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userid)
    if (user.username !== req.userData.username) {
      return res.status(401).json({
        message: "Token auth failed.",
      });
    }

    const post = await postModel.findById(req.params.id);
    if (post.userid === req.body.userid) {
      await post.deleteOne();
      res.status(200).json("Post successfully deleted.");
    } else {
      res.status(403).json("You can only delete your own posts.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like
router.put("/:id/like", checkAuth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userid)
    if (user.username !== req.userData.username) {
      return res.status(401).json({
        message: "Token auth failed.",
      });
    }

    const post = await postModel.findById(req.params.id);
    if (!post.likes.includes(req.body.userid)) {
      await post.updateOne({
        $push: {
          likes: req.body.userid
        }
      });
      res.status(200).json("You liked this post.");
    } else {
      await post.updateOne({
        $pull: {
          likes: req.body.userid
        }
      });
      res.status(200).json("You took back your like.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get one post
router.get("/:id", async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
})

// Get timeline
router.get("/timeline/all", checkAuth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userid);
    if (user.username !== req.userData.username) {
      return res.status(401).json({
        message: "Token auth failed.",
      });
    }

    const userPosts = await postModel.find({
      userid: user._id
    });
    const friendsPosts = await Promise.all(
      user.following.map((friendid) => {
        return postModel.find({
          userid: friendid
        });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
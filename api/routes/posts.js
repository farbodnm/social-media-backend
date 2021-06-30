const router = require("express").Router();
const postModel = require("../models/post");
const userModel = require("../models/user");

// Create
router.post("/", async (req, res) => {
  const newPost = new postModel(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
})

// Update
router.put("/:id", async (req, res) => {
  try {
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
router.delete("/:id", async (req, res) => {
  try {
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
router.put("/:id/like", async (req, res) => {
  try {
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
router.get("/timeline/all", async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userid);
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
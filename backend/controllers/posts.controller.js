import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import mongoose from "mongoose";

export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "Running" });
};

export const createPost = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    let imgUrl;
    if(req.file && req.file.path){
      imgUrl = req.file.path;
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: imgUrl, // req.file != undefined ? req.file.filename : "",
      // fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();

    return res.status(200).json({ message: "Post Created" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name email username profilePicture"
    );

    return res.json({ posts });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    if (post.userId.toString() != user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Post.deleteOne({ _id: post_id });

    return res.json({ message: "Post Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    if (!token || !post_id || !commentBody) {
    return res.status(400).json({ error: "Missing required fields" });
  }

    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody,
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username name profilePicture');

    return res.json(populatedComment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { post_id } = req.query;
  try {
    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    const comments = await Comment
    .find({postId: post_id})
    .populate('userId', 'username name profilePicture');

    return res.json( comments.reverse() );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.query;

  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const comment = await Comment.findOne({ _id: comment_id });

    if (!comment) {
      return res.status(404).json({ message: "Comment Not Found" });
    }

    if (comment.userId.toString() != user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Comment.deleteOne({ _id: comment_id });

    return res.json({ message: "Comment Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// export const increment_likes = async (req, res) => {
//   const { post_id } = req.body;

//   try {
//     const post = await Post.findOne({ _id: post_id });
//     // const post = await Post.findById(post_id);

//     if (!post) {
//       return res.status(404).json({ message: "Post Not Found" });
//     }

//     post.likes = (post.likes || 0) + 1;


//     await post.save();

//     return res.json({ message: "Likes Incremented" });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

export const toggle_like = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) {
    return res.status(400).json({ message: "post_id and user_id are required" });
  }

  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    // Ensure likes is always an array
    if (!Array.isArray(post.likes)) post.likes = [];

    // Convert user_id to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(user_id);

    // Use .some() and .equals() for ObjectId comparison
    const hasLiked = post.likes.some(id => id.equals(userObjectId));

    if (hasLiked) {
      post.likes.pull(userObjectId);
    } else {
      post.likes.push(userObjectId);
    }

    await post.save();

    return res.json({
      message: hasLiked ? "Like removed" : "Like added",
      likesCount: post.likes.length,
      liked: !hasLiked,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

#!/usr/bin/env node
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'storroz.db'
});

// Define database models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  profile_picture: {
    type: DataTypes.STRING(255)
  },
  bio: {
    type: DataTypes.TEXT
  },
  private_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verified_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  post_type: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('now')
  },
  location: {
    type: DataTypes.STRING(50)
  }
});

const Follower = sequelize.define('Follower', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('now')
  }
});

const Hashtag = sequelize.define('Hashtag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  }
});

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('now')
  }
});

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('now')
  }
});

const PostHashtag = sequelize.define('PostHashtag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER
  },
  receiver_id: {
    type: DataTypes.INTEGER
  },
  another_foreign_key: {
    type: DataTypes.INTEGER
  },
  hashtag_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'post_hashtag',
  timestamps: false
});

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

const AnotherModel = require('./anotherModel');
// Define relationships
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Follower, { foreignKey: 'follower_id', as: 'followers' });
User.hasMany(Follower, { foreignKey: 'following_id', as: 'following' });

Post.belongsToMany(Hashtag, { through: 'post_hashtag', foreignKey: 'post_id' });
Hashtag.belongsToMany(Post, { through: 'post_hashtag', foreignKey: 'hashtag_id' });

User.hasMany(Like, { foreignKey: 'user_id' });
Post.hasMany(Like, { foreignKey: 'post_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Post.hasMany(Comment, { foreignKey: 'post_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });

PostHashtag.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
PostHashtag.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
PostHashtag.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
PostHashtag.belongsTo(AnotherModel, { foreignKey: 'another_foreign_key', as: 'another_model' });

// Create tables
(async () => {
  await sequelize.sync({ force: true }); // Use { force: true } to recreate tables on every restart
  console.log('Database synced');
})();

//const express = require('express');
c//onst bodyParser = require('body-parser');
//const { User, Follower } = require('./models'); // Assuming you have defined your Sequelize models in a separate file


app.use(bodyParser.json());

// Register User
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists in the database
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = await User.create({ username, email, password });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login User
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (user && user.checkPassword(password)) {
      return res.json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get User Profile
app.get('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findByPk(userId);
    if (user) {
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profile_picture: user.profile_picture,
          bio: user.bio,
          private_status: user.private_status,
          verified_status: user.verified_status
        }
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update User Profile
app.put('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { bio, profile_picture, private_status } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (user) {
      user.bio = bio || user.bio;
      user.profile_picture = profile_picture || user.profile_picture;
      user.private_status = private_status || user.private_status;
      await user.save();
      return res.json({ message: 'User profile updated successfully' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Follow User
app.post('/api/users/:userId/follow', async (req, res) => {
  const userId = req.params.userId;
  const { followerId } = req.body;

  try {
    await Follower.create({ follower_id: followerId, following_id: userId });
    return res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow User
app.post('/api/users/:userId/unfollow', async (req, res) => {
  const userId = req.params.userId;
  const { followerId } = req.body;

  try {
    const follower = await Follower.findOne({ where: { follower_id: followerId, following_id: userId } });
    if (follower) {
      await follower.destroy();
      return res.json({ message: 'User unfollowed successfully' });
    } else {
      return res.status(400).json({ message: 'User is not being followed by the specified follower' });
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get User Followers
app.get('/api/users/:userId/followers', async (req, res) => {
  const userId = req.params.userId;

  try {
    const followers = await Follower.findAll({ where: { following_id: userId } });
    const followersList = followers.map(follower => ({
      follower_id: follower.follower_id,
      timestamp: follower.timestamp.toISOString() // Assuming timestamp is a Date object
    }));
    return res.json({ followers: followersList });
  } catch (error) {
    console.error('Error fetching user followers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
//const { Post, Like, Comment } = require('./models'); // Assuming you have defined your Sequelize models

const app = express();
app.use(bodyParser.json());

// Create a Post
app.post('/api/posts', async (req, res) => {
  const { user_id, post_type, content, location } = req.body;

  try {
    const newPost = await Post.create({ user_id, post_type, content, location });
    return res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Post Details
app.get('/api/posts/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findByPk(postId);
    if (post) {
      const postInfo = {
        id: post.id,
        user_id: post.user_id,
        post_type: post.post_type,
        content: post.content,
        timestamp: post.timestamp.toISOString(),
        location: post.location
      };
      return res.json({ post: postInfo });
    } else {
      return res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Like a Post
app.post('/api/posts/:postId/like', async (req, res) => {
  const { user_id } = req.body;
  const postId = req.params.postId;

  try {
    await Like.create({ user_id, post_id: postId });
    return res.status(201).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Unlike a Post
app.delete('/api/posts/:postId/like', async (req, res) => {
  const { user_id } = req.body;
  const postId = req.params.postId;

  try {
    const like = await Like.findOne({ where: { user_id, post_id: postId } });
    if (like) {
      await like.destroy();
      return res.json({ message: 'Post unliked successfully' });
    } else {
      return res.status(400).json({ message: 'User did not like this post' });
    }
  } catch (error) {
    console.error('Error unliking post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Comment on a Post
app.post('/api/posts/:postId/comment', async (req, res) => {
  const { user_id, content } = req.body;
  const postId = req.params.postId;

  try {
    await Comment.create({ user_id, post_id: postId, content });
    return res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Post Comments
app.get('/api/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findByPk(postId);
    if (post) {
      const commentsList = post.comments.map(comment => ({
        user_id: comment.user_id,
        content: comment.content,
        timestamp: comment.timestamp.toISOString()
      }));
      return res.json({ comments: commentsList });
    } else {
      return res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post comments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
//const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Get Trending Hashtags
app.get('/api/hashtags/trending', async (req, res) => {
  try {
    // Fetch trending hashtags based on your criteria (e.g., most used in recent posts)
    // For simplicity, let's assume you have a function getTrendingHashtags() that returns a list of trending hashtags
    const trendingHashtags = await getTrendingHashtags();
    return res.json({ trending_hashtags: trendingHashtags });
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Search Hashtags
app.get('/api/hashtags/search', async (req, res) => {
  const query = req.query.q;
  if (query) {
    try {
      // Perform a search for hashtags containing the query
      // For simplicity, let's assume you have a function searchHashtags(query) that returns a list of matching hashtags
      const matchingHashtags = await searchHashtags(query);
      return res.json({ matching_hashtags: matchingHashtags });
    } catch (error) {
      console.error('Error searching hashtags:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ message: 'Query parameter "q" is required for hashtag search' });
  }
});

// Get Notifications
app.get('/api/notifications', async (req, res) => {
  // Assuming you want notifications for the currently authenticated user
  // Modify this based on your authentication mechanism
  const user_id = await getUserProfile(); // Assuming you have a function getUserProfile() that returns the user ID
  if (user_id) {
    try {
      const user = await User.findByPk(user_id);
      if (user) {
        const notificationsList = await Notification.findAll({
          where: { receiver_id: user_id },
          attributes: ['id', 'sender_id', 'receiver_id', 'post_id', 'content', 'timestamp', 'is_read']
        });
        return res.json({ notifications: notificationsList });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(401).json({ message: 'Authentication required' });
  }
});

// Mark Notification as Read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  // Assuming you want to mark a notification as read for the currently authenticated user
  // Modify this based on your authentication mechanism
  const user_id = await getUserProfile(); // Assuming you have a function getUserProfile() that returns the user ID
  if (user_id) {
    const notificationId = req.params.notificationId;
    try {
      const notification = await Notification.findByPk(notificationId);
      if (notification && notification.receiver_id == user_id) {
        notification.is_read = true;
        await notification.save();
        return res.json({ message: 'Notification marked as read successfully' });
      } else {
        return res.status(404).json({ message: 'Notification not found or does not belong to the user' });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(401).json({ message: 'Authentication required' });
  }
});

// Explore page Endpoints
app.get('/api/explore', async (req, res) => {
  try {
    // Fetch and return content for the explore page based on your criteria
    // For simplicity, let's assume you have a function getExploreContent() that returns a list of content
    const exploreContent = await getExploreContent();
    return res.json({ explore_content: exploreContent });
  } catch (error) {
    console.error('Error fetching explore content:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Search Users
app.get('/api/search/users', async (req, res) => {
  const query = req.query.q;
  if (query) {
    try {
      // Perform a search for users based on the query
      // For simplicity, let's assume you have a function searchUsers(query) that returns a list of matching users
      const matchingUsers = await searchUsers(query);
      return res.json({ matching_users: matchingUsers });
    } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ message: 'Query parameter "q" is required for user search' });
  }
});

// Search Posts
app.get('/api/search/posts', async (req, res) => {
  const query = req.query.q;
  if (query) {
    try {
      // Perform a search for posts based on the query
      // For simplicity, let's assume you have a function searchPosts(query) that returns a list of matching posts
      const matchingPosts = await searchPosts(query);
      return res.json({ matching_posts: matchingPosts });
    } catch (error) {
      console.error('Error searching posts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ message: 'Query parameter "q" is required for post search' });
  }
});

// Search Hashtags
app.get('/api/search/hashtags', async (req, res) => {
  const query = req.query.q;
  if (query) {
    try {
      // Perform a search for hashtags based on the query
      // For simplicity, let's assume you have a function searchHashtags(query) that returns a list of matching hashtags
      const matchingHashtags = await searchHashtags(query);
      return res.json({ matching_hashtags: matchingHashtags });
    } catch (error) {
      console.error('Error searching hashtags:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ message: 'Query parameter "q" is required for hashtag search' });
  }
});

// Start Live Stream
app.post('/api/live/stream/start', async (req, res) => {
  const { user_id } = req.body;
  if (user_id) {
    try {
      // Check if the user exists
      const user = await User.findByPk(user_id);
      if (user) {
        // You can implement your live stream start logic here
        // For simplicity, let's assume you have a function startLiveStream(user_id) that returns a stream key or URL
        const streamKey = await startLiveStream(user_id);
        return res.json({ stream_key: streamKey, message: 'Live stream started successfully' });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error starting live stream:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ message: 'User ID is required for starting a live stream' });
  }
});

// End Live Stream
app.post('/api/live/stream/end', async (req, res) => {
  const { user_id } = req.body;
  if (user_id) {
    try {
      // Check if the user exists
      const user = await User.findByPk(user_id);
      if (user) {
        // You can implement your live stream end logic here
        // For simplicity, let's assume you have a function endLiveStream(user_id) that stops the live stream
        await endLiveStream(user_id);
        return res.json({ message: 'Live stream ended successfully' });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error ending live stream:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ message: 'User ID is required for ending a live stream' });
  }
});

// Edit Post Media
app.put('/api/posts/:post_id/edit-media', (req, res) => {
  const { post_id } = req.params;
  const { content, location } = req.body;
  Post.findByPk(post_id)
    .then(post => {
      if (post) {
        // Update post media information
        post.content = content || post.content;
        post.location = location || post.location;
        // Commit changes to the database
        return post.save();
      } else {
        return Promise.reject({ status: 404, message: 'Post not found' });
      }
    })
    .then(() => res.json({ message: 'Post media edited successfully' }))
    .catch(err => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message });
    });
});

// Share Post to Other Platforms
app.post('/api/posts/:post_id/share', (req, res) => {
  const { post_id } = req.params;
  const { platform } = req.body;
  Post.findByPk(post_id)
    .then(post => {
      if (post) {
        // Assuming you have a function to handle cross-platform sharing logic
        const success = sharePostToOtherPlatformsLogic(post, platform);
        if (success) {
          return res.json({ message: 'Post shared to other platforms successfully' });
        } else {
          return Promise.reject({ status: 500, message: 'Failed to share post to other platforms' });
        }
      } else {
        return Promise.reject({ status: 404, message: 'Post not found' });
      }
    })
    .catch(err => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message });
    });
});

// Get Post Analytics
app.get('/api/posts/:post_id/analytics', (req, res) => {
  const { post_id } = req.params;
  Post.findByPk(post_id)
    .then(post => {
      if (post) {
        // Assuming you have a function to retrieve post analytics
        const postAnalytics = getPostAnalyticsData(post);
        return res.json({ post_analytics: postAnalytics });
      } else {
        return Promise.reject({ status: 404, message: 'Post not found' });
      }
    })
    .catch(err => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message });
    });
});

// Get User Insights
app.get('/api/users/:user_id/insights', (req, res) => {
  const { user_id } = req.params;
  User.findByPk(user_id)
    .then(user => {
      if (user) {
        // Assuming you have a function to retrieve user insights
        const userInsights = getUserInsightsData(user);
        return res.json({ user_insights: userInsights });
      } else {
        return Promise.reject({ status: 404, message: 'User not found' });
      }
    })
    .catch(err => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message });
    });
});

// Import required modules
//const express = require('express');

// Create an Express application

const port = 3000; // Specify the port number

// Define the endpoint for updating privacy settings
app.put('/api/users/:user_id/privacy', (req, res) => {
    const userId = req.params.user_id;
    const privacyStatus = req.body.private_status; // Assuming the request body contains the new privacy status

    // Logic to update the user's privacy setting in the database
    // This could involve querying the database and updating the user record

    res.status(200).json({ message: 'User privacy setting updated successfully' });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

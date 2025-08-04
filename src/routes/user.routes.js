const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to get providers (for testing)
router.get('/providers', async (req, res) => {
  try {
    const User = require('../models/user.model');
    const users = await User.find({ 
      isActive: true, 
      role: { $in: ['doctor', 'nurse'] } 
    }).select('-password');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching providers'
    });
  }
});

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(restrictTo('admin'), getAllUsers);

router
  .route('/:id')
  .get(restrictTo('admin'), getUser)
  .patch(restrictTo('admin'), updateUser)
  .delete(restrictTo('admin'), deleteUser);

module.exports = router; 
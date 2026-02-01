const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // 1. Extract Token from Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token is missing
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find User in Database
    // Checks for both 'id' and 'userId' to handle variations in token payload
    req.user = await User.findById(decoded.id || decoded.userId).select('-password');

    // CRITICAL CHECK: Ensure user exists in the database
    if (!req.user) {
      console.log("Auth Error: Token is valid but User not found in database");
      return res.status(401).json({ message: 'User not found in database' });
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
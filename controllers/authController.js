const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
  const payload = {
    user: {
      id: userId
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  });
}

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ msg: 'Please provide firstName, lastName, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = signToken(user.id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const token = signToken(user.id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

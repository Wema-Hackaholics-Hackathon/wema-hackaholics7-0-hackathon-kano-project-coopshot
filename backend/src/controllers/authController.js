const bcrypt = require('bcryptjs');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email: normalizedEmail, password: hashedPassword, phone });

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    token: generateToken(user.id),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    token: generateToken(user.id),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { register, login, getMe };

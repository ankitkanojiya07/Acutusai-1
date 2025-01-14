const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Status = require("../../models/status");
const UserProfile = require('../../models/Profile');

const generateTokens = (userId) => ({
  accessToken: jwt.sign(
    { userId },
    "idea",
    { expiresIn: '30d' }
  ),


  refreshToken: jwt.sign(
    { userId },
    "idea",
    { expiresIn: '30d' }
  )
});

const validateAuthInput = (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
};

const addStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { PID, points } = req.body;

    const status = await Status.create({
      userId: id,
      panelistID: PID,
      points,
    });

    res.status(201).json({ message: 'Status added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRedirectStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { PID } = req.query;

    const pointUpdate = await Status.findOne({ where: { panelistID: PID } });
    await pointUpdate.update({ status });

    if (status === "complete") {
      const point = pointUpdate.points;
      const ProfileUpdate = await UserProfile.findOne({ where: { id: pointUpdate.userId } });
      const availablePoint = ProfileUpdate.point;
      await ProfileUpdate.update({ point: availablePoint + point });

      res.status(200).json({ message: 'Points added successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { email } = req.query;
    
    const decodedEmail = decodeURIComponent(email);

    const profile = await UserProfile.findOne({ where: { email: decodedEmail } });

    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email } = req.query;
    const decodedEmail = decodeURIComponent(email);
    let data = req.body;
    console.log(data);

    if (data.password) delete data.password;
    if (data.point) delete data.point;
    if (data.email) delete data.email;

    const userProfile = await UserProfile.findOne({ where: { email: decodedEmail } });
    console.log(userProfile)


    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    await userProfile.update(data);
    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    validateAuthInput(email, password);

    const existingUser = await UserProfile.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserProfile.create({
      email,
      password: hashedPassword,
    });

    console.log(newUser);

    const tokens = generateTokens(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...tokens,
      email: newUser.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    validateAuthInput(email, password);

    const user = await UserProfile.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      ...tokens,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.',
    });
  }
};

module.exports = {
  addStatus,
  updateRedirectStatus,
  getProfile,
  updateProfile,
  registerUser,
  loginUser,
};

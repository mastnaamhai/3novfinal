import express from 'express';
import { generateToken } from '../middleware/auth';
import { hashPassword } from '../utils/auth';
import { User } from '../models/user';

const router = express.Router();

// Fallback password for backward compatibility
const FALLBACK_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // SHA-256 of 'admin123'

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the provided password
    const hashedPassword = await hashPassword(password);
    
    // Try to find user in database first
    let user = await User.findOne();
    
    if (user) {
      // User exists in database, check password
      if (user.passwordHash === hashedPassword) {
        const token = generateToken({ userId: user._id });
        res.json({ 
          success: true, 
          token,
          message: 'Login successful' 
        });
        return;
      }
    } else {
      // No user in database, check against fallback password
      if (hashedPassword === FALLBACK_PASSWORD_HASH) {
        // Create user in database with fallback password
        user = new User({
          passwordHash: hashedPassword
        });
        await user.save();
        
        const token = generateToken({ userId: user._id });
        res.json({ 
          success: true, 
          token,
          message: 'Login successful' 
        });
        return;
      }
    }
    
    // Invalid password
    res.status(401).json({ 
      message: 'Invalid password'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @desc    Verify token
// @route   GET /api/auth/verify
router.get('/verify', (req, res) => {
  res.json({ message: 'Token is valid' });
});

// @desc    Debug environment variables
// @route   GET /api/auth/debug
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Environment debug info',
    hasGstApiKey: !!process.env.VITE_GSTIN_API_KEY,
    gstApiKeyLength: process.env.VITE_GSTIN_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV
  });
});

export default router;

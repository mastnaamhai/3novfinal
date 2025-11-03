import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ApiKey from '../models/apiKey';
import { hashPassword } from '../utils/auth';
import { User } from '../models/user';

// Fallback password for backward compatibility
const FALLBACK_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

const verifyPassword = async (password: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  
  // Try to find user in database first
  let user = await User.findOne();
  
  if (user) {
    // User exists in database, check password
    return user.passwordHash === hashedPassword;
  } else {
    // No user in database, check against fallback password
    return hashedPassword === FALLBACK_PASSWORD_HASH;
  }
};

// @desc    Get all API keys
// @route   GET /api/api-keys
export const getApiKeys = asyncHandler(async (req: Request, res: Response) => {
  const apiKeys = await ApiKey.find({ isActive: true }).select('-keyValue');
  res.json(apiKeys);
});

// @desc    Get specific API key value (requires password)
// @route   POST /api/api-keys/:keyType
export const getApiKeyValue = asyncHandler(async (req: Request, res: Response) => {
  const { keyType } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  // Verify password before proceeding
  const isPasswordValid = await verifyPassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  const apiKey = await ApiKey.findOne({ keyType, isActive: true });
  if (!apiKey) {
    res.status(404).json({ message: 'API key not found' });
    return;
  }

  res.json({ keyType: apiKey.keyType, keyValue: apiKey.keyValue, description: apiKey.description });
});

// @desc    Create or update API key
// @route   POST /api/api-keys
export const createOrUpdateApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { keyType, keyValue, description, password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  // Verify password before proceeding
  const isPasswordValid = await verifyPassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  if (!keyType || !keyValue) {
    res.status(400).json({ message: 'Key type and value are required' });
    return;
  }

  // Deactivate existing key of the same type
  await ApiKey.updateMany({ keyType, isActive: true }, { isActive: false });

  // Create new key
  const apiKey = new ApiKey({
    keyType,
    keyValue,
    description: description || '',
    isActive: true
  });

  await apiKey.save();

  res.status(201).json({ 
    message: 'API key updated successfully',
    keyType: apiKey.keyType,
    description: apiKey.description
  });
});

// @desc    Delete API key
// @route   DELETE /api/api-keys/:keyType
export const deleteApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { keyType } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  // Verify password before proceeding
  const isPasswordValid = await verifyPassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  await ApiKey.updateMany({ keyType, isActive: true }, { isActive: false });

  res.json({ message: 'API key deleted successfully' });
});

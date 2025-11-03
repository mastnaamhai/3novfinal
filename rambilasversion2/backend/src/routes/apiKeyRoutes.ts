import express from 'express';
import { getApiKeys, getApiKeyValue, createOrUpdateApiKey, deleteApiKey } from '../controllers/apiKeyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @desc    Get all API keys
// @route   GET /api/api-keys
router.get('/', getApiKeys);

// @desc    Get specific API key value (requires password)
// @route   POST /api/api-keys/:keyType
router.post('/:keyType', getApiKeyValue);

// @desc    Create or update API key
// @route   POST /api/api-keys
router.post('/', createOrUpdateApiKey);

// @desc    Delete API key
// @route   DELETE /api/api-keys/:keyType
router.delete('/:keyType', deleteApiKey);

export default router;

import express from 'express';
import {
  getCompanyInfo,
  createOrUpdateCompanyInfo,
  updateCompanyInfo,
  setCurrentBankAccount
} from '../controllers/companyInfoController';

const router = express.Router();

// @route   GET /api/company-info
// @desc    Get company information
// @access  Public
router.get('/', getCompanyInfo);

// @route   POST /api/company-info
// @desc    Create or update company information
// @access  Public
router.post('/', createOrUpdateCompanyInfo);

// @route   PUT /api/company-info
// @desc    Update company information
// @access  Public
router.put('/', updateCompanyInfo);

// @route   PUT /api/company-info/current-bank-account
// @desc    Set current bank account
// @access  Public
router.put('/current-bank-account', setCurrentBankAccount);

export default router;

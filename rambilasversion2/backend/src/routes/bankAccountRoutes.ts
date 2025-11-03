import express from 'express';
import {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  toggleBankAccountStatus
} from '../controllers/bankAccountController';

const router = express.Router();

// @route   GET /api/bank-accounts
// @desc    Get all bank accounts
// @access  Public
router.get('/', getBankAccounts);

// @route   GET /api/bank-accounts/:id
// @desc    Get bank account by ID
// @access  Public
router.get('/:id', getBankAccountById);

// @route   POST /api/bank-accounts
// @desc    Create new bank account
// @access  Public
router.post('/', createBankAccount);

// @route   PUT /api/bank-accounts/:id
// @desc    Update bank account
// @access  Public
router.put('/:id', updateBankAccount);

// @route   DELETE /api/bank-accounts/:id
// @desc    Delete bank account
// @access  Public
router.delete('/:id', deleteBankAccount);

// @route   PATCH /api/bank-accounts/:id/toggle
// @desc    Toggle bank account active status
// @access  Public
router.patch('/:id/toggle', toggleBankAccountStatus);

export default router;

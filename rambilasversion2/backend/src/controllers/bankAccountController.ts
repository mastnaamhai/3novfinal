import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import BankAccount from '../models/bankAccount';
import CompanyInfo from '../models/companyInfo';
import { createBankAccountSchema, updateBankAccountSchema } from '../utils/validation';

// @desc    Get all bank accounts
// @route   GET /api/bank-accounts
// @access  Public
export const getBankAccounts = asyncHandler(async (req: Request, res: Response) => {
  const bankAccounts = await BankAccount.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(bankAccounts);
});

// @desc    Get bank account by ID
// @route   GET /api/bank-accounts/:id
// @access  Public
export const getBankAccountById = asyncHandler(async (req: Request, res: Response) => {
  const bankAccount = await BankAccount.findById(req.params.id);
  
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }
  
  res.json(bankAccount);
});

// @desc    Create bank account
// @route   POST /api/bank-accounts
// @access  Public
export const createBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const bankAccountData = createBankAccountSchema.parse(req.body);
  
  const bankAccount = await BankAccount.create(bankAccountData);
  
  // Add to company info if it exists
  let companyInfo = await CompanyInfo.findOne();
  if (companyInfo) {
    companyInfo.bankAccounts.push(bankAccount._id as any);
    
    // If this is the first bank account, set it as current
    if (companyInfo.bankAccounts.length === 1) {
      companyInfo.currentBankAccount = bankAccount._id as any;
    }
    
    await companyInfo.save();
  }
  
  res.status(201).json(bankAccount);
});

// @desc    Update bank account
// @route   PUT /api/bank-accounts/:id
// @access  Public
export const updateBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const updateData = updateBankAccountSchema.parse(req.body);
  
  const bankAccount = await BankAccount.findById(req.params.id);
  
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }
  
  Object.assign(bankAccount, updateData);
  await bankAccount.save();
  
  res.json(bankAccount);
});

// @desc    Delete bank account
// @route   DELETE /api/bank-accounts/:id
// @access  Public
export const deleteBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const bankAccount = await BankAccount.findById(req.params.id);
  
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }
  
  // Check if this is the current bank account
  const companyInfo = await CompanyInfo.findOne();
  if (companyInfo && companyInfo.currentBankAccount?.toString() === bankAccount._id?.toString()) {
    // Set another bank account as current if available
    const otherAccounts = companyInfo.bankAccounts.filter(
      id => id.toString() !== bankAccount._id?.toString()
    );
    
    if (otherAccounts.length > 0) {
      companyInfo.currentBankAccount = otherAccounts[0];
    } else {
      companyInfo.currentBankAccount = undefined;
    }
    
    await companyInfo.save();
  }
  
  // Remove from company info's bank accounts list
  if (companyInfo) {
    companyInfo.bankAccounts = companyInfo.bankAccounts.filter(
      id => id.toString() !== bankAccount._id?.toString()
    );
    await companyInfo.save();
  }
  
  // Soft delete by setting isActive to false
  bankAccount.isActive = false;
  await bankAccount.save();
  
  res.json({ message: 'Bank account deleted successfully' });
});

// @desc    Toggle bank account active status
// @route   PATCH /api/bank-accounts/:id/toggle
// @access  Public
export const toggleBankAccountStatus = asyncHandler(async (req: Request, res: Response) => {
  const bankAccount = await BankAccount.findById(req.params.id);
  
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }
  
  bankAccount.isActive = !bankAccount.isActive;
  await bankAccount.save();
  
  res.json(bankAccount);
});

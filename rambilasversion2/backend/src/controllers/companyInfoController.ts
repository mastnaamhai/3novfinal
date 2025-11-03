import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import CompanyInfo from '../models/companyInfo';
import BankAccount from '../models/bankAccount';
import { createCompanyInfoSchema, updateCompanyInfoSchema } from '../utils/validation';

// @desc    Get company info
// @route   GET /api/company-info
// @access  Public
export const getCompanyInfo = asyncHandler(async (req: Request, res: Response) => {
  let companyInfo = await CompanyInfo.findOne()
    .populate('bankAccounts')
    .populate('currentBankAccount');

  // If no company info exists, create default one with real company information
  if (!companyInfo) {
    companyInfo = await CompanyInfo.create({
      name: 'TranspoTruck Logistics',
      address: 'No.51-C, Transport Hub, Industrial Area, Mumbai - 400001.',
      state: 'Maharashtra',
      phone1: '97907 00241',
      phone2: '90030 45541',
      email: 'info@transpotruck.com',
      website: 'www.transpotruck.com',
      gstin: '33BKTPR6363P1Z3',
      pan: 'BKTPR6363P',
      bankName: 'ICICI BANK',
      accountNumber: '603505016293',
      ifsc: 'ICIC0006035'
    });
  }

  res.json(companyInfo);
});

// @desc    Create or update company info
// @route   POST /api/company-info
// @access  Public
export const createOrUpdateCompanyInfo = asyncHandler(async (req: Request, res: Response) => {
  const companyData = createCompanyInfoSchema.parse(req.body);

  let companyInfo = await CompanyInfo.findOne();

  if (companyInfo) {
    // Update existing company info
    Object.assign(companyInfo, companyData);
    await companyInfo.save();
  } else {
    // Create new company info
    companyInfo = await CompanyInfo.create(companyData);
  }

  // Populate the response
  const populatedCompanyInfo = await CompanyInfo.findById(companyInfo._id)
    .populate('bankAccounts')
    .populate('currentBankAccount');

  res.json(populatedCompanyInfo);
});

// @desc    Update company info
// @route   PUT /api/company-info
// @access  Public
export const updateCompanyInfo = asyncHandler(async (req: Request, res: Response) => {
  const updateData = updateCompanyInfoSchema.parse(req.body);

  let companyInfo = await CompanyInfo.findOne();

  if (!companyInfo) {
    res.status(404);
    throw new Error('Company info not found');
  }

  Object.assign(companyInfo, updateData);
  await companyInfo.save();

  // Populate the response
  const populatedCompanyInfo = await CompanyInfo.findById(companyInfo._id)
    .populate('bankAccounts')
    .populate('currentBankAccount');

  res.json(populatedCompanyInfo);
});

// @desc    Set current bank account
// @route   PUT /api/company-info/current-bank-account
// @access  Public
export const setCurrentBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const { bankAccountId } = req.body;

  if (!bankAccountId) {
    res.status(400);
    throw new Error('Bank account ID is required');
  }

  // Verify bank account exists
  const bankAccount = await BankAccount.findById(bankAccountId);
  if (!bankAccount) {
    res.status(404);
    throw new Error('Bank account not found');
  }

  let companyInfo = await CompanyInfo.findOne();
  if (!companyInfo) {
    res.status(404);
    throw new Error('Company info not found');
  }

  // Add bank account to company's bank accounts if not already added
  if (!companyInfo.bankAccounts.includes(bankAccountId)) {
    companyInfo.bankAccounts.push(bankAccountId);
  }

  companyInfo.currentBankAccount = bankAccountId;
  await companyInfo.save();

  // Populate the response
  const populatedCompanyInfo = await CompanyInfo.findById(companyInfo._id)
    .populate('bankAccounts')
    .populate('currentBankAccount');

  res.json(populatedCompanyInfo);
});

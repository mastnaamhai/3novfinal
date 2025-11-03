import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Customer from '../models/customer';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';
import TruckHiringNote from '../models/truckHiringNote';
import Payment from '../models/payment';
import NumberingConfig from '../models/numbering';
import CompanyInfo from '../models/companyInfo';
import BankAccount from '../models/bankAccount';
import { backupDataSchema } from '../utils/validation';
import { hashPassword } from '../utils/auth';
import { User } from '../models/user';

// Fallback password for backward compatibility
const FALLBACK_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // SHA-256 of 'admin123'

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

// Reset only business data (LR, Invoice, THN, Payment, Customer) - keeps settings
export const resetBusinessData = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  
  if (!password) {
    res.status(400).json({ message: 'Password is required for data reset' });
    return;
  }

  // Verify password before proceeding
  const isPasswordValid = await verifyPassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  // Delete only business data, keep settings
  await Customer.deleteMany({});
  await LorryReceipt.deleteMany({});
  await Invoice.deleteMany({});
  await TruckHiringNote.deleteMany({});
  await Payment.deleteMany({});
  
  res.status(200).json({ message: 'Business data has been reset successfully. Settings and company information have been preserved.' });
});

// Reset all data including settings and company info
export const resetAllData = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  
  if (!password) {
    res.status(400).json({ message: 'Password is required for data reset' });
    return;
  }

  // Verify password before proceeding
  const isPasswordValid = await verifyPassword(password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  // Delete all data including settings
  await Customer.deleteMany({});
  await LorryReceipt.deleteMany({});
  await Invoice.deleteMany({});
  await TruckHiringNote.deleteMany({});
  await Payment.deleteMany({});
  await NumberingConfig.deleteMany({});
  await BankAccount.deleteMany({});
  await CompanyInfo.deleteMany({});
  
  // Recreate company info with real company details
  await CompanyInfo.create({
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
  
  res.status(200).json({ message: 'All data has been reset successfully.' });
});

// Legacy function for backward compatibility
export const resetData = resetAllData;

export const backupData = asyncHandler(async (req: Request, res: Response) => {
  const customers = await Customer.find({});
  const lorryReceipts = await LorryReceipt.find({});
  const invoices = await Invoice.find({});
  const truckHiringNotes = await TruckHiringNote.find({});
  const payments = await Payment.find({});
  const numberingConfigs = await NumberingConfig.find({});
  const companyInfo = await CompanyInfo.find({});
  const bankAccounts = await BankAccount.find({});

  const backup = {
    customers,
    lorryReceipts,
    invoices,
    truckHiringNotes,
    payments,
    numberingConfigs,
    companyInfo,
    bankAccounts,
  };

  res.status(200).json(backup);
});

export const restoreData = asyncHandler(async (req: Request, res: Response) => {
  const backup = backupDataSchema.parse(req.body);
  const { customers, lorryReceipts, invoices, truckHiringNotes, payments, numberingConfigs, companyInfo, bankAccounts } = backup;

  // Clear existing data
  await Customer.deleteMany({});
  await LorryReceipt.deleteMany({});
  await Invoice.deleteMany({});
  await TruckHiringNote.deleteMany({});
  await Payment.deleteMany({});
  await NumberingConfig.deleteMany({});
  await BankAccount.deleteMany({});
  await CompanyInfo.deleteMany({});

  // Insert new data with migration logic
  if (customers) await Customer.insertMany(customers);
  
  // Insert lorryReceipts (now supports both old and new riskBearer formats)
  if (lorryReceipts) await LorryReceipt.insertMany(lorryReceipts);
  
  if (invoices) await Invoice.insertMany(invoices);
  if (truckHiringNotes) await TruckHiringNote.insertMany(truckHiringNotes);
  if (payments) await Payment.insertMany(payments);
  if (numberingConfigs) await NumberingConfig.insertMany(numberingConfigs);
  if (bankAccounts) await BankAccount.insertMany(bankAccounts);
  if (companyInfo) await CompanyInfo.insertMany(companyInfo);

  res.status(200).json({ message: 'Data restored successfully.' });
});

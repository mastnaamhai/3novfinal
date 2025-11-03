import express, { Request, Response } from 'express';
import { resetData, resetBusinessData, resetAllData, backupData, restoreData } from '../controllers/dataController';
import expressAsyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Reset only business data (LR, Invoice, THN, Payment, Customer) - keeps settings
// @route   POST /api/data/reset-business
router.post('/reset-business', resetBusinessData);

// @desc    Reset all application data including settings
// @route   POST /api/data/reset-all
router.post('/reset-all', resetAllData);

// @desc    Reset all application data (legacy endpoint for backward compatibility)
// @route   POST /api/data/reset
router.post('/reset', resetData);

// @desc    Backup all application data
// @route   GET /api/data/backup
router.get('/backup', backupData);

// @desc    Restore application data from a backup
// @route   POST /api/data/restore
router.post('/restore', restoreData);

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Data routes are working', timestamp: new Date().toISOString() });
});


export default router;

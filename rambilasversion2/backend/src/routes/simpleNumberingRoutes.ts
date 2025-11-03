import express, { Request, Response } from 'express';
import NumberingConfig from '../models/numbering';
import Invoice from '../models/invoice';
import LorryReceipt from '../models/lorryReceipt';

const router = express.Router();

// Get all numbering configurations
router.get('/configs', async (req: Request, res: Response) => {
  try {
    const configs = await NumberingConfig.find({});
    res.json(configs);
  } catch (error) {
    console.error('Error fetching numbering configs:', error);
    res.status(500).json({ message: 'Error fetching numbering configs' });
  }
});

// Create or update numbering configuration
router.post('/configs', async (req: Request, res: Response) => {
  try {
    const { type, startingNumber, prefix } = req.body;
    
    if (!type || typeof startingNumber !== 'number') {
      return res.status(400).json({ message: 'Invalid configuration data' });
    }

    if (!['invoice', 'consignment'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be invoice or consignment' });
    }

    const existingConfig = await NumberingConfig.findOne({ type });
    
    if (existingConfig) {
      existingConfig.startingNumber = startingNumber;
      existingConfig.currentNumber = startingNumber;
      existingConfig.prefix = prefix || '';
      await existingConfig.save();
      res.json(existingConfig);
    } else {
      const newConfig = await NumberingConfig.create({
        type,
        startingNumber,
        currentNumber: startingNumber,
        prefix: prefix || '',
      });
      res.status(201).json(newConfig);
    }
  } catch (error) {
    console.error('Error saving numbering config:', error);
    res.status(500).json({ message: 'Error saving numbering config' });
  }
});

// Update current number
router.post('/update-current', async (req: Request, res: Response) => {
  try {
    const { type, currentNumber } = req.body;
    
    if (!type || typeof currentNumber !== 'number') {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const config = await NumberingConfig.findOne({ type });
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    config.currentNumber = currentNumber;
    await config.save();
    
    res.json(config);
  } catch (error) {
    console.error('Error updating current number:', error);
    res.status(500).json({ message: 'Error updating current number' });
  }
});

// Check for duplicate numbers
router.post('/check-duplicate', async (req: Request, res: Response) => {
  try {
    const { type, number } = req.body;
    
    if (!type || typeof number !== 'number') {
      return res.status(400).json({ message: 'Invalid data' });
    }

    let isDuplicate = false;
    
    if (type === 'invoice') {
      const existingInvoice = await Invoice.findOne({ invoiceNumber: number });
      isDuplicate = !!existingInvoice;
    } else if (type === 'consignment') {
      const existingLr = await LorryReceipt.findOne({ lrNumber: number });
      isDuplicate = !!existingLr;
    }

    res.json({ isDuplicate });
  } catch (error) {
    console.error('Error checking duplicate number:', error);
    res.status(500).json({ message: 'Error checking duplicate number' });
  }
});

// Get next number for a type
router.get('/next/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['invoice', 'consignment'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const config = await NumberingConfig.findOne({ type });
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    const nextNumber = config.currentNumber;

    // Update current number
    config.currentNumber = nextNumber + 1;
    await config.save();

    res.json({ 
      number: nextNumber, 
      currentNumber: config.currentNumber
    });
  } catch (error) {
    console.error('Error getting next number:', error);
    res.status(500).json({ message: 'Error getting next number' });
  }
});

export default router;

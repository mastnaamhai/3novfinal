import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import Customer from '../models/customer';
import LorryReceipt from '../models/lorryReceipt';
import Invoice from '../models/invoice';

// Zod schema for customer creation
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tradeName: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  gstin: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  city: z.string().optional(),
  pin: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

// Zod schema for customer update
const updateCustomerSchema = createCustomerSchema.partial();

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const customers = await Customer.find({});
  res.json(customers);
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Public
export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Get customer by GSTIN
// @route   GET /api/customers/gstin/:gstin
// @access  Public
export const getCustomerByGstin = asyncHandler(async (req: Request, res: Response) => {
  const { gstin } = req.params;

  // Validate GSTIN format (case insensitive)
  if (!gstin || gstin.length !== 15 || !/^[A-Z0-9]{15}$/i.test(gstin)) {
    res.status(400);
    throw new Error('Invalid GSTIN format');
  }

  // Search for customer with case-insensitive GSTIN
  const customer = await Customer.findOne({ 
    gstin: { $regex: new RegExp(`^${gstin.toUpperCase()}$`, 'i') }
  });

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer with this GSTIN not found');
  }
});

// @desc    Get customers that need GSTIN sync
// @route   GET /api/customers/sync-candidates
// @access  Public
export const getSyncCandidates = asyncHandler(async (req: Request, res: Response) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const customers = await Customer.find({
    gstin: { $exists: true, $nin: [null, ''] },
    $or: [
      { gstinLastVerified: { $lt: thirtyDaysAgo } },
      { gstinLastVerified: { $exists: false } },
      { gstinSource: 'api' }
    ]
  }).select('gstin gstinLastVerified gstinSource');

  res.json(customers);
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Public
export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  // Preprocess the data to remove undefined values
  const preprocessedData = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) => value !== undefined)
  );
  
  const customerData = createCustomerSchema.parse(preprocessedData);
  
  // Transform empty strings to undefined for optional fields
  const processedData = {
    ...customerData,
    gstin: customerData.gstin && customerData.gstin.trim() !== '' ? customerData.gstin : undefined,
    contactPerson: customerData.contactPerson && customerData.contactPerson.trim() !== '' ? customerData.contactPerson : undefined,
    contactPhone: customerData.contactPhone && customerData.contactPhone.trim() !== '' ? customerData.contactPhone : undefined,
    contactEmail: customerData.contactEmail && customerData.contactEmail.trim() !== '' ? customerData.contactEmail : undefined,
    city: customerData.city && customerData.city.trim() !== '' ? customerData.city : undefined,
    pin: customerData.pin && customerData.pin.trim() !== '' ? customerData.pin : undefined,
    phone: customerData.phone && customerData.phone.trim() !== '' ? customerData.phone : undefined,
    email: customerData.email && customerData.email.trim() !== '' ? customerData.email : undefined,
    tradeName: customerData.tradeName && customerData.tradeName.trim() !== '' ? customerData.tradeName : undefined,
  };
  
  try {
    const customer = new Customer(processedData);
    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error: any) {
    // Handle duplicate GSTIN error
    if (error.code === 11000 && error.keyPattern?.gstin) {
      // Find the existing customer with this GSTIN
      const existingCustomer = await Customer.findOne({ gstin: processedData.gstin });
      if (existingCustomer) {
        res.status(409).json({
          error: 'Customer with this GSTIN already exists',
          existingCustomer: existingCustomer,
          message: 'A customer with this GSTIN is already registered in the system.'
        });
        return;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Public
export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customerData = updateCustomerSchema.parse(req.body);
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.name = customerData.name || customer.name;
    customer.gstin = customerData.gstin || customer.gstin;
    customer.address = customerData.address || customer.address;
    customer.city = customerData.city || customer.city;
    customer.state = customerData.state || customer.state;
    customer.pin = customerData.pin || customer.pin;
    customer.phone = customerData.phone || customer.phone;
    customer.email = customerData.email || customer.email;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Public
export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    // Optional: Check if the customer is associated with other documents (e.g., invoices)
    const hasLorryReceipts = await LorryReceipt.exists({ 'customer.id': customer._id });
    const hasInvoices = await Invoice.exists({ 'customer.id': customer._id });

    if (hasLorryReceipts || hasInvoices) {
      res.status(400);
      throw new Error('Cannot delete customer with existing lorry receipts or invoices.');
    }

    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

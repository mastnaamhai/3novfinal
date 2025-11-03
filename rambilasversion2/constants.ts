
import type { Customer, Vehicle, CompanyInfo } from './types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Re-export city data for easy access
export * from './constants/indianCities';

export const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const initialCustomers: Customer[] = [
  { _id: '1', name: 'Navakar Enterprises Private Limited', tradeName: 'Navakar Enterprises', address: 'No-2/465,Brindavan Thotam Kasinaickanpatty,\nTirupattur - 635901', state: 'Tamil Nadu', gstin: '33ITWPS2062F1Z7', contactPerson: 'Mr. Jain', contactPhone: '9876543210', contactEmail: 'jain@navakar.com' },
  { _id: '2', name: 'Shubhkarat India Limited', tradeName: 'Shubhkarat India', address: 'Bhiwandi', state: 'Maharashtra', gstin: '27AAAAA0000A1Z5', contactPerson: 'Mr. Patel', contactPhone: '9123456789' },
  { _id: '3', name: 'Reliance Industries Limited', tradeName: 'Reliance Industries', address: 'Maker Chambers IV, Nariman Point, Mumbai', state: 'Maharashtra', gstin: '27AABCR1234D1Z2', contactEmail: 'procurement@reliance.com' },
];

export const initialVehicles: Vehicle[] = [
  { _id: '1', number: 'TN 20 AX 1234' },
  { _id: '2', number: 'TN 19 BY 5678' },
  { _id: '3', number: 'MH 04 CZ 9012' },
];

export const initialCompanyInfo: CompanyInfo = {
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
};
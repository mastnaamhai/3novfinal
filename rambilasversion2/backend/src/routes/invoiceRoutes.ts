import express from 'express';
import {
    getInvoices,
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
} from '../controllers/invoiceController';

const router = express.Router();

router.route('/')
    .get(getInvoices)
    .post(createInvoice);

router.route('/:id')
    .get(getInvoiceById)
    .put(updateInvoice)
    .delete(deleteInvoice);

export default router;

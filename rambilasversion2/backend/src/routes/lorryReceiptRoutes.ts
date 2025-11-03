import express from 'express';
import {
    getLorryReceipts,
    createLorryReceipt,
    getLorryReceiptById,
    updateLorryReceipt,
    deleteLorryReceipt,
    getUnbilledLorryReceipts
} from '../controllers/lorryReceiptController';
import { Router } from 'express';

const router = express.Router();

router.route('/')
    .get(getLorryReceipts)
    .post(createLorryReceipt);

router.route('/unbilled')
    .get(getUnbilledLorryReceipts);

router.route('/:id')
    .get(getLorryReceiptById)
    .put(updateLorryReceipt)
    .delete(deleteLorryReceipt);


export default router;

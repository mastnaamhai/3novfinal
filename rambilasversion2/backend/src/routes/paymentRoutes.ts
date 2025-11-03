import express from 'express';
import {
    getPayments,
    createPayment,
    getPaymentById,
    updatePayment,
    deletePayment
} from '../controllers/paymentController';

const router = express.Router();

router.route('/')
    .get(getPayments)
    .post(createPayment);

router.route('/:id')
    .get(getPaymentById)
    .put(updatePayment)
    .delete(deletePayment);

export default router;

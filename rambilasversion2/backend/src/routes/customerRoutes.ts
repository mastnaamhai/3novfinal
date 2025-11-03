import express from 'express';
import {
    getCustomers,
    createCustomer,
    getCustomerById,
    getCustomerByGstin,
    getSyncCandidates,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController';

const router = express.Router();

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/gstin/:gstin')
    .get(getCustomerByGstin);

router.route('/sync-candidates')
    .get(getSyncCandidates);

router.route('/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer);

export default router;

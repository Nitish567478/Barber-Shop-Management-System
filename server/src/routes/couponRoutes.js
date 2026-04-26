import express from 'express';
import {
  createCoupon,
  getMyCoupons,
  getMyCustomerVouchers,
  getRegularCustomers,
  toggleCoupon,
} from '../controllers/couponController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/my-vouchers', authorizeRole('customer'), getMyCustomerVouchers);
router.get('/barber/regular-customers', authorizeRole('barber'), getRegularCustomers);
router.get('/barber', authorizeRole('barber'), getMyCoupons);
router.post('/barber', authorizeRole('barber'), createCoupon);
router.put('/barber/:id', authorizeRole('barber'), toggleCoupon);

export default router;

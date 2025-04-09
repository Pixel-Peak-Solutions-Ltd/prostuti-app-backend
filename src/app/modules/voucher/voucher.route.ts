import express from 'express';
import { VoucherController } from './voucher.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { VoucherValidation } from './voucher.validation';

const router = express.Router();

router.post('/create-voucher',auth(USER_ROLE.admin),validateRequest(VoucherValidation.createVoucherSchema), VoucherController.createVoucher);
router.get('/all-voucher', VoucherController.getAllVouchers);
router.get('/:id', VoucherController.getVoucherByID);
router.delete('/:id',auth(USER_ROLE.admin), VoucherController.deleteVoucherByID);
router.patch('/:id',auth(USER_ROLE.admin),validateRequest(VoucherValidation.updateVoucherSchema), VoucherController.updateVoucher);

export const VoucherRoute = router;

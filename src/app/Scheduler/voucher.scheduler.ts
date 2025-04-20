import { Voucher } from '../modules/voucher/voucher.model';
import cronLogger from '../logger/cronLogger';

export async function updateVouchers(currentDate:Date) {
  try {
    cronLogger.info('Starting daily voucher expiration check');
    const voucherResult = await Voucher.updateMany(
      {
        endDate: { $lt: currentDate },
        isExpired: false,
      },
      {
        $set: {
          isExpired: true,
          isActive: false,
          markedForExpirationUpdate: true,
        },
      }
    );

    if (voucherResult.modifiedCount > 0) {
      const updatedVouchers = await Voucher.find(
        { markedForExpirationUpdate: true },
        { _id: 1 }
      ).lean();
      const voucherIds = updatedVouchers.map((v) => v._id.toString());
      await Voucher.updateMany(
        { markedForExpirationUpdate: true },
        { $unset: { markedForExpirationUpdate: '' } }
      );
      cronLogger.info('Vouchers updated successfully', {
        modifiedCount: voucherResult.modifiedCount,
        updatedIds: voucherIds,
      });
    }
  } catch (error:any) {
    cronLogger.error('Failed to update vouchers', {
      error: error.message,
      stack: error.stack,
    });
  }
}
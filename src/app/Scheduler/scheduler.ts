import cron from 'node-cron';
import { Voucher } from '../modules/voucher/voucher.model';
import { Subscription } from '../modules/subscription/subscription.model';
import cronLogger from '../logger/cronLogger';

// Schedule task to run daily at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  const currentDate = new Date();

  // Update Vouchers
  try {
    cronLogger.info('Starting daily voucher expiration check');

    // Update vouchers and mark them
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
      // Fetch updated voucher IDs
      const updatedVouchers = await Voucher.find(
        { markedForExpirationUpdate: true },
        { _id: 1 }
      ).lean();
      const voucherIds = updatedVouchers.map((v) => v._id.toString());

      // Clear the temporary flag
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

  // Update Subscriptions
  try {
    cronLogger.info('Starting daily subscription expiration check');

    // Update subscriptions and mark them
    const subscriptionResult = await Subscription.updateMany(
      {
        endDate: { $lt: currentDate },
        status: 'Active',
      },
      {
        $set: {
          status: 'Expired',
          markedForExpirationUpdate: true, 
        },
      }
    );

    if (subscriptionResult.modifiedCount > 0) {
      // Fetch updated subscription IDs
      const updatedSubscriptions = await Subscription.find(
        { markedForExpirationUpdate: true },
        { _id: 1 }
      ).lean();
      const subscriptionIds = updatedSubscriptions.map((s) => s._id.toString());

      // Clear the temporary flag
      await Subscription.updateMany(
        { markedForExpirationUpdate: true },
        { $unset: { markedForExpirationUpdate: '' } }
      );

      cronLogger.info('Subscriptions updated successfully', {
        modifiedCount: subscriptionResult.modifiedCount,
        updatedIds: subscriptionIds,
      });
    }
  } catch (error:any) {
    cronLogger.error('Failed to update subscriptions', {
      error: error.message,
      stack: error.stack,
    });
  }
});

cronLogger.info('Expiration scheduler initialized', {
  interval: 'daily at midnight',
  models: ['Voucher', 'Subscription'],
});
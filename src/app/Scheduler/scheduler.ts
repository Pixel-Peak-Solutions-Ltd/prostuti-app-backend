import cron from 'node-cron';
import { Voucher } from '../modules/voucher/voucher.model';
import { Subscription } from '../modules/subscription/subscription.model';
import { Student } from '../modules/student/student.model';
import cronLogger from '../logger/cronLogger';

// Schedule task to run daily at midnight (00:00)
cron.schedule('*/30 * * * * *', async () => {
  const currentDate = new Date();

  // Update Vouchers
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

  // Update Subscriptions
  try {
    cronLogger.info('Starting daily subscription expiration check');
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
      const updatedSubscriptions = await Subscription.find(
        { markedForExpirationUpdate: true },
        { _id: 1 }
      ).lean();
      const subscriptionIds = updatedSubscriptions.map((s) => s._id.toString());
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

  // Update Students
  try {
    cronLogger.info('Starting daily student subscription expiration check');
    const studentResult = await Student.updateMany(
      {
        subscriptionEndDate: { $lt: currentDate },
        isSubscribed: true,
      },
      {
        $set: {
          isSubscribed: false,
          markedForExpirationUpdate: true,
        },
      }
    );

    if (studentResult.modifiedCount > 0) {
      const updatedStudents = await Student.find(
        { markedForExpirationUpdate: true },
        { _id: 1 }
      ).lean();
      const studentIds = updatedStudents.map((s) => s._id.toString());
      await Student.updateMany(
        { markedForExpirationUpdate: true },
        { $unset: { markedForExpirationUpdate: '' } }
      );
      cronLogger.info('Student subscriptions updated successfully', {
        modifiedCount: studentResult.modifiedCount,
        updatedIds: studentIds,
      });
    }
  } catch (error:any) {
    cronLogger.error('Failed to update student subscriptions', {
      error: error.message,
      stack: error.stack,
    });
  }
});

cronLogger.info('Expiration scheduler initialized', {
  interval: 'daily at midnight',
  models: ['Voucher', 'Subscription', 'Student'],
});
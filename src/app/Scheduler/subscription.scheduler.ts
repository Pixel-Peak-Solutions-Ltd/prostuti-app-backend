import { Subscription } from '../modules/subscription/subscription.model';
import cronLogger from '../logger/cronLogger';

export async function updateSubscriptions(currentDate:any) {
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
}
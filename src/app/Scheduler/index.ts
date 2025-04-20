import cron from 'node-cron';
import cronLogger from '../logger/cronLogger';
import { updateStudents } from './student.scheduler';
import { updateSubscriptions } from './subscription.scheduler';
import { updateVouchers } from './voucher.scheduler';

// Schedule task to run daily at midnight (00:00)
cron.schedule('*/30 * * * * *', async () => {
  const currentDate = new Date();

   // Update Vouchers
   await updateVouchers(currentDate);

   // Update Subscriptions
   await updateSubscriptions(currentDate);
 
   // Update Students
   await updateStudents(currentDate);
});

cronLogger.info('Expiration scheduler initialized', {
  interval: 'daily at midnight',
  models: ['Voucher', 'Subscription', 'Student'],
});
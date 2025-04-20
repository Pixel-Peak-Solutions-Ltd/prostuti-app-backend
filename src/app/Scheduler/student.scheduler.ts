import { Student } from '../modules/student/student.model';
import cronLogger from '../logger/cronLogger';

export async function updateStudents(currentDate) {
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
  } catch (error) {
    cronLogger.error('Failed to update student subscriptions', {
      error: error.message,
      stack: error.stack,
    });
  }
}
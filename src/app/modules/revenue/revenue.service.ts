import { Payment } from "../payment/payment.model";

const SalesVsCostStats = async ( 
) => {
    // Define end date as June 22, 2025, 02:42 PM +06:00
    const endDate = new Date();
    
    // Calculate date ranges
    const last12Months = new Date(endDate);
    last12Months.setFullYear(endDate.getFullYear() - 1); // June 23, 2024
    const last10Weeks = new Date(endDate);
    last10Weeks.setDate(endDate.getDate() - 70); // April 13, 2025
    const last10Days = new Date(endDate);
    last10Days.setDate(endDate.getDate() - 9); // June 13, 2025

    // Daily aggregation (last 10 days: June 13 to June 22, 2025)
    const dailyStats = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: last10Days, $lte: endDate },
        },
      },
      // Lookup EnrolledCourse to identify course-related payments
      {
        $lookup: {
          from: 'enrolledcourses',
          localField: '_id',
          foreignField: 'payment_id',
          as: 'enrolledCourse',
        },
      },
      // Lookup Subscription to identify subscription-related payments
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'payment_id',
          as: 'subscription',
        },
      },
      // Group by date
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          courseEarnings: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$paymentType', 'Paid'] },
                  { $eq: ['$enrolledCourse.enrollmentType', 'Paid'] },
                ] },
                '$amount',
                0,
              ],
            },
          },
          subscriptionEarnings: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$paymentType', 'Subscription'] },
                  { $eq: ['$enrolledCourse.enrollmentType', 'Subscription'] },
                  { $ne: ['$subscription', []] },
                ] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          date: '$_id',
          totalSales: 1,
          totalAmount: 1,
          courseEarnings: 1,
          subscriptionEarnings: 1,
          _id: 0,
        },
      },
    ]);

    // Weekly aggregation (last 10 weeks: April 13 to June 22, 2025)
    const weeklyStats = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: last10Weeks, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'enrolledcourses',
          localField: '_id',
          foreignField: 'payment_id',
          as: 'enrolledCourse',
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'payment_id',
          as: 'subscription',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          courseEarnings: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$paymentType', 'Paid'] },
                  { $eq: ['$enrolledCourse.enrollmentType', 'Paid'] },
                ] },
                '$amount',
                0,
              ],
            },
          },
          subscriptionEarnings: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$paymentType', 'Subscription'] },
                  { $eq: ['$enrolledCourse.enrollmentType', 'Subscription'] },
                  { $ne: ['$subscription', []] },
                ] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.week': -1 } },
      { $limit: 10 },
      {
        $project: {
          week: {
            $concat: [
              { $toString: '$_id.year' },
              '-W',
              { $toString: '$_id.week' },
            ],
          },
          totalSales: 1,
          totalAmount: 1,
          courseEarnings: 1,
          subscriptionEarnings: 1,
          _id: 0,
        },
      },
    ]);

    // Monthly aggregation (last 12 months: July 2024 to June 2025)
    const monthlyStats = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: last12Months, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'enrolledcourses',
          localField: '_id',
          foreignField: 'payment_id',
          as: 'enrolledCourse',
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'payment_id',
          as: 'subscription',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%b',
              date: '$createdAt',
            },
          },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          courseEarnings: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$paymentType', 'Paid'] },
                  { $eq: ['$enrolledCourse.enrollmentType', 'Paid'] },
                ] },
                '$amount',
                0,
              ],
            },
          },
          subscriptionEarnings: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$paymentType', 'Subscription'] },
                  { $eq: ['$enrolledCourse.enrollmentType', 'Subscription'] },
                  { $ne: ['$subscription', []] },
                ] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          month: '$_id',
          totalSales: 1,
          totalAmount: 1,
          courseEarnings: 1,
          subscriptionEarnings: 1,
          _id: 0,
        },
      },
    ]);

    // Pad daily stats
    const paddedDailyStats = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stat = dailyStats.find((s) => s.date === dateStr) || {
        date: dateStr,
        totalSales: 0,
        totalAmount: 0,
        courseEarnings: 0,
        subscriptionEarnings: 0,
      };
      paddedDailyStats.push(stat);
    }

    // Pad monthly stats
    const paddedMonthlyStats = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(endDate);
      date.setMonth(endDate.getMonth() - i);
      const monthStr = date.toLocaleString('en-US', { year: 'numeric', month: 'short' });
      const stat = monthlyStats.find((s) => s.month === monthStr) || {
        month: monthStr,
        totalSales: 0,
        totalAmount: 0,
        courseEarnings: 0,
        subscriptionEarnings: 0,
      };
      paddedMonthlyStats.push(stat);
    }

    return {
      daily: paddedDailyStats.sort((a, b) => b.date.localeCompare(a.date)),
      weekly: weeklyStats,
      monthly: paddedMonthlyStats.sort((a, b) => b.month.localeCompare(a.month)),
    };
}




export const RevenueService = {
    SalesVsCostStats,
}
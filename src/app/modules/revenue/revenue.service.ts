import { Course } from "../courseManagement/course/course.model";
import { Payment } from "../payment/payment.model";
import { Student } from "../student/student.model";

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



const GrossSubscriptionCourseStats = async ( 
) => {

   
    const currentDate = new Date(); 

    // Dynamic date ranges for current and previous month
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentMonthEnd = currentDate;
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

    // Aggregate for both current and previous months
    const stats = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: {
            $gte: previousMonthStart,
            $lte: currentMonthEnd,
          },
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
        $facet: {
          currentMonth: [
            {
              $match: {
                createdAt: {
                  $gte: currentMonthStart,
                  $lte: currentMonthEnd,
                },
              },
            },
            {
              $group: {
                _id: null,
                grossRevenue: { $sum: '$amount' },
                subscriptionPayments: {
                  $push: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ['$paymentType', 'Subscription'] },
                          { $eq: ['$enrolledCourse.enrollmentType', 'Subscription'] },
                          { $ne: ['$subscription', []] },
                        ],
                      },
                      '$amount',
                      null,
                    ],
                  },
                },
                courseSales: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ['$paymentType', 'Paid'] },
                          { $eq: ['$enrolledCourse.enrollmentType', 'Paid'] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                grossRevenue: 1,
                averageSubscription: {
                  $avg: {
                    $filter: {
                      input: '$subscriptionPayments',
                      as: 'amount',
                      cond: { $ne: ['$$amount', null] },
                    },
                  },
                },
                courseSales: 1,
                _id: 0,
              },
            },
          ],
          previousMonth: [
            {
              $match: {
                createdAt: {
                  $gte: previousMonthStart,
                  $lte: previousMonthEnd,
                },
              },
            },
            {
              $group: {
                _id: null,
                grossRevenue: { $sum: '$amount' },
                subscriptionPayments: {
                  $push: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ['$paymentType', 'Subscription'] },
                          { $eq: ['$enrolledCourse.enrollmentType', 'Subscription'] },
                          { $ne: ['$subscription', []] },
                        ],
                      },
                      '$amount',
                      null,
                    ],
                  },
                },
                courseSales: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ['$paymentType', 'Paid'] },
                          { $eq: ['$enrolledCourse.enrollmentType', 'Paid'] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                grossRevenue: 1,
                averageSubscription: {
                  $avg: {
                    $filter: {
                      input: '$subscriptionPayments',
                      as: 'amount',
                      cond: { $ne: ['$$amount', null] },
                    },
                  },
                },
                courseSales: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    // Extract results
    const current = stats[0].currentMonth[0] || {
      grossRevenue: 0,
      averageSubscription: 0,
      courseSales: 0,
    };
    const previous = stats[0].previousMonth[0] || {
      grossRevenue: 0,
      averageSubscription: 0,
      courseSales: 0,
    };

    // Handle null averageSubscription
    current.averageSubscription = current.averageSubscription || 0;
    previous.averageSubscription = previous.averageSubscription || 0;

    // Calculate percentage changes
    const grossRevenuePercentChange = previous.grossRevenue === 0
      ? current.grossRevenue === 0 ? 0 : 100
      : ((current.grossRevenue - previous.grossRevenue) / previous.grossRevenue) * 100;
    const averageSubscriptionPercentChange = previous.averageSubscription === 0
      ? current.averageSubscription === 0 ? 0 : 100
      : ((current.averageSubscription - previous.averageSubscription) / previous.averageSubscription) * 100;
    const courseSalesPercentChange = previous.courseSales === 0
      ? current.courseSales === 0 ? 0 : 100
      : ((current.courseSales - previous.courseSales) / previous.courseSales) * 100;

    // Format percentage changes with + or - signs
    const formatPercent = (value:any) => {
      const rounded = Number(value.toFixed(2));
      return rounded >= 0 ? `+${rounded}` : `${rounded}`;
    };

    // Return result
    return{
      grossRevenue: current.grossRevenue,
      averageSubscription: current.averageSubscription,
      courseSales: current.courseSales,
      grossRevenuePercentChange: formatPercent(grossRevenuePercentChange),
      averageSubscriptionPercentChange: formatPercent(averageSubscriptionPercentChange),
      courseSalesPercentChange: formatPercent(courseSalesPercentChange),
    }

}

const TransactionStats = async ( 
) => {
    const transactions = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true,
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
        $unwind: {
          path: '$enrolledCourse',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourse.course_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'vouchers',
          let: { payment_student_id: '$student_id', payment_course_id: '$enrolledCourse.course_id', payment_date: '$createdAt' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $eq: ['$isExpired', false] },
                    { $lte: ['$startDate', '$$payment_date'] },
                    { $gte: ['$endDate', '$$payment_date'] },
                    {
                      $or: [
                        { $eq: ['$voucherType', 'All'] },
                        { $eq: ['$student_id', '$$payment_student_id'] },
                        { $eq: ['$course_id', '$$payment_course_id'] },
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'voucher',
        },
      },
      {
        $addFields: {
          discountedAmount: {
            $cond: [
              { $gt: [{ $size: '$voucher' }, 0] },
              {
                $cond: [
                  { $eq: [{ $arrayElemAt: ['$voucher.discountType', 0] }, 'Percentage'] },
                  { $multiply: ['$amount', { $subtract: [1, { $divide: [{ $arrayElemAt: ['$voucher.discountValue', 0] }, 100] }] }] },
                  { $subtract: ['$amount', { $arrayElemAt: ['$voucher.discountValue', 0] }] },
                ],
              },
              '$amount',
            ],
          },
          voucherName: {
            $ifNull: [{ $arrayElemAt: ['$voucher.title', 0] }, 'N/A'],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $limit: 10 },
      {
        $project: {
          id: '$_id',
          transactionId: '$transactionId',
          userName: '$student.name',
          paymentDate: '$createdAt',
          courseName: { $ifNull: ['$course.name', 'N/A'] },
          voucherName: { $ifNull: ['$voucherName', 'N/A'] },
          coursePrice: '$amount',
          paidAmount: '$discountedAmount',
          _id: 0,
        },
      },
    ]);

    return transactions;
}

const ReportStats = async ( 

) => { 
   const currentDate = new Date(); // June 23, 2025, 05:28 PM +06:00

    // Date ranges
    const last12MonthsStart = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() + 1, 1); // July 1, 2024
    const last10WeeksStart = new Date(currentDate);
    last10WeeksStart.setDate(currentDate.getDate() - 70); // April 14, 2025
    const last10DaysStart = new Date(currentDate);
    last10DaysStart.setDate(currentDate.getDate() - 9); // June 14, 2025

    // Helper to format percentage changes
    const formatPercent = (current:any, previous:any) => {
      if (previous === 0) return current === 0 ? '+0.00' : '+100.00';
      const value = ((current - previous) / previous) * 100;
      const rounded = Number(value.toFixed(2));
      return rounded >= 0 ? `+${rounded}` : `${rounded}`;
    };

    // Aggregate total students
    const totalStudents = await Student.countDocuments();

    // Aggregate total courses (from Course model)
    const totalCourses = await Course.countDocuments();

    // Aggregate total revenue with voucher discounts
    const totalRevenueResult = await Payment.aggregate([
      {
        $match: { status: 'Success' },
      },
      {
        $lookup: {
          from: 'vouchers',
          let: { payment_student_id: '$student_id', payment_course_id: '$course_id', payment_date: '$createdAt' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $eq: ['$isExpired', false] },
                    { $lte: ['$startDate', '$$payment_date'] },
                    { $gte: ['$endDate', '$$payment_date'] },
                    {
                      $or: [
                        { $eq: ['$voucherType', 'All'] },
                        { $eq: ['$student_id', '$$payment_student_id'] },
                        { $eq: ['$course_id', '$$payment_course_id'] },
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'voucher',
        },
      },
      {
        $addFields: {
          discountedAmount: {
            $cond: [
              { $ne: ['$voucher', []] },
              {
                $cond: [
                  { $eq: ['$voucher.discountType', 'Percentage'] },
                  { $multiply: ['$amount', { $subtract: [1, { $divide: ['$voucher.discountValue', 100] }] }] },
                  { $subtract: ['$amount', '$voucher.discountValue'] },
                ],
              },
              '$amount',
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$discountedAmount' },
        },
      },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Aggregate new students
    const studentStats = await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: last12MonthsStart, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            daily: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            weekly: { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
            monthly: { $dateToString: { format: '%Y-%b', date: '$createdAt' } },
          },
          newStudents: { $sum: 1 },
        },
      },
      {
        $facet: {
          daily: [
            { $group: { _id: '$_id.daily', newStudents: { $sum: '$newStudents' } } },
            { $sort: { _id: -1 } },
            { $limit: 10 },
            { $project: { date: '$_id', newStudents: 1, _id: 0 } },
          ],
          weekly: [
            {
              $group: {
                _id: { year: '$_id.weekly.year', week: '$_id.weekly.week' },
                newStudents: { $sum: '$newStudents' },
              },
            },
            {
              $project: {
                week: { $concat: [{ $toString: '$_id.year' }, '-W', { $toString: '$_id.week' }] },
                newStudents: 1,
                _id: 0,
              },
            },
            { $sort: { '_id.year': -1, '_id.week': -1 } },
            { $limit: 10 },
          ],
          monthly: [
            { $group: { _id: '$_id.monthly', newStudents: { $sum: '$newStudents' } } },
            { $sort: { _id: -1 } },
            { $project: { month: '$_id', newStudents: 1, _id: 0 } },
          ],
        },
      },
    ]);

    // Aggregate new courses (from Course model)
    const courseStats = await Course.aggregate([
      {
        $match: {
          createdAt: { $gte: last12MonthsStart, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            daily: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            weekly: { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
            monthly: { $dateToString: { format: '%Y-%b', date: '$createdAt' } },
          },
          newCourses: { $sum: 1 },
        },
      },
      {
        $facet: {
          daily: [
            { $group: { _id: '$_id.daily', newCourses: { $sum: '$newCourses' } } },
            { $sort: { _id: -1 } },
            { $limit: 10 },
            { $project: { date: '$_id', newCourses: 1, _id: 0 } },
          ],
          weekly: [
            {
              $group: {
                _id: { year: '$_id.weekly.year', week: '$_id.weekly.week' },
                newCourses: { $sum: '$newCourses' },
              },
            },
            {
              $project: {
                week: { $concat: [{ $toString: '$_id.year' }, '-W', { $toString: '$_id.week' }] },
                newCourses: 1,
                _id: 0,
              },
            },
            { $sort: { '_id.year': -1, '_id.week': -1 } },
            { $limit: 10 },
          ],
          monthly: [
            { $group: { _id: '$_id.monthly', newCourses: { $sum: '$newCourses' } } },
            { $sort: { _id: -1 } },
            { $project: { month: '$_id', newCourses: 1, _id: 0 } },
          ],
        },
      },
    ]);

    // Aggregate revenue with voucher discounts
    const revenueStats = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          createdAt: { $gte: last12MonthsStart, $lte: currentDate },
        },
      },
      {
        $lookup: {
          from: 'vouchers',
          let: { payment_student_id: '$student_id', payment_course_id: '$course_id', payment_date: '$createdAt' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $eq: ['$isExpired', false] },
                    { $lte: ['$startDate', '$$payment_date'] },
                    { $gte: ['$endDate', '$$payment_date'] },
                    {
                      $or: [
                        { $eq: ['$voucherType', 'All'] },
                        { $eq: ['$student_id', '$$payment_student_id'] },
                        { $eq: ['$course_id', '$$payment_course_id'] },
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'voucher',
        },
      },
      {
        $addFields: {
          discountedAmount: {
            $cond: [
              { $ne: ['$voucher', []] },
              {
                $cond: [
                  { $eq: ['$voucher.discountType', 'Percentage'] },
                  { $multiply: ['$amount', { $subtract: [1, { $divide: ['$voucher.discountValue', 100] }] }] },
                  { $subtract: ['$amount', '$voucher.discountValue'] },
                ],
              },
              '$amount',
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            daily: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            weekly: { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
            monthly: { $dateToString: { format: '%Y-%b', date: '$createdAt' } },
          },
          revenue: { $sum: '$discountedAmount' },
        },
      },
      {
        $facet: {
          daily: [
            { $group: { _id: '$_id.daily', revenue: { $sum: '$revenue' } } },
            { $sort: { _id: -1 } },
            { $limit: 10 },
            { $project: { date: '$_id', revenue: 1, _id: 0 } },
          ],
          weekly: [
            {
              $group: {
                _id: { year: '$_id.weekly.year', week: '$_id.weekly.week' },
                revenue: { $sum: '$revenue' },
              },
            },
            {
              $project: {
                week: { $concat: [{ $toString: '$_id.year' }, '-W', { $toString: '$_id.week' }] },
                revenue: 1,
                _id: 0,
              },
            },
            { $sort: { '_id.year': -1, '_id.week': -1 } },
            { $limit: 10 },
          ],
          monthly: [
            { $group: { _id: '$_id.monthly', revenue: { $sum: '$revenue' } } },
            { $sort: { _id: -1 } },
            { $project: { month: '$_id', revenue: 1, _id: 0 } },
          ],
        },
      },
    ]);

    // Pad daily stats
    const paddedDailyStats = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const student = studentStats[0].daily.find((s:any) => s.date === dateStr) || { newStudents: 0 };
      const course = courseStats[0].daily.find((c:any) => c.date === dateStr) || { newCourses: 0 };
      const revenue = revenueStats[0].daily.find((r:any) => r.date === dateStr) || { revenue: 0 };
      const prevDate = new Date(date);
      prevDate.setDate(date.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      const prevStudent = studentStats[0].daily.find((s:any) => s.date === prevDateStr) || { newStudents: 0 };
      const prevCourse = courseStats[0].daily.find((c:any) => c.date === prevDateStr) || { newCourses: 0 };
      const prevRevenue = revenueStats[0].daily.find((r:any) => r.date === prevDateStr) || { revenue: 0 };
      paddedDailyStats.push({
        date: dateStr,
        revenue: revenue.revenue,
        newStudents: student.newStudents,
        newCourses: course.newCourses,
        revenuePercentChange: formatPercent(revenue.revenue, prevRevenue.revenue),
        newStudentsPercentChange: formatPercent(student.newStudents, prevStudent.newStudents),
        newCoursesPercentChange: formatPercent(course.newCourses, prevCourse.newCourses),
      });
    }

    // Weekly stats
    const weeklyStats = revenueStats[0].weekly.map((r:any, i:any) => {
      const student = studentStats[0].weekly[i] || { newStudents: 0 };
      const course = courseStats[0].weekly[i] || { newCourses: 0 };
      const prevRevenue = revenueStats[0].weekly[i + 1] || { revenue: 0 };
      const prevStudent = studentStats[0].weekly[i + 1] || { newStudents: 0 };
      const prevCourse = courseStats[0].weekly[i + 1] || { newCourses: 0 };
      return {
        week: r.week,
        revenue: r.revenue,
        newStudents: student.newStudents,
        newCourses: course.newCourses,
        revenuePercentChange: formatPercent(r.revenue, prevRevenue.revenue),
        newStudentsPercentChange: formatPercent(student.newStudents, prevStudent.newStudents),
        newCoursesPercentChange: formatPercent(course.newCourses, prevCourse.newCourses),
      };
    });

    // Pad monthly stats
    const paddedMonthlyStats = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toLocaleString('en-US', { year: 'numeric', month: 'short' });
      const student = studentStats[0].monthly.find((s:any) => s.month === monthStr) || { newStudents: 0 };
      const course = courseStats[0].monthly.find((c:any) => c.month === monthStr) || { newCourses: 0 };
      const revenue = revenueStats[0].monthly.find((r:any) => r.month === monthStr) || { revenue: 0 };
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const prevMonthStr = prevMonth.toLocaleString('en-US', { year: 'numeric', month: 'short' });
      const prevStudent = studentStats[0].monthly.find((s:any) => s.month === prevMonthStr) || { newStudents: 0 };
      const prevCourse = courseStats[0].monthly.find((c:any) => c.month === prevMonthStr) || { newCourses: 0 };
      const prevRevenue = revenueStats[0].monthly.find((r:any) => r.month === prevMonthStr) || { revenue: 0 };
      paddedMonthlyStats.push({
        month: monthStr,
        revenue: revenue.revenue,
        newStudents: student.newStudents,
        newCourses: course.newCourses,
        revenuePercentChange: formatPercent(revenue.revenue, prevRevenue.revenue),
        newStudentsPercentChange: formatPercent(student.newStudents, prevStudent.newStudents),
        newCoursesPercentChange: formatPercent(course.newCourses, prevCourse.newCourses),
      });
    }

    // Return result
    return {
      totalStudents,
      totalCourses,
      totalRevenue,
      daily: paddedDailyStats.sort((a, b) => b.date.localeCompare(a.date)),
      weekly: weeklyStats,
      monthly: paddedMonthlyStats.sort((a, b) => b.month.localeCompare(a.month)),
    }
}



export const RevenueService = {
    SalesVsCostStats,
    GrossSubscriptionCourseStats,
    TransactionStats,
    ReportStats,
}
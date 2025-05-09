import {
    endOfMonth,
    startOfDay,
    startOfMonth,
    subDays,
    subMonths,
    startOfWeek,
    endOfDay,
} from 'date-fns';
import { AssignmentSubmission } from '../assignmentSubmission/assignmentSubmission.model';
import { Assignment } from '../courseManagement/assignment/assignment.model';
import { TestHistory } from '../courseManagement/test-history/testHistory.model';
import { Test } from '../courseManagement/test/test.model';
import { EnrolledCourse } from '../enrolledCourse/enrolledCourse.model';
import { Payment } from '../payment/payment.model';
import { Flashcard } from '../flashcardManagement/flashcard/flashcard.model';
import { StudentProgress } from '../progress/progress.model';

const getCourseEngagement = async () => {
    const today = startOfDay(new Date());
    const endToday = endOfDay(new Date());
    const sevenDaysAgo = subDays(today, 6); // includes today

    const result = await StudentProgress.aggregate([
        {
            $match: {
                isCompleted: true,
                createdAt: { $gte: sevenDaysAgo, $lte: endToday },
            },
        },
        {
            $addFields: {
                dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1=Sun, 2=Mon, ..., 7=Sat
            },
        },
        {
            $group: {
                _id: '$dayOfWeek',
                count: { $sum: 1 },
            },
        },
    ]);

    const dayOfWeekToIndex = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 1: 6 }; // Mon-Sun
    const counts = Array(7).fill(0);

    result.forEach(
        ({
            _id,
            count,
        }: {
            _id: keyof typeof dayOfWeekToIndex;
            count: number;
        }) => {
            const index = dayOfWeekToIndex[_id];
            if (index !== undefined) counts[index] = count;
        },
    );

    return counts; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
};

const getTopSellingCourses = async () => {
    const result = await EnrolledCourse.aggregate([
        {
            $match: {
                enrollmentType: { $in: ['Subscription', 'Paid'] },
            },
        },
        {
            $group: {
                _id: '$course_id',
                totalEnrollments: { $sum: 1 },
            },
        },
        {
            $sort: { totalEnrollments: -1 },
        },
        {
            $limit: 7,
        },
        {
            $lookup: {
                from: 'courses',
                localField: '_id', // course_id
                foreignField: '_id', // Course._id
                as: 'course',
            },
        },
        {
            $unwind: '$course',
        },
        {
            $project: {
                _id: 0,
                id: '$_id',
                name: '$course.name',
                price: '$course.price',
            },
        },
    ]);

    return result;
};

const getAssignmentCompletion = async () => {
    // Get distinct course_ids from assignments
    const courseIdsWithAssignments = await Assignment.distinct('course_id');

    if (courseIdsWithAssignments.length === 0) {
        return {
            expectedSubmissions: 0,
            submittedCount: 0,
            unsubmittedCount: 0,
            submittedPercentage: '0%',
            unsubmittedPercentage: '0%',
        };
    }

    // Run the 3 queries in parallel
    const [submittedAgg, totalAssignments, totalEnrollments] =
        await Promise.all([
            AssignmentSubmission.aggregate([
                {
                    $match: {
                        course_id: { $in: courseIdsWithAssignments },
                    },
                },
                {
                    $group: {
                        _id: {
                            course_id: '$course_id',
                            assignment_id: '$assignment_id',
                            studentProfile_id: '$studentProfile_id',
                        },
                    },
                },
                { $count: 'total' },
            ]),
            Assignment.countDocuments({
                course_id: { $in: courseIdsWithAssignments },
            }),
            EnrolledCourse.countDocuments({
                course_id: { $in: courseIdsWithAssignments },
            }),
        ]);

    const submittedCount = submittedAgg[0]?.total || 0;
    const expectedSubmissions = totalAssignments * totalEnrollments;
    const unsubmittedCount = Math.max(expectedSubmissions - submittedCount, 0);

    const submittedPercentage = expectedSubmissions
        ? ((submittedCount / expectedSubmissions) * 100).toFixed(2)
        : '0.00';
    const unsubmittedPercentage = expectedSubmissions
        ? ((unsubmittedCount / expectedSubmissions) * 100).toFixed(2)
        : '0.00';

    return {
        expectedSubmissions,
        submittedCount,
        unsubmittedCount,
        submittedPercentage: `${submittedPercentage}%`,
        unsubmittedPercentage: `${unsubmittedPercentage}%`,
    };
};

const getTestCompletion = async () => {
    // Get distinct course_ids from test
    const courseIdsWithTest = await Test.distinct('course_id');

    if (courseIdsWithTest.length === 0) {
        return {
            expectedSubmissions: 0,
            submittedCount: 0,
            unsubmittedCount: 0,
            submittedPercentage: '0%',
            unsubmittedPercentage: '0%',
        };
    }

    // Run the 3 queries in parallel
    const [submittedTest, totalTests, totalEnrollments] = await Promise.all([
        TestHistory.aggregate([
            {
                $match: {
                    course_id: { $in: courseIdsWithTest },
                },
            },
            {
                $group: {
                    _id: {
                        course_id: '$course_id',
                        lesson_id: '$lesson_id',
                        test_id: '$test_id',
                        student_id: '$student_id', // Ensures only one count per student per test
                    },
                },
            },
            { $count: 'total' },
        ]),
        Test.countDocuments({
            course_id: { $in: courseIdsWithTest },
        }),
        EnrolledCourse.countDocuments({
            course_id: { $in: courseIdsWithTest },
        }),
    ]);

    const submittedCount = submittedTest[0]?.total || 0;
    const expectedSubmissions = totalTests * totalEnrollments;
    const unsubmittedCount = Math.max(expectedSubmissions - submittedCount, 0);

    const submittedPercentage = expectedSubmissions
        ? ((submittedCount / expectedSubmissions) * 100).toFixed(2)
        : '0.00';
    const unsubmittedPercentage = expectedSubmissions
        ? ((unsubmittedCount / expectedSubmissions) * 100).toFixed(2)
        : '0.00';

    return {
        expectedSubmissions,
        submittedCount,
        unsubmittedCount,
        submittedPercentage: `${submittedPercentage}%`,
        unsubmittedPercentage: `${unsubmittedPercentage}%`,
    };
};

export const getMonthlySalesStats = async () => {
    const now = new Date();

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const result = await Payment.aggregate([
        {
            $match: {
                status: 'Success',
                createdDate: {
                    $gte: lastMonthStart,
                    $lte: thisMonthEnd,
                },
            },
        },
        {
            $facet: {
                thisMonth: [
                    {
                        $match: {
                            createdDate: {
                                $gte: thisMonthStart,
                                $lte: thisMonthEnd,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$paymentType',
                            total: { $sum: '$amount' },
                        },
                    },
                ],
                lastMonth: [
                    {
                        $match: {
                            createdDate: {
                                $gte: lastMonthStart,
                                $lte: lastMonthEnd,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$paymentType',
                            total: { $sum: '$amount' },
                        },
                    },
                ],
            },
        },
    ]);

    interface PaymentData {
        _id: string;
        total: number;
    }

    const formatData = (data: PaymentData[]) => {
        let subscriptions = 0;
        let premiumCourse = 0;

        data.forEach((item) => {
            if (item._id === 'Subscription') subscriptions = item.total;
            if (item._id === 'Paid') premiumCourse = item.total;
        });

        const totalSales = subscriptions + premiumCourse;

        const percentages = totalSales
            ? [
                  Math.round((subscriptions / totalSales) * 100),
                  Math.round((premiumCourse / totalSales) * 100),
              ]
            : [0, 0];

        return {
            totalSales,
            subscriptions,
            premiumCourse,
            percentages,
        };
    };

    const thisMonth = formatData(result[0].thisMonth);
    const lastMonth = formatData(result[0].lastMonth);

    return {
        thisMonth,
        lastMonth,
    };
};

export const getLast7DaysSales = async () => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 6); // 6 days before today = 7 days range total

    const salesByDay = await Payment.aggregate([
        {
            $match: {
                status: 'Success',
                createdDate: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdDate' },
                },
                totalSales: { $sum: '$amount' },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Convert result to map: { '2025-04-26': 33, ... }
    const salesMap = new Map(
        salesByDay.map((entry) => [entry._id, entry.totalSales]),
    );

    // Fill missing days with 0
    const last7DaysArray = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, 6 - i);
        const key = date.toISOString().slice(0, 10);
        return salesMap.get(key) || 0;
    });

    const totalSales = last7DaysArray.reduce((sum, val) => sum + val, 0);

    return {
        totalSales,
        dailySales: last7DaysArray,
    };
};

const getFlashcardStats = async () => {
    const flashcardWithCategory = await Flashcard.aggregate([
        {
            $match: {
                isApproved: true,
                visibility: 'EVERYONE',
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: '$category' },
        {
            $addFields: {
                categoryType: { $toLower: '$category.type' },
                createdDate: { $toDate: '$createdAt' },
            },
        },
    ]);

    interface ChartData {
        daily: {
            academic: number[];
            admission: number[];
            job: number[];
        };
        weekly: {
            academic: number[];
            admission: number[];
            job: number[];
        };
        monthly: {
            academic: number[];
            admission: number[];
            job: number[];
        };
    }

    const chartData: ChartData = {
        daily: {
            academic: [],
            admission: [],
            job: [],
        },
        weekly: {
            academic: Array(4).fill(0),
            admission: Array(4).fill(0),
            job: Array(4).fill(0),
        },
        monthly: {
            academic: Array(12).fill(0),
            admission: Array(12).fill(0),
            job: Array(12).fill(0),
        },
    };

    const today = startOfDay(new Date());
    const uiWeekdays: Array<
        'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
    > = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDaysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Daily prep by weekday name
    const dailyMap: Record<
        'academic' | 'admission' | 'job',
        Record<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', number>
    > = {
        academic: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
        admission: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
        job: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    };

    flashcardWithCategory.forEach((fc) => {
        const { categoryType, createdDate } = fc as {
            categoryType: 'academic' | 'admission' | 'job';
            createdDate: Date;
        };

        if (!['academic', 'admission', 'job'].includes(categoryType)) return;

        // Daily (by weekday)
        const dayName = weekDaysMap[createdDate.getDay()];
        if (
            dailyMap[categoryType][
                dayName as keyof typeof dailyMap.academic
            ] !== undefined
        ) {
            dailyMap[categoryType][dayName as keyof typeof dailyMap.academic]++;
        }

        // Weekly: Last 4 weeks
        for (let i = 0; i < 4; i++) {
            const weekStart = subDays(startOfWeek(today), 21 - i * 7);
            const weekEnd = subDays(weekStart, -6);
            if (createdDate >= weekStart && createdDate <= weekEnd) {
                chartData.weekly[categoryType][i]++;
                break;
            }
        }

        // Monthly: This calendar year only
        if (createdDate.getFullYear() === today.getFullYear()) {
            const monthIndex = createdDate.getMonth(); // 0 = Jan
            chartData.monthly[categoryType][monthIndex]++;
        }
    });

    // Convert daily map to array in correct order
    chartData.daily.academic = uiWeekdays.map((d) => dailyMap.academic[d]);
    chartData.daily.admission = uiWeekdays.map((d) => dailyMap.admission[d]);
    chartData.daily.job = uiWeekdays.map((d) => dailyMap.job[d]);

    return chartData;
};
// Add to exports
export const analyticsService = {
    getCourseEngagement,
    getAssignmentCompletion,
    getTestCompletion,
    getTopSellingCourses,
    getMonthlySalesStats,
    getLast7DaysSales,
    getFlashcardStats,
};

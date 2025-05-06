import express from 'express';
import { analyticsController } from './analytics.controller';

const router = express.Router();

router
    .get('/course-engagement', analyticsController.getCourseEngagement)
    .get('/top-selling', analyticsController.getTopSellingCourses)
    .get('/assignment', analyticsController.getAssignmentCompletion)
    .get('/test', analyticsController.getTestCompletion)
    .get('/monthly-sales', analyticsController.getMonthlySalesStats)
    .get('/last-7days-sales', analyticsController.getLast7DaysSales)
    .get('/flashcard', analyticsController.getFlashcardStats);

export const analyticsRoute = router;

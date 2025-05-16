import auth from "../../middlewares/auth";
import { TeacherLogController } from "./teacherLog.controller";
import express from 'express';

const router = express.Router();

router
    
    .get('/all-teacher-logs',auth("admin", "teacher"), TeacherLogController.getAllTeacherLogs)
    

export const TeacherLogRoute = router;
import express from 'express';
import { LeaderBoardController } from './leaderboard.controller';
import auth from '../../middlewares/auth';



const router = express.Router();

router.get('/global',auth(), LeaderBoardController.getGlobalLeaderBoard)
router.get('/course/:courseId',auth(), LeaderBoardController.getCourseLeaderBoard)

export const LeaderBoardRoute = router;

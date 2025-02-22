import express from 'express';
import { LeaderBoardController } from './leaderboard.controller';



const router = express.Router();

router
    .post('/', LeaderBoardController.createLeaderBoard)
    .get('/', LeaderBoardController.getAllLeaderBoards)
    .get('/:id', LeaderBoardController.getLeaderBoardByID)
    .delete('/:id', LeaderBoardController.deleteLeaderBoardByID)
    .patch('/:id', LeaderBoardController.updateLeaderBoard);

export const categoryRoute = router;

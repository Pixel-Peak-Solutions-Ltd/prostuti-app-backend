import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';


const router = express.Router();

router
    .post('/', CategoryController.createCategory)
    .get('/',auth(), CategoryController.getAllCategories)
    .get('/:id',auth(), CategoryController.getCategoryByID)
    .delete('/:id',auth(), CategoryController.deleteCategoryByID)
    .patch('/:id', CategoryController.updateCategory);

export const categoryRoute = router;

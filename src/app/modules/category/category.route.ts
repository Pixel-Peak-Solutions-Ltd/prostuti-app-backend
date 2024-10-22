import express from 'express';
import { CategoryController } from './category.controller';


const router = express.Router();

router
    .post('/', CategoryController.createCategory)
    .get('/', CategoryController.getAllCategories)
    .get('/:id', CategoryController.getCategoryByID)
    .delete('/:id', CategoryController.deleteCategoryByID)
    .patch('/:id', CategoryController.updateCategory);

export const categoryRoute = router;

import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router
    .post(
        '/',
        auth(),
        validateRequest(CategoryValidation.createCategory),
        CategoryController.createCategory,
    )
    .get('/', auth(), CategoryController.getAllCategories)
    .get('/:id', auth(), CategoryController.getCategoryByID)
    .delete('/:id', auth(), CategoryController.deleteCategoryByID)
    .patch(
        '/:id',
        auth(),
        validateRequest(CategoryValidation.updateCategory),
        CategoryController.updateCategory,
    );

export const categoryRoute = router;

import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router
    .post(
        '/',
        auth('admin'),
        validateRequest(CategoryValidation.createCategory),
        CategoryController.createCategory,
    )
    .get('/', CategoryController.getAllCategories)
    .get('/type', CategoryController.getAllCategoriesType)
    .get('/division', CategoryController.getAllCategoriesDivision)
    .get('/university-type', CategoryController.getAllCategoriesUniversityType)
    .get('/university-name', CategoryController.getAllCategoriesUniversityName)
    .get('/unit', CategoryController.getAllCategoriesUnit)
    .get('/job-type', CategoryController.getAllCategoriesJobType)
    .get('/job-name', CategoryController.getAllCategoriesJobName)
    .get('/subject', CategoryController.getAllCategoriesSubject)
    .get('/chapter', CategoryController.getAllCategoriesChapter)
    .get("/lesson", CategoryController.getAllCategoriesLesson)
    .get('/:id', CategoryController.getCategoryByID)
    .delete('/:id', auth('admin'), CategoryController.deleteCategoryByID)
    .patch(
        '/:id',
        auth('admin'),
        validateRequest(CategoryValidation.updateCategory),
        CategoryController.updateCategory,
    );

export const categoryRoute = router;

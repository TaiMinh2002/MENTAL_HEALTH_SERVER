const express = require('express');
const router = express.Router();
const exercisesController = require('../../controllers/admin/exercisesController');
const expertsController = require('../../controllers/admin/expertsController');
const usersController = require('../../controllers/admin/usersController');
const { verifyRole } = require('../../middleware/authMiddleware');
const authController = require('../../controllers/admin/authController');
const { uploadAvatar, uploadVideo, uploadImages } = require('../../config/multer');

// Auth routes
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Exercise routes
router.get('/exercises', verifyRole([1]), exercisesController.getAllExercises);
router.get('/exercises/:id/detail', verifyRole([1]), exercisesController.getExerciseById);
router.post('/exercises/upsert/:id?', verifyRole([1]), uploadVideo.single('media_url'), exercisesController.upsertExercise);
router.delete('/exercises/:id/delete', verifyRole([1]), exercisesController.deleteExercise);

// Expert routes
router.get('/experts', verifyRole([1]), expertsController.getAllExperts);
router.get('/experts/:id/detail', verifyRole([1]), expertsController.getExpertById);
router.post('/experts/upsert/:id?', verifyRole([1]), uploadAvatar.single('avatar'), expertsController.upsertExpert);
router.delete('/experts/:id/delete', verifyRole([1]), expertsController.deleteExpert);

module.exports = router;

const express = require('express');
const router = express.Router();
const exercisesController = require('../../controllers/admin/exercisesController');
const expertsController = require('../../controllers/admin/expertsController');
const { verifyRole } = require('../../middleware/authMiddleware');
const authController = require('../../controllers/admin/authController');
const { uploadAvatar, uploadVideo, uploadImages } = require('../../config/multer');

// Auth routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Exercise routes
router.get('/exercises', exercisesController.getAllExercises);
router.get('/exercises/:id/detail', exercisesController.getExerciseById);
router.post('/exercises/create/', uploadVideo.single('media_url'), exercisesController.createExercise);
router.post('/exercises/update/:id', uploadVideo.single('media_url'), exercisesController.updateExercise);
router.delete('/exercises/:id/delete', exercisesController.deleteExercise);

// Expert routes
router.get('/experts', expertsController.getAllExperts);
router.get('/experts/:id/detail', expertsController.getExpertById);
router.post('/experts/create', uploadAvatar.single('avatar'), expertsController.createExpert);
router.post('/experts/update/:id', uploadAvatar.single('avatar'), expertsController.updateExpert);
router.delete('/experts/:id/delete', expertsController.deleteExpert);

module.exports = router;

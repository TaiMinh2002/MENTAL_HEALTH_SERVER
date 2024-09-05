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
router.get('/exercises', verifyRole(['admin']), exercisesController.getAllExercises);
router.get('/exercises/:id', verifyRole(['admin']), exercisesController.getExerciseById);
router.post('/exercises/upsert/:id?', verifyRole(['admin']), uploadVideo.single('media_url'), exercisesController.upsertExercise);
router.delete('/exercises/:id/delete', verifyRole(['admin']), exercisesController.deleteExercise);

// Expert routes
router.get('/experts', verifyRole(['admin']), expertsController.getAllExperts);
router.get('/experts/:id', verifyRole(['admin']), expertsController.getExpertById);
router.post('/experts/upsert', verifyRole(['admin']), uploadAvatar.single('avatar'), expertsController.upsertExpert);
router.delete('/experts/:id/delete', verifyRole(['admin']), expertsController.deleteExpert);

// User routes
router.get('/users', usersController.getAllUsers);
router.get('/users/:id/detail', usersController.getUserById);
router.post('/users/:id/delete',  usersController.deleteUser);

module.exports = router;

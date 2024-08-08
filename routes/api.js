const express = require('express');
const router = express.Router();

const appointmentsController = require('../controllers/appointmentsController');
const exercisesController = require('../controllers/exercisesController');
const expertsController = require('../controllers/expertsController');
const forumsController = require('../controllers/forumsController');
const moodEntriesController = require('../controllers/moodEntriesController');
const postsController = require('../controllers/postsController');
const remindersController = require('../controllers/remindersController');
const usersController = require('../controllers/usersController');
const userExercisesController = require('../controllers/userExercisesController');
const authController = require('../controllers/authController');
const { uploadAvatar, uploadVideo, uploadImages } = require('../config/multer');
const verifyToken = require('../middleware/authMiddleware');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Appointment routes
router.get('/appointments', verifyToken, appointmentsController.getAllAppointments);
router.get('/appointments/:id', verifyToken, appointmentsController.getAppointmentById);
router.post('/appointments/upsert', verifyToken, appointmentsController.upsertAppointment);
router.delete('/appointments/:id/delete', verifyToken, appointmentsController.deleteAppointment);

// Exercise routes
router.get('/exercises', exercisesController.getAllExercises);
router.get('/exercises/:id', exercisesController.getExerciseById);
router.post('/exercises/upsert/:id?', uploadVideo.single('media_url'), exercisesController.upsertExercise);
router.delete('/exercises/:id/delete', exercisesController.deleteExercise);

// Expert routes
router.get('/experts', expertsController.getAllExperts);
router.get('/experts/:id', expertsController.getExpertById);
router.post('/experts/upsert', uploadAvatar.single('avatar'), expertsController.upsertExpert);
router.delete('/experts/:id/delete', expertsController.deleteExpert);

// Forum routes
router.get('/forums', verifyToken, forumsController.getAllForums);
router.get('/forums/:id', verifyToken, forumsController.getForumById);
router.post('/forums/upsert/:id?', verifyToken, uploadAvatar.single('cover_image'), forumsController.upsertForum);
router.delete('/forums/:id/delete', verifyToken, forumsController.deleteForum);
router.post('/forums/join', verifyToken, forumsController.joinForum);
router.post('/forums/leave', verifyToken, forumsController.outForum);

// Mood entries routes
router.get('/mood-entries', verifyToken, moodEntriesController.getAllMoodEntries);
router.get('/mood-entries/:id', verifyToken, moodEntriesController.getMoodEntryById);
router.post('/mood-entries/upsert', verifyToken, moodEntriesController.upsertMoodEntry);
router.delete('/mood-entries/:id/delete', verifyToken, moodEntriesController.deleteMoodEntry);

// Post routes
router.get('/posts', verifyToken, postsController.getAllPosts);
router.get('/posts/:id', verifyToken, postsController.getPostById);
router.post('/posts/upsert/:id?', verifyToken, uploadImages.array('images'), postsController.upsertPost);
router.delete('/posts/:id/delete', verifyToken, postsController.deletePost);

// Reminder routes
router.get('/reminders', verifyToken, remindersController.getAllReminders);
router.get('/reminders/:id', verifyToken, remindersController.getReminderById);
router.post('/reminders/upsert', verifyToken, remindersController.upsertReminder);
router.delete('/reminders/:id/delete', verifyToken, remindersController.deleteReminder);

// User routes
router.get('/users', usersController.getAllUsers);
router.get('/users/:id/detail', usersController.getUserById);
router.post('/users/update', verifyToken, uploadAvatar.single('avatar'), usersController.updateUser);
router.post('/users/:id/delete', usersController.deleteUser);
router.post('/users/:id/pause', usersController.pauseUser);

// User-exercise routes
router.get('/user-exercises', verifyToken, userExercisesController.getAllUserExercises);
router.get('/user-exercises/:id', verifyToken, userExercisesController.getUserExerciseById);
router.post('/user-exercises/upsert', verifyToken, userExercisesController.upsertUserExercise);
router.delete('/user-exercises/:id/delete', verifyToken, userExercisesController.deleteUserExercise);

module.exports = router;

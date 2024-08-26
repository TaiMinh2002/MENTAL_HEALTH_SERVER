const express = require('express');
const router = express.Router();
const appointmentsController = require('../../controllers/user/appointmentsController');
const authController = require('../../controllers/user/authController');
const forumsController = require('../../controllers/user/forumsController');
const moodEntriesController = require('../../controllers/user/moodEntriesController');
const postsController = require('../../controllers/user/postsController');
const remindersController = require('../../controllers/user/remindersController');
const userExercisesController = require('../../controllers/user/userExercisesController');
const usersController = require('../../controllers/user/usersController');
const { verifyToken, verifyRole } = require('../../middleware/authMiddleware');
const { uploadAvatar, uploadVideo, uploadImages } = require('../../config/multer');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Appointment routes
router.get('/appointments', verifyToken, verifyRole(['user']), appointmentsController.getAllAppointments);
router.get('/appointments/:id', verifyToken, appointmentsController.getAppointmentById);
router.post('/appointments/upsert', verifyToken, appointmentsController.upsertAppointment);
router.delete('/appointments/:id/delete', verifyToken, appointmentsController.deleteAppointment);

// Forum routes
router.get('/forums', verifyToken, verifyRole(['user']), forumsController.getAllForums);
router.get('/forums/:id', verifyToken, verifyRole(['user']), forumsController.getForumById);
router.post('/forums/upsert/:id?', verifyToken, verifyRole(['user']), uploadAvatar.single('cover_image'), forumsController.upsertForum);
router.delete('/forums/:id/delete', verifyToken, verifyRole(['user']), forumsController.deleteForum);
router.post('/forums/join', verifyToken, verifyRole(['user']), forumsController.joinForum);
router.post('/forums/leave', verifyToken, verifyRole(['user']), forumsController.outForum);

// Mood entries routes
router.get('/mood-entries', verifyToken, verifyRole(['user']), moodEntriesController.getAllMoodEntries);
router.get('/mood-entries/:id', verifyToken, verifyRole(['user']), moodEntriesController.getMoodEntryById);
router.post('/mood-entries/upsert', verifyToken, verifyRole(['user']), moodEntriesController.upsertMoodEntry);
router.delete('/mood-entries/:id/delete', verifyToken, verifyRole(['user']), moodEntriesController.deleteMoodEntry);

// Post routes
router.get('/posts', verifyToken, verifyRole(['user']), postsController.getAllPosts);
router.get('/posts/:id', verifyToken, verifyRole(['user']), postsController.getPostById);
router.post('/posts/upsert/:id?', verifyToken, verifyRole(['user']), uploadImages.array('images'), postsController.upsertPost);
router.delete('/posts/:id/delete', verifyToken, verifyRole(['user']), postsController.deletePost);

// Reminder routes
router.get('/reminders', verifyToken, verifyRole(['user']), remindersController.getAllReminders);
router.get('/reminders/:id', verifyToken, verifyRole(['user']), remindersController.getReminderById);
router.post('/reminders/upsert', verifyToken, verifyRole(['user']), remindersController.upsertReminder);
router.delete('/reminders/:id/delete', verifyToken, verifyRole(['user']), remindersController.deleteReminder);

// User routes
router.get('/users', verifyRole(['user']), usersController.getAllUsers);
router.get('/users/:id/detail', verifyRole(['user']), usersController.getUserById);
router.post('/users/update', verifyToken, verifyRole(['user']), uploadAvatar.single('avatar'), usersController.updateUser);
router.post('/users/:id/delete', verifyRole(['user']), usersController.deleteUser);
router.post('/users/:id/pause', verifyToken, verifyRole(['user']), usersController.pauseUser);

// User-exercise routes
router.get('/user-exercises', verifyToken, verifyRole(['user']), userExercisesController.getAllUserExercises);
router.get('/user-exercises/:id', verifyToken, verifyRole(['user']), userExercisesController.getUserExerciseById);
router.post('/user-exercises/upsert', verifyToken, verifyRole(['user']), userExercisesController.upsertUserExercise);
router.delete('/user-exercises/:id/delete', verifyToken, verifyRole(['user']), userExercisesController.deleteUserExercise);

module.exports = router;

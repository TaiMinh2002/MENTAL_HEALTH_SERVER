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
const chatController = require('../../controllers/user/chatController');
const { verifyToken, verifyRole } = require('../../middleware/authMiddleware');
const { uploadAvatar, uploadVideo, uploadImages } = require('../../config/multer');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Appointment routes
router.get('/appointments', verifyToken, verifyRole([2]), appointmentsController.getAllAppointments);
router.get('/appointments/:id', verifyToken, appointmentsController.getAppointmentById);
router.post('/appointments/upsert', verifyToken, appointmentsController.upsertAppointment);
router.delete('/appointments/:id/delete', verifyToken, appointmentsController.deleteAppointment);

// Forum routes
router.get('/forums', verifyToken, verifyRole([2]), forumsController.getAllForums);
router.get('/forums/:id', verifyToken, verifyRole([2]), forumsController.getForumById);
router.post('/forums/upsert/:id?', verifyToken, verifyRole([2]), uploadAvatar.single('cover_image'), forumsController.upsertForum);
router.delete('/forums/:id/delete', verifyToken, verifyRole([2]), forumsController.deleteForum);
router.post('/forums/join/:forum_id', verifyToken, verifyRole([2]), forumsController.joinForum);
router.post('/forums/leave/:forum_id', verifyToken, verifyRole([2]), forumsController.outForum);

// Mood entries routes
router.get('/mood-entries', verifyToken, verifyRole([2]), moodEntriesController.getAllMoodEntries);
router.get('/mood-entries/:id', verifyToken, verifyRole([2]), moodEntriesController.getMoodEntryById);
router.post('/mood-entries/upsert', verifyToken, verifyRole([2]), moodEntriesController.upsertMoodEntry);
router.delete('/mood-entries/:id/delete', verifyToken, verifyRole([2]), moodEntriesController.deleteMoodEntry);

// Post routes
router.get('/posts', verifyToken, verifyRole([2]), postsController.getAllPosts);
router.get('/posts/:id', verifyToken, verifyRole([2]), postsController.getPostById);
router.post('/posts/upsert/:id?', verifyToken, verifyRole([2]), uploadImages.array('images'), postsController.upsertPost);
router.delete('/posts/:id/delete', verifyToken, verifyRole([2]), postsController.deletePost);

// Reminder routes
router.get('/reminders', verifyToken, verifyRole([2]), remindersController.getAllReminders);
router.get('/reminders/:id', verifyToken, verifyRole([2]), remindersController.getReminderById);
router.post('/reminders/upsert', verifyToken, verifyRole([2]), remindersController.upsertReminder);
router.delete('/reminders/:id/delete', verifyToken, verifyRole([2]), remindersController.deleteReminder);

// User routes
router.get('/users', verifyRole([2]), usersController.getAllUsers);
router.get('/users/:id/detail', verifyToken, verifyRole([2]), usersController.getUserById);
router.post('/users/:id/update', verifyToken, verifyRole([2]), uploadAvatar.single('avatar'), usersController.updateUser);
router.post('/users/:id/delete', verifyRole([2]), usersController.deleteUser);
router.post('/users/:id/pause', verifyToken, verifyRole([2]), usersController.pauseUser);

// User-exercise routes
router.get('/user-exercises', verifyToken, verifyRole([2]), userExercisesController.getAllUserExercises);
router.get('/user-exercises/:id', verifyToken, verifyRole([2]), userExercisesController.getUserExerciseById);
router.post('/user-exercises/upsert', verifyToken, verifyRole([2]), userExercisesController.upsertUserExercise);
router.delete('/user-exercises/:id/delete', verifyToken, verifyRole([2]), userExercisesController.deleteUserExercise);

// Chatbot routes
router.post('/chatbot', verifyToken, chatController.sendMessage);
router.get('/conversations', verifyToken, chatController.getConversations);

module.exports = router;

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
const { uploadAvatar, uploadVideo } = require('../config/multer');

// Appointment routes
router.get('/appointments/', appointmentsController.getAllAppointments);
router.get('/appointments/:id/detail', appointmentsController.getAppointmentById);
router.post('/appointments/upsert/:id?', appointmentsController.upsertAppointment);
router.delete('/appointments/delete/:id', appointmentsController.deleteAppointment);

// Exercise routes
router.get('/exercises/', exercisesController.getAllExercises);
router.get('/exercises/:id/detail', exercisesController.getExerciseById);
router.post('/exercises/upsert/:id?', uploadVideo.single('media_url'), exercisesController.upsertExercise);
router.delete('/exercises/delete/:id', exercisesController.deleteExercise);

// Expert routes
router.get('/experts/', expertsController.getAllExperts);
router.get('/experts/:id/detail', expertsController.getExpertById);
router.post('/experts/upsert/:id?', uploadAvatar.single('avatar'), expertsController.upsertExpert);
router.delete('/experts/delete/:id', expertsController.deleteExpert);

// Forum routes
router.get('/forums/', forumsController.getAllForums);
router.get('/forums/:id/detail', forumsController.getForumById);
router.post('/forums/upsert/:id?', forumsController.upsertForum);
router.delete('/forums/delete/:id', forumsController.deleteForum);

// Mood entries routes
router.get('/mood-entries/', moodEntriesController.getAllMoodEntries);
router.get('/mood-entries/:id/detail', moodEntriesController.getMoodEntryById);
router.post('/mood-entries/upsert/:id?', moodEntriesController.upsertMoodEntry);
router.delete('/mood-entries/delete/:id', moodEntriesController.deleteMoodEntry);

// Post routes
router.get('/posts/', postsController.getAllPosts);
router.get('/posts/:id/detail', postsController.getPostById);
router.post('/posts/upsert/:id?', postsController.upsertPost);
router.delete('/posts/delete/:id', postsController.deletePost);

// Reminder routes
router.get('/reminders/', remindersController.getAllReminders);
router.get('/reminders/:id/detail', remindersController.getReminderById);
router.post('/reminders/upsert/:id?', remindersController.upsertReminder);
router.delete('/reminders/delete/:id', remindersController.deleteReminder);

// User routes
router.get('/users/', usersController.getAllUsers);
router.get('/users/:id/detail', usersController.getUserById);
router.post('/users/upsert/:id?', uploadAvatar.single('avatar'), usersController.upsertUser);
router.delete('/users/delete/:id', usersController.deleteUser);

// User-exercises routes
router.get('/user-exercises/', userExercisesController.getAllUserExercises);
router.get('/user-exercises/:id/detail', userExercisesController.getUserExerciseById);
router.post('/user-exercises/upsert/:id?', userExercisesController.upsertUserExercise);
router.delete('/user-exercises/delete/:id', userExercisesController.deleteUserExercise);

module.exports = router;

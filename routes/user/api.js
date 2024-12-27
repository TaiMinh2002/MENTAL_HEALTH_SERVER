const express = require('express');
const router = express.Router();
const appointmentsController = require('../../controllers/user/appointmentsController');
const authController = require('../../controllers/user/authController');
const forumsController = require('../../controllers/user/forumsController');
const moodEntriesController = require('../../controllers/user/moodEntriesController');
const postsController = require('../../controllers/user/postsController');
const usersController = require('../../controllers/user/usersController');
const chatbotController = require('../../controllers/user/chatbotController');
const exercisesController = require('../../controllers/user/exercisesController');
const expertsController = require('../../controllers/user/expertsController');
const chatController = require('../../controllers/user/userExpertChatController');
const messageController = require('../../controllers/user/userExpertMessageController');
const { verifyToken, verifyRole } = require('../../middleware/authMiddleware');
const { uploadMulti } = require('../../config/multer');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Appointment routes
router.get('/appointments', verifyToken, verifyRole([2]), appointmentsController.getAllAppointments);
router.get('/appointments/:id/detail', verifyToken, verifyRole([2]), appointmentsController.getAppointmentById);
router.post('/appointments/upsert', verifyToken, verifyRole([2]), appointmentsController.upsertAppointment);
router.delete('/appointments/:id/delete', verifyToken, verifyRole([2]), appointmentsController.deleteAppointment);

// Exercise
router.get('/exercises', verifyToken, verifyRole([2]), exercisesController.getAllExercises);
router.get('/exercises/:id/detail', exercisesController.getExerciseById);

// Expert
router.get('/experts', verifyToken, verifyRole([2]), expertsController.getAllExperts);
router.get('/experts/:id/detail', verifyToken, verifyRole([2]), expertsController.getExpertById);

// Forum routes
router.get('/forums', verifyToken, verifyRole([2]), forumsController.getAllForums);
router.get('/forums/:id/detail', verifyToken, verifyRole([2]), forumsController.getForumById);
router.post('/forums/create', verifyToken, verifyRole([2]), uploadMulti, forumsController.createForum);
router.post('/forums/update/:id', verifyToken, verifyRole([2]), uploadMulti, forumsController.updateForum);
router.delete('/forums/:id/delete', verifyToken, verifyRole([2]), forumsController.deleteForum);
router.post('/forums/join/', verifyToken, verifyRole([2]), forumsController.joinForum);
router.post('/forums/leave/', verifyToken, verifyRole([2]), forumsController.outForum);

// Mood entries routes
router.get('/mood-entries', verifyToken, verifyRole([2]), moodEntriesController.getAllMoodEntries);
router.get('/mood-entries/:id/detail', verifyToken, verifyRole([2]), moodEntriesController.getMoodEntryById);
router.post('/mood-entries/create', verifyToken, verifyRole([2]), moodEntriesController.createMoodEntry);
router.post('/mood-entries/update', verifyToken, verifyRole([2]), moodEntriesController.updateMoodEntry);
router.delete('/mood-entries/:id/delete', verifyToken, verifyRole([2]), moodEntriesController.deleteMoodEntry);

// Post routes
router.get('/posts', verifyToken, verifyRole([2]), postsController.getAllPosts);
router.get('/posts/:id/detail', verifyToken, verifyRole([2]), postsController.getPostById);
router.post('/posts/create/', verifyToken, verifyRole([2]), uploadMulti, postsController.createPost);
router.post('/posts/update/:id?', verifyToken, verifyRole([2]), uploadMulti, postsController.updatePost);
router.delete('/posts/:id/delete', verifyToken, verifyRole([2]), postsController.deletePost);

// User routes
router.get('/users', verifyRole([2]), usersController.getAllUsers);
router.get('/users/:id/detail', verifyToken, verifyRole([2]), usersController.getUserById);
router.post('/users/update', verifyToken, verifyRole([2]), uploadMulti, usersController.updateUser);
router.post('/users/:id/delete', verifyRole([2]), usersController.deleteUser);
router.post('/users/:id/pause', verifyToken, verifyRole([2]), usersController.pauseUser);

// Chatbot
router.post('/chatbot/send-message', verifyToken, verifyRole([2]), chatbotController.sendMessageToChatbot);
router.get('/chatbot/get-conversations', verifyToken, verifyRole([2]), chatbotController.getConversationHistory);

// Chat expert
router.post("/chats-expert", verifyToken, verifyRole([2, 3]), chatController.createChat);
router.get("/chats-expert", verifyToken, verifyRole([2, 3]), chatController.getChats);

// Message
router.post("/send-messages-expert", verifyToken, verifyRole([2, 3]), messageController.sendMessage);
router.get("/list-messages", verifyToken, verifyRole([2, 3]), messageController.getMessages);

module.exports = router;

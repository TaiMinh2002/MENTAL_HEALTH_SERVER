const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const SERVER_IP = process.env.SERVER_IP || 'localhost';

// Import routes
const adminRoutes = require('./routes/admin/api');
const userRoutes = require('./routes/user/api');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log("New client connected:", socket.id);

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
    });

    socket.on('sendMessage', (data) => {
        const { conversation_id, sender_id, message } = data;

        const query = `INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)`;
        require('./config/db').query(query, [conversation_id, sender_id, message], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return;
            }

            io.to(conversation_id).emit('newMessage', { id: results.insertId, sender_id, message });
        });
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Start the server
server.listen(PORT, SERVER_IP, () => {
    console.log(`Server is running at http://${SERVER_IP}:${PORT}`);
});

module.exports = app;

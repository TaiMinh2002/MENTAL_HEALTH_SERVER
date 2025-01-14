const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
require("dotenv").config();
const knex = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 3000;
const SERVER_IP = process.env.SERVER_IP || "localhost";

const adminRoutes = require("./routes/admin/api");
const userRoutes = require("./routes/user/api");

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Socket.io logic
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Joining a conversation room
    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Sending a message
    socket.on("sendMessage", async (data) => {
        const { chat_id, sender_id, receiver_id, message } = data;

        if (!chat_id || !receiver_id || !message) {
            console.error("Invalid message data:", data);
            socket.emit("error", { message: "chat_id, sender_id, and message are required" });
            return;
        }

        try {
            const [newMessageId] = await knex("user_expert_messages").insert({
                chat_id,
                sender_id,
                receiver_id,
                message,
                created_at: new Date(),
            });

            const newMessage = {
                id: newMessageId,
                chat_id,
                sender_id,
                receiver_id,
                message,
                created_at: new Date(),
            };

            io.to(chat_id).emit("newMessage", newMessage);
        } catch (err) {
            console.error("Database error:", err);
            socket.emit("error", { message: "Failed to save message" });
        }
    });

    // Client disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Start the server
server.listen(PORT, SERVER_IP, () => {
    console.log(`Server is running at http://${SERVER_IP}:${PORT}`);
});

module.exports = app;

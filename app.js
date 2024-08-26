const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const SERVER_IP = process.env.SERVER_IP || 'localhost';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const adminRoutes = require('./routes/admin/api');
const userRoutes = require('./routes/user/api');

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/webview/help-center', (req, res) => {
    res.render('help_center');
});

app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.use('/uploads', express.static('uploads'));

app.listen(PORT, SERVER_IP, () => {
    console.log(`Server is running at http://${SERVER_IP}:${PORT}`);
});

module.exports = app;
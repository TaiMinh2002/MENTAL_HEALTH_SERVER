const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/api');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const SERVER_IP = process.env.SERVER_IP || 'localhost';

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, SERVER_IP, () => {
    console.log(`Server is running at http://${SERVER_IP}:${PORT}`);
});

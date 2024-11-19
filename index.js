require('express-async-errors');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const e = require('express');
const setErrUtils = require('./utils/ErrorHandler').setErrUtils;
const errorHandler = require('./utils/ErrorHandler').errorHandler;

const app = express();
setErrUtils(app)

const mode = process.env.NODE_ENV || 'production';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(require('./utils/logger').Logger);
app.use(express.static('public'));

app.use('/api', require('./routes'));

app.use('*', (req, res) => {
    req.error(req, res, 404, 'Page not found!');
});

app.use(errorHandler(mode));

app.listen(process.env.PORT || 5000, () => {
    console.clear();
    console.log(`Server is running on ${process.env.HOST || 'http://localhost'}:${process.env.PORT || 5000}`);
});
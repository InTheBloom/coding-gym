const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require("express-session");
const database = require("better-sqlite3");
const crypto = require("crypto");
const formData = require('express-form-data');

const enforceLogin = require('./middlewares/enforce-login');

const homeRouter = require('./routes/home');
const problemRouter = require('./routes/problem/problem');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const settingsRouter = require('./routes/settings');

const { db, initializeSchema } = require("./db.js");
const app = express();
initializeSchema();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// file upload
app.use(formData.parse({
    uploadDir: path.join(__dirname, 'tmp'),
    autoClean: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// express-sessionのcookie設定
app.use(session({
    name: "coding-practice.sid",
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000,
    }
}));

// message表示用ミドルウェア
app.use(function(req, res, next) {
    // flush message
    res.locals.errorMessage = req.session.errorMessage;
    res.locals.successMessage = req.session.successMessage;

    delete req.session.errorMessage;
    delete req.session.successMessage;
    next();
});

// 未ログインルータ
app.use('/login', loginRouter);

app.use('/', enforceLogin);
// ログイン済みルータ
app.use('/', homeRouter);
app.use('/settings', settingsRouter);
app.use('/problem', problemRouter);
app.use('/logout', logoutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const logger = require('morgan');

const mongoose = require('mongoose');

const url = 'mongodb://confusion_admin:Confusion2018@ds033699.mlab.com:33699/confusion';
const connect = mongoose.connect(url,{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const app = express();

connect.then((db) => {
  console.log('Connected correctly to server')
}, (err) => {console.log(err); });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  resave: false,
  saveUninitialized: false,
  store: new FileStore()
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req,res,next){
  
  if(!req.session.user){
    const err = new Error('You are not authenticated!');
    err.status = 403;
    next(err);
  }
  else{
    if(req.session.user === 'authenticated'){
      next();
    }else{
      const err = new Error('You are not authenticated!');
      err.status = 403;
      next(err);
    }
  }  
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

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

const express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/user');

const router = express.Router();
router.use(bodyParser.json());


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  Users.findOne({username : req.body.username})
  .then((user) =>{
    if(user != null){
      const err = new Error(`User ${req.body.username} already exists!`);
      err.status = 403;
      next(err);
    }
    else{
      return Users.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req, res, next) =>{
  
  if(!req.session.user){
    let autHeader = req.headers.authorization;
    
    if(!autHeader){
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
    }

    let auth = new Buffer(autHeader.split(' ')[1], 'base64').toString().split(':');
    let username = auth[0];
    let pass = auth[1];
    
    Users.findOne({username: username})
    .then((user) =>{
      if (user === null) {
        const err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if (user.password !== pass) {
        const err = new Error('Your password is incorrect!');
        err.status = 403;
        return next(err);
      }
      else{
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('you are authenticated!');
        next();
      }
    })
    .catch((err) => next(err));
  }
  else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;

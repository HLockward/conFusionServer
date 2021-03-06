const express = require('express');
const bodyParser = require('body-parser');
const Users = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();
router.use(bodyParser.json());


/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
router.route('/')
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Users.find({})
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/signup',cors.corsWithOptions,  (req, res, next) => {
  Users.register(new Users({username : req.body.username}),
  req.body.password, (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }else{
      if(req.body.firstname){
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname){
        user.lastname = req.body.lastname;
      }
      user.save((err, user) =>{
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        passport.authenticate('local', (err, user, info) => {
          if (err){
            return next(err);
          }
          else{
            req.logIn(user, (err) => {
              if (err) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
              }else{
                const token = authenticate.getToken({_id: req.user._id});
                const user = {
                  username : req.user.username,
                  firstname : req.user.firstname,
                  lastname : req.user.lastname,
                  token : token
                };
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, status: 'Login Successful!', user: user});
              }
            }); 
          }
        }) (req, res, next);
      }); 
    }
  });
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {
    if (err){
      return next(err);
    }

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    else{
      req.logIn(user, (err) => {
        if (err) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
        }else{
          const token = authenticate.getToken({_id: req.user._id});
          const user = {
            username : req.user.username,
            firstname : req.user.firstname,
            lastname : req.user.lastname,
            token : token
          };
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Login Successful!', user: user});
        }
      }); 
    }
  }) (req, res, next);
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);
    
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});

router.get('/logout',cors.cors, (req, res, next) => {
    res.json({success: true, status: 'Logout Successful!'});
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) =>{
  if(req.user){
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;

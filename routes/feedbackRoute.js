const express = require('express');
const bodyParser = require('body-parser');
const Feedbacks = require('../models/feedback');
const authenticate = require('../authenticate');
const cors = require('./cors');

const feedbackRouter = express.Router();
feedbackRouter.use(bodyParser.json());

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Feedbacks.find({})
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, (req, res, next) =>{
    Feedbacks.create(req.body)
    .then((feedbacks) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.cors, (req, res, next) =>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    Feedbacks.remove({})
    .then((resp) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
})

module.exports = feedbackRouter;
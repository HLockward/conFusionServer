const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');

const routerPromo = express.Router();
routerPromo.use(bodyParser.json());

routerPromo.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Promotions.find({})
    .then((promotion) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
    .then((promotion) =>{
        console.log('Dish Create ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove({})
    .then((resp) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

routerPromo.route('/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.findById(req.params.id)
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /promotions/'+ req.params.promotionId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.id,
    {$set: req.body },{new: true})
    .then((promo) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    },(err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.id)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = routerPromo;
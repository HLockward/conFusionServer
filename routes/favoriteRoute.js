const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        let newFavorite = favorite;
        if(newFavorite == null){
            newFavorite = new Favorites({
                user: req.user._id,
            });
        }
             
        for(let i = 0; i < req.body.length; i++){
            if(newFavorite.dishes.indexOf(req.body[i]._id) === -1){
                newFavorite.dishes.push(req.body[i]._id);
            }
        }
        newFavorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        },(err) => next(err));

    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id})
    .then((resp) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        let exists = true;
        if (!favorites) {
            exists = false;
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                exists = false;
            }
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json({"exists": exists, "favorites": favorites});

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorite) =>{
        if(favorite == null){
            favorite = new Favorites({user: req.user._id});
        }
        if(favorite.dishes.indexOf(req.params.dishId) === -1){
            favorite.dishes.push(req.params.dishId);
        }
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        },(err) => next(err));

    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorite) =>{
        if(favorite != null){
            if(favorite.dishes.indexOf(req.params.dishId) !== -1){
                favorite.dishes.remove(req.params.dishId);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                },(err) => next(err));
            }
            else{
                const err = new Error(`Favorite Dish ${req.params.dishId} not found`);
                err.status = 404;
                return next(err);   
            } 
        }else{
            const err = new Error(`You don't have Favorite Dish`);
            err.status = 404;
            return next(err);   
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = favoriteRouter;
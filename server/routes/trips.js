const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');
const PostController = require('../controllers/PostController');

router
  .route('/')
  .get(TripController.getAllTrips)
  .post(TripController.createTrip);

router
  .route('/:tripId')
  .get(TripController.getTripById) 
  .put(TripController.updateTrip)
  .delete(TripController.deleteTrip);

router
  .route('/:tripId/posts')
  .get(PostController.getPosts)
  .put(PostController.updatePost)
  .post(PostController.createPost)
  .delete(PostController.deletePost);

router.get('/:tripId/route', TripController.getTripRoute);

module.exports = router;
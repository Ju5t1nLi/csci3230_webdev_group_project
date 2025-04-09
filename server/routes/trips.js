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
  .get(PostController.getAllPostsForTrip)
  .post(PostController.createPost)

router
  .route('/:tripId/posts/:blogID')
  .put(PostController.updatePost)
  .get(PostController.getPostGivenTrip)
  .delete(PostController.deletePost);

router.get('/:user', TripController.getAllTripsForUser);

module.exports = router;
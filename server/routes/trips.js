const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');

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
  .get(TripController.getTripPosts)
  .post(TripController.createPost);

router.get('/:tripId/route', TripController.getTripRoute);

module.exports = router;
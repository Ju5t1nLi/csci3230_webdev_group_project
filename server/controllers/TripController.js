exports.getAllTrips = async (req, res, next) => {
    try {
      req.db.all('SELECT * FROM trips', (err, rows) => {
        if (err) throw err;
        res.json(rows);
      });
    } catch (error) {
      next(error);
    }
    
};
  
exports.createTrip = (req, res, next) => {
    const { title, description, start_date, end_date } = req.body;
    
    req.db.run(
      `INSERT INTO trips (title, description, start_date, end_date) 
       VALUES (?, ?, ?, ?)`,
      [title, description, start_date, end_date],
      function(err) {
        if (err) return next(err);
        res.status(201).json({ id: this.lastID });
      }
    );
};
  
exports.getTripPosts = (req, res, next) => {
    const { tripId } = req.params;
    
    req.db.all(
      `SELECT * FROM blog_posts 
       WHERE trip_id = ? 
       ORDER BY post_date ASC`,
      [tripId],
      (err, posts) => {
        if (err) return next(err);
        res.json(posts);
      }
    );
};
  
exports.getTripRoute = (req, res, next) => {
    const { tripId } = req.params;
  
    req.db.all(
      `SELECT latitude, longitude, post_date, location_name 
       FROM blog_posts 
       WHERE trip_id = ? 
       ORDER BY post_date ASC`,
      [tripId],
      (err, routePoints) => {
        if (err) return next(err);
        res.json({
          tripId,
          points: routePoints,
          path: routePoints.map(p => ({ lat: p.latitude, lng: p.longitude }))
        });
      }
    );
};

exports.getTripById = (req, res, next) => {
    const { tripId } = req.params;
    req.db.get(
      'SELECT * FROM trips WHERE id = ?',
      [tripId],
      (err, row) => {
        if (err) return next(err);
        if (!row) return res.status(404).json({ error: 'Trip not found' });
        res.json(row);
      }
    );
};
  
exports.updateTrip = (req, res, next) => {
    const { tripId } = req.params;
    const { title, description, start_date, end_date } = req.body;
    
    req.db.run(
      `UPDATE trips SET 
        title = ?, 
        description = ?, 
        start_date = ?, 
        end_date = ?,
        updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [title, description, start_date, end_date, tripId],
      function(err) {
        if (err) return next(err);
        res.json({ updated: this.changes });
      }
    );
};
  
exports.deleteTrip = (req, res, next) => {
    const { tripId } = req.params;
    
    req.db.run(
      'DELETE FROM trips WHERE id = ?',
      [tripId],
      function(err) {
        if (err) return next(err);
        res.json({ deleted: this.changes });
      }
    );
 };

 exports.createPost = (req, res, next) => {
    const { tripId } = req.params;
    const { content, latitude, longitude, location_name, post_date } = req.body;
  
    // Validate coordinates
    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
  
    req.db.run(
      `INSERT INTO blog_posts 
       (trip_id, content, latitude, longitude, location_name, post_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tripId, content, latitude, longitude, location_name, post_date],
      function(err) {
        if (err) return next(err);
        res.status(201).json({ id: this.lastID });
      }
    );
};
  
function validateCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
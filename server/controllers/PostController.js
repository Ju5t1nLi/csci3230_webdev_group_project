exports.getAllPostsForTrip = (req, res, next) => {
    const { tripId } = req.params;
    
    req.db.all(
        `SELECT * FROM blog_posts 
        WHERE trip_id = ? 
        ORDER BY blog_date ASC`,
        [tripId],
        (err, posts) => {
        if (err) return next(err);
        res.json(posts);
        
        }
    );
  };

  exports.getPostGivenTrip = (req, res, next) => {
    const { tripId, blogID } = req.params;
    
    req.db.all(
        `SELECT * FROM blog_posts 
        WHERE trip_id = ?,
        AND id = ?
        ORDER BY blog_date ASC`,
        [tripId, blogID],
        (err, posts) => {
        if (err) return next(err);
        res.json(posts);
        
        }
    );
  };

exports.createPost = (req, res, next) => {
    const { tripId } = req.params;
    const { content, latitude, longitude, blog_date} = req.body;
  
    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
  
    req.db.run(
      `INSERT INTO blog_posts 
       (trip_id, content, latitude, longitude, blog_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [tripId, content, latitude, longitude,blog_date],
      function(err) {
        if (err) return next(err);
        res.status(201).json({ id: this.lastID });
      }
    );
};

exports.updatePost = (req, res, next) => {
    const { blogID } = req.params;
    const { content, latitude, longitude, blog_date } = req.body;

    if (!validateCoordinates(latitude, longitude)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    req.db.run(
      `UPDATE blog_post SET 
        content = ?, 
        latitude = ?,
        longtitude = ?,
        blog_date = ?
       WHERE id = ?`,
      [content, latitude, longitude, blog_date, blogID],
      function(err) {
        if (err) return next(err);
        res.json({ updated: this.changes });
      }
    );
  };
  
exports.deletePost = (req, res, next) => {
    const { tripId,blogID } = req.params;

    req.db.run(
        'DELETE FROM blog_posts WHERE id = ?',
        [blogID],
        function(err) {
        if (err) return next(err);
        res.json({ deleted: this.changes });
        }
    );
};

function validateCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
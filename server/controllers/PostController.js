exports.getPosts = (req, res, next) => {
    const { tripId } = req.params;
    
    req.db.all(
        `SELECT * FROM blog_posts 
        WHERE trip_id = ? 
        ORDER BY created_at ASC`,
        [tripId],
        (err, posts) => {
        if (err) return next(err);
        res.json(posts);
        
        }
    );
  };

exports.createPost = (req, res, next) => {
    const { tripId } = req.params;
    const { content, latitude, longitude } = req.body;
  
    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
  
    req.db.run(
      `INSERT INTO blog_posts 
       (trip_id, content, latitude, longitude) 
       VALUES (?, ?, ?, ?)`,
      [tripId, content, latitude, longitude],
      function(err) {
        if (err) return next(err);
        res.status(201).json({ id: this.lastID });
      }
    );
};

exports.updatePost = (req, res, next) => {
    const { blogID } = req.params;
    const { content, latitude, longitude } = req.body;

    if (!validateCoordinates(latitude, longitude)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    req.db.run(
      `UPDATE blog_post SET 
        content = ?, 
        latitude = ?,
        longtitude = ?
       WHERE id = ?`,
      [content, latitude, longitude, blogID],
      function(err) {
        if (err) return next(err);
        res.json({ updated: this.changes });
      }
    );
  };
  
exports.deletePost = (req, res, next) => {
    const { blogID } = req.params;

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

exports.getAllTrips = (req, res, next) => {
  try {
    req.db.all('SELECT * FROM trips', (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllTripsForUser = (req, res, next) => {
  const { user } = req.body;
  try {
    req.db.all('SELECT * FROM trips WHERE user = ?',[user], (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  } catch (error) {
    next(error);
  }
};

exports.createTrip = (req, res, next) => {
  const { title, user } = req.body;
  
  req.db.run(
    `INSERT INTO trips (title, user) 
     VALUES (?, ?)`,
    [title, user],
    function(err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID });
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
  const { title } = req.body; 
  
  req.db.run(
    `UPDATE trips SET 
      title = ?, 
     WHERE id = ?`,
    [title, tripId],
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

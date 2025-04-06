const express = require('express');
const router = express.Router();

// Main API routes
router.use('/trips', require('./trips')); // for CRUD to trip db
// router.use('/media', require('./media')); // If implementing media

// Database schema endpoint
router.get('/', (req, res) => {
    console.log("test");
    req.db.all(
    "SELECT name, sql FROM sqlite_schema WHERE type='table'",
    (err, schema) => {
        if (err) return res.status(500).json(err);
        res.json({ schema });
    }
    );
});

module.exports = router;
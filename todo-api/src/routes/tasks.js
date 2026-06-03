const express = require('express');
const router = express.Router();

// Ces routes seront implémentées dans l'étape suivante (CRUD)
router.get('/', (req, res) => {
  res.json({ message: 'Tasks route is working' });
});

module.exports = router;

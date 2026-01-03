const express = require('express');
const router = express.Router();

router.get('/missions', async (req, res) => {
  res.json([]);
});

router.get('/missions/:id', async (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = router;


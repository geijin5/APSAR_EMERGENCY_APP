const express = require('express');
const router = express.Router();

router.get('/alerts', async (req, res) => {
  res.json([]);
});

router.get('/events', async (req, res) => {
  res.json([]);
});

router.post('/reports', async (req, res) => {
  res.status(201).json({ id: 'new_id', ...req.body });
});

module.exports = router;


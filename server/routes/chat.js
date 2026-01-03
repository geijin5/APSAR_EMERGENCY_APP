const express = require('express');
const router = express.Router();

router.get('/rooms', async (req, res) => {
  res.json([]);
});

router.get('/rooms/:roomId/messages', async (req, res) => {
  res.json([]);
});

router.post('/rooms', async (req, res) => {
  res.status(201).json({ id: 'new_id', ...req.body });
});

router.post('/messages', async (req, res) => {
  res.status(201).json({ id: 'new_id', ...req.body });
});

module.exports = router;


const express = require('express');
const router = express.Router();

router.get('/templates', async (req, res) => {
  res.json([]);
});

router.get('/templates/:id', async (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

router.get('/', async (req, res) => {
  res.json([]);
});

router.get('/:id', async (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

router.post('/', async (req, res) => {
  res.status(201).json({ id: 'new_id', ...req.body });
});

module.exports = router;


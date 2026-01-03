const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json([]);
});

router.get('/:id', async (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

router.post('/', async (req, res) => {
  res.status(201).json({ id: 'new_id', ...req.body });
});

router.put('/:id', async (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

router.post('/:id/submit', async (req, res) => {
  res.json({ id: req.params.id, status: 'submitted' });
});

router.post('/:id/review', async (req, res) => {
  res.json({ id: req.params.id, status: req.body.action });
});

module.exports = router;


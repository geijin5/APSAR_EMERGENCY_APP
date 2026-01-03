const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json([]);
});

router.post('/', async (req, res) => {
  res.status(201).json({ id: 'new_id', ...req.body });
});

router.put('/:id', async (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/:id', async (req, res) => {
  res.status(204).send();
});

module.exports = router;


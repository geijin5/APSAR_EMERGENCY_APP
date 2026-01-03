const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json([]);
});

router.post('/:id/read', async (req, res) => {
  res.status(204).send();
});

router.post('/read-all', async (req, res) => {
  res.status(204).send();
});

router.delete('/:id', async (req, res) => {
  res.status(204).send();
});

module.exports = router;


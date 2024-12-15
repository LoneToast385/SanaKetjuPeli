// Lyhimmän reitin löytäminen kahden sanan välillä
const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.sendStatus(404);
})

router.get('/:aloitussana/:lopetussana', (req, res) => {
    
})

module.exports = router;
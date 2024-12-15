// Lyhimmän reitin löytäminen kahden sanan välillä
const express = require("express");
const router = express.Router();

router.get('/:aloitussana/:lopetussana', (req, res) => {
    syöte = req.params;
    console.log(syöte.aloitussana, syöte.lopetussana)

    // Tarkistetaan, että syöte vastaa toivottua
    if (String(syöte.aloitussana).length !== String(syöte.lopetussana).length) {
        res.status(404).send({reitti: null, msg: 'sanat eivät voi olla eri pituisia'})
    }
    if (String(syöte.aloitussana) == String(syöte.lopetussana)) {
        res.status(404).send({reitti: null, msg: 'sama sana'})
    }
    
    // Tähän se reitinlöytöalgoritmi
    res.send('success')

})


module.exports = router;
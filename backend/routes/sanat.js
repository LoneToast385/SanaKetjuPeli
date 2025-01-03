const express = require("express");
const router = express.Router();
const fs = require('fs')

function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getConfig(file){

    var filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}

router.get('/', (req, res) => {
    sanat = getConfig("sanat.json")
    res.json(sanat)
})

module.exports = router;
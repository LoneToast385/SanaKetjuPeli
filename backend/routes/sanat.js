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

function LäheisetSanat(aloitussana, D, min, max) {

    const filtteroidut_sanat = {}

    if (!(aloitussana in D)) return filtteroidut_sanat;
 
    let level = 0, wordlength = aloitussana.length;
 
    let Q = [];
    Q.push(aloitussana);
 
    while (Q.length != 0) {
 
        ++level;
        if (min <= level && level <= max) {
            filtteroidut_sanat[level] = [];
        }
        
        let sizeofQ = Q.length;
 
        for (let i = 0; i < sizeofQ; ++i) {
 
            let word = Q[0].split("");
            Q.shift();
 
            for (let pos = 0; pos < wordlength; ++pos) {
 
                let orig_char = word[pos];
 
                for (let c = 'a'.charCodeAt(0); c <= 'ö'.charCodeAt(0); ++c)
                {
                    word[pos] = String.fromCharCode(c);
 
                    if (!(word.join("") in D))
                        continue;

                    delete D[word.join("")];
                    
                    if (min <= level && level <= max) {
                        filtteroidut_sanat[level].push(word.join(""));
                    }

                    Q.push(word.join(""));
                }

                word[pos] = orig_char;
            }
        }
    }

    return filtteroidut_sanat;
}

router.get('/', (req, res) => {
    sanat = getConfig("sanat.json")
    console.log(req.query)
    const {
        query: { filtteri, aloitussana, väli},
    } = req;
    
    if (filtteri && aloitussana) {
        filtter_sanat = {}
        
        if (filtteri == "läheisetsanat") {
            if (aloitussana.length != 5) return res.status(404).json({msg: "sanan pituus ei vastaa toivottua (5)"})
            
            min = 0;
            max = Infinity;

            if (väli) {
                console.log(väli)
                if (väli.includes("-")) {

                    osat = väli.split("-")

                    if (osat.length > 2) {
                        res.status(404).json({msg: "välissä on ongelmia"})
                    }

                    if (osat[0]) min = parseInt(osat[0]);
                    if (osat[1]) max = parseInt(osat[1]);
                    
                } else {
                    min = parseInt(väli)
                    max = min
                }
            }

            console.log(min, max);

            D = {}
            for (let i = 0; i < sanat.length; ++i) {
                 D[sanat[i]] = 1;
            }

            filtter_sanat = LäheisetSanat(aloitussana, D, min, max);
        }
        return res.json(filtter_sanat)
    }

    if (filtteri && !aloitussana) {
        return res.status(404).json({msg: "aloitussanaa ei määritelty"})
    }

    if (!filtteri && aloitussana) {
        return res.status(404).json({msg: "filtteriä ei määritelty"})
    }


    return res.json(sanat)
})

module.exports = router;
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

function ListaReitistä(reitit, lopetussana) {
    reitti = []
    
    nykyinen = lopetussana
    reitti.push(nykyinen)

    while (reitit[nykyinen]) { 
        nykyinen = reitit[nykyinen]
        reitti.push(nykyinen)
        
    }
    reitti.reverse()
    console.log(reitti)
    return reitti
}

function LäheisetSanat(aloitussana, lopetussana, D, min, max) {

    console.log(aloitussana, lopetussana, min, max)

    let filtteroidut_sanat = {}
    const reitit = {}

    if (!(aloitussana in D)) return {msg: "aloitussana ei löydy sanalistassa. HUOM! kaikki sanat ovat viiden kirjaimen pituisia."};

    if (lopetussana) {
        if (!(lopetussana in D)) return {msg: "lopetussana määriteltiin, mutta se ei löytynyt sanalistasta"};
        reitit[aloitussana] = NaN;
    }

    if (aloitussana == lopetussana) return {msg: "aloitussana = lopetussana"};
 
    let level = 0, wordlength = aloitussana.length;
 
    let Q = [];
    Q.push(aloitussana);

    delete D[aloitussana]
 
    while (Q.length != 0) {
 
        ++level;

        if (!lopetussana) {
            if (min <= level && level <= max) {
                filtteroidut_sanat[level] = [];
            }
        }
        
        let sizeofQ = Q.length;
 
        for (let i = 0; i < sizeofQ; ++i) {
            
            let word = Q[0].split("");
            Q.shift();
            let parent = [...word];
 
            for (let pos = 0; pos < wordlength; ++pos) {
                
                
                let orig_char = word[pos];
 
                for (let c = 'a'.charCodeAt(0); c <= 'ö'.charCodeAt(0); ++c)
                {
                    word[pos] = String.fromCharCode(c);
 
                    if (!(word.join("") in D))
                        continue;

                    delete D[word.join("")];
                    
                    if (!lopetussana) {
                        if (min <= level && level <= max) {
                            filtteroidut_sanat[level].push(word.join(""));
                        if (level > max) return filtteroidut_sanat;

                    }} else {
                        reitit[word.join("")] = parent.join("");
                        
                        if (word.join("") == lopetussana) {
                            filtteroidut_sanat = ListaReitistä(reitit, lopetussana);
                            return [filtteroidut_sanat, level]
                        }
                        
                    }
                    Q.push(word.join(""));
                }

                word[pos] = orig_char;
            parent = [...word]
            }
        }
    }
    if (!filtteroidut_sanat || filtteroidut_sanat.length == 0) return {msg: "mitään ei löytynyt"};
    return filtteroidut_sanat;
}
router.get('/:aloitussana/:lopetussana', (req, res) => {
    aloitussana = req.params.aloitussana
    lopetussana = req.params.lopetussana

    if (aloitussana && lopetussana) {
        sanat = getConfig("../../public/js/aloitussanat.json")
        
        D = {}
            for (let i = 0; i < sanat.length; ++i) {
                 D[sanat[i]] = 1;
        }
        reitti = LäheisetSanat(aloitussana, lopetussana, D, 0, Infinity)
        console.log(reitti)
        return res.json(reitti)
    }
})

router.get('/', (req, res) => {
    sanat = getConfig("../../public/js/aloitussanat.json")
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

            filtter_sanat = LäheisetSanat(aloitussana, NaN, D, min, max);
        }
        return res.json(filtter_sanat)
    }

    if (filtteri && !aloitussana) {
        if (filtteri == "aloitussana") return res.json(sanat)
        return res.status(404).json({msg: "filtteri löytyy, mutta se joko tarvitsee jotain muuta lisäksi tai sitten se on virheellinen"})
    }

    if (!filtteri && aloitussana) {
        return res.status(404).json({msg: "filtteriä ei määritelty"})
    }

    sanat = getConfig("../../public/js/sanat.json")
    return res.json(sanat)
})


module.exports = router;

let WORDS = new Set();
let maksimi_etäisyydet = {};

let TASO = 4;

let aloitussana;
let lopetussana;

let ratkaistu;

let HARDMODE = false;

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function taso_vaihtoehdot() {
    let vaihtoehdot = [];
    let suurin = 0;
    
    Object.keys(maksimi_etäisyydet).map((key, index) => {
        if (key > suurin) {
            suurin = Number(key);
        };
    });

    for (let j = 2; j <= suurin; j++) {
      vaihtoehdot.push(j);
    }
    let vaihtoehtoalusta = document.getElementById("taso-vaihtoehdot");
    let rivi = document.createElement("div");
    rivi.className = "vaihtoehto-rivi";
  
    let rivin_pituus = 0;
  
    for (let i = 0; i < vaihtoehdot.length; i++) {
      let taso_vaihtoehto = document.createElement("div");
      taso_vaihtoehto.className = "taso-vaihtoehto";
      taso_vaihtoehto.classList.add("letter-box");
      taso_vaihtoehto.textContent = vaihtoehdot[i];
      rivi.appendChild(taso_vaihtoehto);
      rivin_pituus++;
      if (rivin_pituus == 5) {
        vaihtoehtoalusta.appendChild(rivi);
        rivi = document.createElement("div");
        rivi.className = "vaihtoehto-rivi";
        rivin_pituus = 0;
      }
    }
  rivi.className = "vaihtoehto-rivi";
  vaihtoehtoalusta.appendChild(rivi)
}
  
async function sanat() {
  try {
    const response = await fetch("/api/sanat");
    const data = await response.json();
    if (Array.isArray(data)) data.forEach(word => WORDS.add(word));
    
    let vastaus = await fetch("/api/sanat?filtteri=aloitussana");
    maksimi_etäisyydet = await vastaus.json();
  } catch (error) {
        console.error("Error loading words:", error);
  }
};

async function loadWords() {
    try {
        let käytettävät_sanat = [];
          Object.keys(maksimi_etäisyydet).map((key, index) => {
            if (key >= TASO) {
              for (let i = 0; i < maksimi_etäisyydet[key].length; i++) {
                käytettävät_sanat.push(maksimi_etäisyydet[key][i]);
              }
            };
          })

          let successfulReturn = false;
          let sana_index;
          
          while (!successfulReturn && käytettävät_sanat.length > 0) {
              sana_index = randomIntFromInterval(0, käytettävät_sanat.length - 1)
              aloitussana = käytettävät_sanat[sana_index];
              käytettävät_sanat.splice(sana_index, 1);

              const url = `/api/sanat?filtteri=läheisetsanat&&aloitussana=${aloitussana}&&väli=${TASO}`;
              let tempValue = await fetchWordFromApi(url)
            
              if(tempValue == 1 && typeof lopetussana !== "undefined") {
                successfulReturn = true;
              } else {
                continue
              }
          }
    } catch (error) {
      console.error("Unexpected data structure:", data);
    };
};

async function fetchWordFromApi(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        let mahdolliset_lopetussanat = [];

        if (!HARDMODE) {
          for (let i = 0; i < data[Number(TASO)]; i++) {
            let sana = data[Number(TASO)][i]
            let differences = 0;
            for (let j = 0; j < 5; j++) {
              if (aloitussana[j] != sana[j]) differences++;
            }
            if (differences == TASO) mahdolliset_lopetussanat.push(sana)
          }
        } else {
          mahdolliset_lopetussanat = data[Number(TASO)];
        }
        
        if (mahdolliset_lopetussanat[Math.floor(Math.random() * data[TASO].length)] != "") {
            let lopetussana = mahdolliset_lopetussanat[Math.floor(Math.random() * data[TASO].length)]; // Randomly pick from the response
            return 1
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error fetching lopetussana:", error);
    }
}


let moneskoRivi = 0;
let moneskoRuutu = 0;

const apiUrl = `/api/sanat?filtteri=läheisetsanat&&aloitussana=${aloitussana}&&väli=${TASO}`;

function clearBoxes() {
  let starting_row = document.getElementsByClassName("starting-row")[0];
  for (let s = 0; s < 5; s++) {
      let boksi = starting_row.children[s];
      boksi.textContent = aloitussana[s];
  }
  
  let destination_row = document.getElementsByClassName("destination-row")[0];
  for (let l = 0; l < 5; l++) {
      let boksi = destination_row.children[l];
      boksi.textContent = lopetussana[l];
  }
  
  for (let i = 0; i < TASO - 1; i++) {
    let row = document.getElementsByClassName("letter-row")[i];
    for (let j = 0; j < 5; j++) {
      let boksi = row.children[j];
      boksi.textContent = "";
      boksi.classList.remove("filled-box");
      boksi.classList.remove("incorrect-box");
      boksi.classList.remove("correct-box");
      boksi.classList.remove("selected-box");
    }
  }
  moneskoRuutu = 0;
  moneskoRivi = 0;
  highlightCurrentBox();
}

function initBoard() {
  let board = document.getElementById("game-board");
  for (let i = 0; i <= TASO; i++) {
    let row = document.createElement("div");
    row.className = i === 0 ? "starting-row" : i === TASO ? "destination-row" : "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = i === 0 || i === TASO ? "intebox" : "letter-box";
      box.textContent = i === 0 ? aloitussana[j] : i === TASO ? lopetussana[j] : "";
      row.appendChild(box);

      if (row.className != "starting-row" && row.className != "destination-row") {
        box.addEventListener('click', () => {
          moneskoRivi = i - 1; 
          moneskoRuutu = j; 
          highlightCurrentBox(); 
        });
      }
    }
    board.appendChild(row);
  }
}


function highlightCurrentBox() {
  const allLetterRows = document.querySelectorAll(".letter-row");
  for (let i = 0; i < allLetterRows.length; i++) {
      let row = allLetterRows[i];
      const allBoxes = row.children;
      for (let j = 0; j < allBoxes.length; j++) {
         allBoxes[j].classList.remove("selected-box")
      }
  }
  const currentRow = document.getElementsByClassName("letter-row")[moneskoRivi];
  const currentBox = currentRow.children[moneskoRuutu];
  currentBox.classList.add("selected-box");
}


function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[moneskoRivi];
    let box = row.children[moneskoRuutu];

    if (box.textContent != "" || moneskoRuutu == 0) {
        row = document.getElementsByClassName("letter-row")[moneskoRivi];
        box = row.children[moneskoRuutu];
        box.textContent = "";
        box.classList.remove("filled-box");

    } else if (box.textContent == "") {
        row = document.getElementsByClassName("letter-row")[moneskoRivi];
        box = row.children[moneskoRuutu - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        moneskoRuutu -= 1;

    } else if (moneskoRuutu > 0) {
        row = document.getElementsByClassName("letter-row")[moneskoRivi];
        box = row.children[moneskoRuutu - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        moneskoRuutu -= 1;
    }
  box.classList.remove("correct-box")
  box.classList.remove("incorrect-box")
}

function insertLetter(pressedKey) {
  if (moneskoRuutu < 5) {
    let row = document.getElementsByClassName("letter-row")[moneskoRivi];
    let box = row.children[moneskoRuutu];
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    box.classList.remove("correct-box")
    box.classList.remove("incorrect-box")
    if (moneskoRuutu != 4) {
      moneskoRuutu += 1;
    }
  }
  let rows = document.getElementsByClassName("letter-row");
  let guesses = [];
  for (let i = 0; i < TASO - 1; i++) {
    let row = rows[i];
    let word = Array.from(row.children).map(box => box.textContent.trim()).join("");
    if(word.length == 5) 
      guesses.push(word);
  }
  if(guesses.length == TASO - 1)
    checkWords();
}

function areGuessesLegal() {
  let rows = document.getElementsByClassName("letter-row");
  let guesses = [];
  let virheet = [];

  guesses.push(aloitussana);

  let virhe_löydetty = false;
  let ensimmäinen_virherivi = 0;
  
  for (let i = 0; i < TASO - 1; i++) {
    let row = rows[i];
    let word = Array.from(row.children).map(box => box.textContent.trim()).join("");
    guesses.push(word);
    
    if (word.length != 5 || !WORDS.has(word) || virhe_löydetty) {
      virheet.push([1, 1, 1, 1, 1]);
      if (!virhe_löydetty) ensimmäinen_virherivi = i;
      virhe_löydetty = true;
      continue
    }
    virheet.push([0,0,0,0,0]);
  }

  guesses.push(lopetussana);

  for (let i = 0; i < guesses.length - 1; i++) {
    let differences = 0;
    if (virhe_löydetty && i > ensimmäinen_virherivi && virheet[i]) {
        virheet[i] = [1,1,1,1,1]
        continue
    }
    for (let j = 0; j < guesses[i].length; j++) {
      if (guesses[i][j] !== guesses[i + 1][j]) {
        differences++;
        if (differences > 1) {
          if (i == virheet.length) {
            virheet[i-1][j] = 1;
            virhe_löydetty = true;
          } else {
            virheet[i][j] = 1;
            virhe_löydetty = true;
          }
          if (i < ensimmäinen_virherivi) ensimmäinen_virherivi = i;
        }
      }
    }
  }
  
  console.log(virheet);
  let row;
  
  for (let i = 0; i < virheet.length; i++) {
    row = document.getElementsByClassName("letter-row")[i];
    let box;
      for (let j = 0; j < virheet[i].length; j++) {
        box = row.children[j];
        if (virheet[i][j] == 1) {
            box.classList.remove("correct-box");
            box.classList.add("incorrect-box");
        } else {
            box.classList.remove("incorrect-box");
            box.classList.add("correct-box");
        }
        box.classList.remove("selected-box");
      }
  }
  
  if (virhe_löydetty) return false;
  return true;
}


document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);

  if (pressedKey === "Enter" && moneskoRivi < TASO) {
    moneskoRuutu = 0;
    if(moneskoRivi != TASO - 2) {
        moneskoRivi++;
    }
    highlightCurrentBox(); // Update highlight
    return;
  }

  // Restrict vertical movement
  if (pressedKey === "ArrowDown") {
    if (moneskoRivi + 2 < TASO) { // Prevent moving below the last row
      moneskoRivi++;
      highlightCurrentBox();
         
    }
    return;
  }
  if (pressedKey === "ArrowUp") {
    if (moneskoRivi > 0) { // Prevent moving above the first row
      moneskoRivi--;
      highlightCurrentBox();
    }
    return;
  }

  // Restrict horizontal movement
  if (pressedKey === "ArrowRight") {
    if (moneskoRuutu + 1 < 5) { // Prevent moving beyond the last column
      if (moneskoRuutu <  4)
          moneskoRuutu += 1;     
      highlightCurrentBox();
    }
    return;
  }
  if (pressedKey === "ArrowLeft") {
    if (moneskoRuutu > 0) { // Prevent moving before the first column
      moneskoRuutu--;
      highlightCurrentBox();
    }
    return;
  }

  // Handle backspace for deleting letters
  if (pressedKey === "Backspace" && moneskoRuutu >= 0) {
    deleteLetter();
    highlightCurrentBox();
    return;
  }

  // Only allow valid letters to be entered
  let found = pressedKey.match(/[a-ä]/gi);
  if (found && found.length === 1) {
    insertLetter(pressedKey.toLowerCase());
    highlightCurrentBox();
  }
});



document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;
  if (!target.classList.contains("keyboard-button")) return;
  const key = target.textContent === "Del" ? "Backspace" : target.textContent;
  document.dispatchEvent(new KeyboardEvent("keyup", { key }));
});

var ilmoitusTausta = document.getElementById("ilmoitus");

var span = document.getElementsByClassName("close")[0];

function checkWords() {
  if (areGuessesLegal()) {
    ratkaistu = true
    ilmoitusTausta.style.display = "block";
  }
}

span.onclick = function() {
  ilmoitusTausta.style.display = "none";
}


document.getElementById("tarkista-btn").addEventListener("click", checkWords);

document.getElementById("puhdista-btn").addEventListener("click", clearBoxes);

document.getElementById("uusi-btn").addEventListener("click", async () => {
  let asetukset = document.getElementsByClassName("hidden-settings")[0]
  asetukset.classList.add("hide");
  await loadWords();
  clearBoxes();
});

async function init() {
    ratkaistu = false;
    let asetukset = document.getElementsByClassName("hidden-settings")[0]
    asetukset.classList.add("hide");
    await sanat();
    await loadWords();
    initBoard();
    highlightCurrentBox();
    await taso_vaihtoehdot();
}

init();

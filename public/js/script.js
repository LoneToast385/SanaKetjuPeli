let WORDS = new Set(); // Initialize as a Set
let TASO;
let aloitussana;
let lopetussana;
let ratkaistu;

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function loadWords() {
    try {
        const response = await fetch("/api/sanat");
        const data = await response.json();
        let successfulReturn = false;
        if (Array.isArray(data)) {
            data.forEach(word => WORDS.add(word));
            console.log("Words loaded:", WORDS);

            // Randomly select TASO and aloitussana after words are loaded
            TASO = 5;
            let vastaus = await fetch("/api/sanat?filtteri=aloitussana");
            const aloitussanat = await vastaus.json();

            let käytettävät_sanat = [];
            Object.keys(aloitussanat).map((key, index) => {
              if (key >= TASO) {
                for (let i = 0; i < aloitussanat[key].length; i++) {
                  käytettävät_sanat.push(aloitussanat[key][i]);
                }
              };
            })

            let successfulReturn = false;
            let sana_index;
          
            while (!successfulReturn && käytettävät_sanat.length > 0) {
                sana_index = randomIntFromInterval(0, käytettävät_sanat.length - 1)
                aloitussana = käytettävät_sanat[sana_index];
                käytettävät_sanat.splice(sana_index, 1);
            
                console.log("Randomly selected aloitussana:", aloitussana);

                const url = `/api/sanat?filtteri=läheisetsanat&&aloitussana=${aloitussana}&&väli=${TASO}`;
                let tempValue = await fetchWordFromApi(url)
                console.log("Randomly selected lopetussana:", lopetussana, tempValue)
                if(tempValue == 1 && typeof lopetussana !== "undefined") {
                  successfulReturn = true;
                } else {
                  continue
                }
            }
        } else {
            console.error("Unexpected data structure:", data);
        }
    } catch (error) {
        console.error("Error loading words:", error);
    }
}

async function fetchWordFromApi(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data[Number(TASO)][Math.floor(Math.random() * data[TASO].length)] != "") {
            lopetussana = data[Number(TASO)][Math.floor(Math.random() * data[TASO].length)]; // Randomly pick from the response
            return 1
        }
        else {
            for(let n; n <= 3; n++) {
                if (data[Number(TASO - n)][Math.floor(Math.random() * data[TASO - n].length)] != "") {
                    lopetussana = data[Number(TASO - n)][Math.floor(Math.random() * data[TASO - n].length)];
                    return 1;
                }
            }
            for(let n; n <= 3; n++) {
                if (data[Number(TASO + n)][Math.floor(Math.random() * data[TASO + n].length)] != "") {
                    lopetussana = data[Number(TASO + n)][Math.floor(Math.random() * data[TASO + n].length)];
                    return 1;
                } 
            }
            return 0;
        }
} catch (error) {
        console.error("Error fetching lopetussana:", error);
    }
}


let moneskoRivi = 0;
let moneskoRuutu = 0;

const apiUrl = `/api/sanat?filtteri=läheisetsanat&&aloitussana=${aloitussana}&&väli=${TASO}`;

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

      box.addEventListener('click', () => {
        moneskoRivi = i - 1; 
        moneskoRuutu = j; 
        highlightCurrentBox(); 
      });
    }
    board.appendChild(row);
  }
}


function highlightCurrentBox() {
  const allBoxes = document.querySelectorAll(".letter-box");
  allBoxes.forEach((box) => box.classList.remove("selected-box"));

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
    let rowdelay = 200 * i * j
    setTimeout(() => {
      for (let j = 0; j < virheet[i].length; j++) {
        let boxdelay = 200 * j
        setTimeout(()=> {
              box = row.children[j];
              if (virheet[i][j] == 1) {
                  box.classList.add("incorrect-box");
              } else {
                  box.classList.add("correct-box");
              }
        }, boxdelay)
      }, rowdelay)
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

function checkWords() {
  if (areGuessesLegal()) {
    ratkaistu = true 
    alert("Onnittelut! Kaikki sanasi toimivat ja olet suorittanut pelisessiosi! Voit uudestaanladata sivun ja pelata uudestaan!");
  } else {
    alert("Yksi tai useampi sanoistasi joko eivät ole meidän sanalistassa tai muuttavat enempää kuin vain yhtä kirjainta. Tarkista vastauksesi...");
  }
}

  document.getElementById("tarkista-btn").addEventListener("click", checkWords);

async function init() {
    ratkaistu = false;
    await loadWords();
    initBoard();
    highlightCurrentBox();
}
init();
console.log(apiUrl);

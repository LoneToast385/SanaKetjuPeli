let WORDS = new Set(); // Initialize as a Set
let TASO;
let aloitussana;
let lopetussana;

async function loadWords() {
    try {
        const response = await fetch("/api/sanat?filtteri=aloitussana");
        const data = await response.json();
        let successfulReturn = false;
        if (Array.isArray(data)) {
            data.forEach(word => WORDS.add(word));
            console.log("Words loaded:", WORDS);

            // Randomly select TASO and aloitussana after words are loaded
            TASO = 5 //Math.floor(Math.random() * 3) + 3;
            aloitussana = Array.from(WORDS)[Math.floor(Math.random() * WORDS.size)];
            console.log("Randomly selected TASO:", TASO);
            console.log("Randomly selected aloitussana:", aloitussana);

            const url = `/api/sanat?filtteri=läheisetsanat&&aloitussana=${aloitussana}&&väli=2-6`;
            while(!successfulReturn) {
                let tempValue = await fetchWordFromApi(url)
                if(tempValue == 1 && typeof lopetussana !== "undefined")
                    successfulReturn = true;
                else
                    aloitussana = Array.from(WORDS)[Math.floor(Math.random() * WORDS.size)];
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


let moneskoRivi = 0;
let moneskoRuutu = 0;
let currentGuess = [];
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

      // Add click event listener for mouse navigation
      box.addEventListener('click', () => {
        moneskoRivi = i - 1; // Set the clicked row index
        moneskoRuutu = j; // Set the clicked column index
        highlightCurrentBox(); // Highlight the selected box
      });
    }
    board.appendChild(row);
  }
}


function highlightCurrentBox() {
  // Remove highlight from all boxes
  const allBoxes = document.querySelectorAll(".letter-box");
  allBoxes.forEach((box) => box.classList.remove("selected-box"));

  // Highlight the current box
  const currentRow = document.getElementsByClassName("letter-row")[moneskoRivi];
  const currentBox = currentRow.children[moneskoRuutu];
  currentBox.classList.add("selected-box");
}


function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[moneskoRivi];
    let box = row.children[moneskoRuutu];
    if (box.textContent != "") {
        row = document.getElementsByClassName("letter-row")[moneskoRivi];
        box = row.children[moneskoRuutu];
        box.textContent = "";
        box.classList.remove("filled-box");
        currentGuess.pop();
    } else if (box.textContent == "") {
        row = document.getElementsByClassName("letter-row")[moneskoRivi];
        box = row.children[moneskoRuutu - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        currentGuess.pop();
        moneskoRuutu -= 1;
    } else if (moneskoRuutu > 0) {
        row = document.getElementsByClassName("letter-row")[moneskoRivi];
        box = row.children[moneskoRuutu - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        currentGuess.pop();
        moneskoRuutu -= 1;
    }
}

function insertLetter(pressedKey) {
  if (moneskoRuutu < 5) {
    let row = document.getElementsByClassName("letter-row")[moneskoRivi];
    let box = row.children[moneskoRuutu];
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    if (moneskoRuutu != 4)
        moneskoRuutu += 1;
  }
}

function areGuessesLegal() {
  let rows = document.getElementsByClassName("letter-row");
  let guesses = [];
  for (let i = 0; i < TASO - 1; i++) {
    let row = rows[i];
    let word = Array.from(row.children).map(box => box.textContent.trim()).join("");
    guesses.push(word);
    
    // Only check the word once all letters are entered (no empty boxes)
    if (word.length === 5 && !WORDS.has(word)) { // Ensure the word is 5 letters long and exists in the WORDS set
      return false;
    }
  }

  // If the difference between words is more than one letter, return false
  for (let i = 0; i < guesses.length - 1; i++) {
    let differences = 0;
    for (let j = 0; j < guesses[i].length; j++) {
      if (guesses[i][j] !== guesses[i + 1][j]) differences++;
      if (differences > 1) return false;
    }
  }
  
  return true; // Everything checks out
}


document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);

  if (pressedKey === "Enter" && moneskoRivi < TASO) {
    moneskoRuutu = 0;
    currentGuess = [];
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
  if (pressedKey === "Backspace" && moneskoRuutu > 0) {
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
  // Check if all guesses are correct
  if (areGuessesLegal()) {
    alert("Onnittelut! Kaikki sanasi toimivat ja olet suorittanut pelisessiosi! Voit uudestaanladata sivun ja pelata uudestaan!");
  } else {
    alert("Yksi tai useampi sanoistasi joko eivät ole meidän sanalistassa tai muuttavat enempää kuin vain yhtä kirjainta. Tarkista vastauksesi...");
  }
}

  document.getElementById("tarkista-btn").addEventListener("click", checkWords);

// Initialize the board and load words
async function init() {
    await loadWords();  // Ensure words are loaded before initializing the game
    initBoard();
    highlightCurrentBox();
}
init();  // Call this to start the game setupdocument.getElementById("tarkista-btn").addEventListener("click", checkWords);
console.log(apiUrl);

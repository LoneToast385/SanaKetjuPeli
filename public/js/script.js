let WORDS = [];

async function loadWords() {
    try {
        const response = await fetch("/api/sanat");
        const data = await response.json();
        WORDS = data.WORDS; // Assuming the API returns { WORDS: [...] }
        console.log("Words loaded:", WORDS);
    } catch (error) {
        console.error("Error loading words:", error);
    }
}

// Call the function to load the words
loadWords();
const TASO = 5;
let moneskoRivi = 0;
let currentGuess = [];
let moneskoRuutu = 0;
const lopetussana = "sprit";
const aloitussana = "write"


function initBoard() {
  let board = document.getElementById("game-board");

  for (let i = 0; i < 1 + TASO; i++) {
    
    let row = document.createElement("div");
    if (i == 0) row.className = "starting-row";
    if (i == TASO) row.className = "destination-row"
    if (!(i == 0 || i == TASO)) row.className = "letter-row";
    

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      if (i == 0) {
        box.className = "intebox";
        box.textContent = aloitussana[j]
      } 
      if (i == TASO) {
        box.className = "intebox";
        box.textContent = lopetussana[j]
      } 
      if (!(i == 0 || i == TASO)) box.className = "letter-box";
      row.appendChild(box);
    }
  board.appendChild(row); 
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[moneskoRivi];
  let box = row.children[moneskoRuutu - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  moneskoRuutu -= 1;
}

var areGuessesLegal = function() {
    let guesses = new set();  //Muodostetaan sanoja ja asetetaan ne settiin jotta voidaan verrata yhtä toiseen.
    for(let i = 0; i <= TASO.length; i++) { 
        let tempWord = "";
        if(tempWord <= 5) 
            tempWord.concat(guesses.add(document.getElementsByClassName("letter-box animate__animated")[i].innerHTML));
        else {
            guesses.add(tempWord);
            tempWord = "";
        }
    }
    // Setit muodostettu, verrtaan sanoja...
    for(let i; i <= guesses.length - 1; i++) {
        let changedLetters = 0;
        for(let n; n <= guesses[0].length; n++)  {
            if(guesses[i][n] != guesses[i + 1][n])
                changedLetters += 1;
        if(changedLetters > 1)
            return false;
        }
    }
    return true;
}

function insertLetter(pressedKey) {
  if (moneskoRuutu === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[moneskoRivi];
  let box = row.children[moneskoRuutu];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  moneskoRuutu += 1;
}

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);

  // Move down to the next row if possible
  if (pressedKey === "Enter") {
    if (moneskoRivi < TASO) { // Only move down if not at the last row
      moneskoRivi += 1;
      moneskoRuutu = 0; // Reset column position for the new row
    }
    return;
  }

  // Move up, down, left, or right
  if (pressedKey === "ArrowDown" && moneskoRivi < TASO) {
    moneskoRivi += 1;
  }
  if (pressedKey === "ArrowUp" && moneskoRivi > 0) {
    moneskoRivi -= 1;
  }
  if (pressedKey === "ArrowLeft" && moneskoRuutu > 0) {
    moneskoRuutu -= 1;
  }
  if (pressedKey === "ArrowRight" && moneskoRuutu < 5) {
    moneskoRuutu += 1;
  }

  // Handle backspace for deleting letters
  if (pressedKey === "Backspace" && moneskoRuutu > 0) {
    deleteLetter();
    return;
  }

  // Only allow valid letters to be entered
  let found = pressedKey.match(/[a-ä]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey); // Insert the letter if valid
  }
});


document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();

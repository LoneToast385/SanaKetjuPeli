let WORDS = [];

async function loadWords() {
    try {
        const response = await fetch("/api/sanat");
        const data = await response.json();
        WORDS = data.WORDS; 
        console.log("Words loaded:", WORDS);
    } catch (error) {
        console.error("Error loading words:", error);
    }
}

// Initialize constants and variables
const TASO = 5;
let moneskoRivi = 0;
let moneskoRuutu = 0;
let currentGuess = [];
const lopetussana = "sprit";
const aloitussana = "write";

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
    }
    board.appendChild(row);
  }
}

function deleteLetter() {
  if (moneskoRuutu > 0) {
    let row = document.getElementsByClassName("letter-row")[moneskoRivi];
    let box = row.children[moneskoRuutu - 1];
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
    moneskoRuutu += 1;
  }
}

function areGuessesLegal() {
  let rows = document.getElementsByClassName("letter-row");
  let guesses = [];
  for (let i = 0; i < TASO; i++) {
    let row = rows[i];
    let word = Array.from(row.children).map(box => box.textContent.trim()).join("");
    guesses.push(word);
  }
  for (let i = 0; i < guesses.length - 1; i++) {
    let differences = 0;
    for (let j = 0; j < guesses[i].length; j++) {
      if (guesses[i][j] !== guesses[i + 1][j]) differences++;
      if (differences > 1) return false;
    }
  }
  return true;
}

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);

  if (pressedKey === "Enter" && moneskoRivi < TASO) {
    moneskoRivi++;
    moneskoRuutu = 0;
    currentGuess = [];
    return;
  }

  if (pressedKey === "ArrowDown" && moneskoRivi < TASO) moneskoRivi++;
  if (pressedKey === "ArrowUp" && moneskoRivi > 0) moneskoRivi--;
  if (pressedKey === "ArrowLeft" && moneskoRuutu > 0) moneskoRuutu--;
  if (pressedKey === "ArrowRight" && moneskoRuutu < 5) moneskoRuutu++;
  if (pressedKey === "Backspace") deleteLetter();

  let found = pressedKey.match(/[a-ä]/gi);
  if (found && found.length === 1) insertLetter(pressedKey.toLowerCase());
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;
  if (!target.classList.contains("keyboard-button")) return;
  const key = target.textContent === "Del" ? "Backspace" : target.textContent;
  document.dispatchEvent(new KeyboardEvent("keyup", { key }));
});

// Initialize the board and load words
initBoard();
loadWords();

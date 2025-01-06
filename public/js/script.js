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

function highlightCurrentBox() {
  // Remove highlight from all boxes
  const allBoxes = document.querySelectorAll(".letter-box");
  allBoxes.forEach((box) => box.classList.remove("selected-box"));

  // Highlight the current box
  if (moneskoRivi < TASO) {
    const currentRow = document.getElementsByClassName("letter-row")[moneskoRivi];
    const currentBox = currentRow.children[moneskoRuutu];
    currentBox.classList.add("selected-box");
  }
}

function deleteLetter() {
  // Get the current row
  let row = document.getElementsByClassName("letter-row")[moneskoRivi];

  if (moneskoRuutu === 5) {
    // If on the last box (Box 4)
    let box = row.children[4]; // The last box
    if (box.textContent !== "") {
      // If the last box is not empty, clear it and stay on it
      box.textContent = "";
      box.classList.remove("filled-box");
      currentGuess.pop();
      return;
    } else {
      // If the last box is empty, move to the previous box
      moneskoRuutu -= 1;
    }
  } else if (moneskoRuutu > 0) {
    // If not on the last box, move to the previous box
    moneskoRuutu -= 1;
  }

  // Handle deleting the content of the current box
  let box = row.children[moneskoRuutu];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
}



  // Determine the target box
  let box = row.children[moneskoRuutu - 1]; // Target the previous box by default

  if (box.textContent === "") {
    // If the current box is empty, move back to the previous box
    moneskoRuutu -= 1;
    box = row.children[moneskoRuutu - 1];
  }

  // Clear the content of the determined box
  box.textContent = "";
  box.classList.remove("filled-box");

  // Update the guess array
  currentGuess.pop();

  // Move back one box
  moneskoRuutu = Math.max(0, moneskoRuutu - 1);
}




function insertLetter(pressedKey) {
  if (moneskoRuutu < 5) {
    let row = document.getElementsByClassName("letter-row")[moneskoRivi];
    let box = row.children[moneskoRuutu];
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    if (moneskoRuutu <  4){
        moneskoRuutu += 1;
    }
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
    if (moneskoRivi + 2 < TASO) {
    moneskoRivi++;
    moneskoRuutu = 0;
    currentGuess = [];
    highlightCurrentBox(); // Update highlight
    }
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
      moneskoRuutu++;
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

// Initialize the board and load words
initBoard();
highlightCurrentBox();
loadWords();

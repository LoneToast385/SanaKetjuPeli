import { WORDS } from "./words.js";

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

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[moneskoRivi];
  let guessString = "";
  let rightGuess = Array.from(lopetussana);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    toastr.error("Not enough letters!");
    return;
  }

  if (!WORDS.includes(guessString)) {
    toastr.error("Word not in list!");
    return;
  }

  for (let i = 0; i < 5; i++) {
    let box = row.children[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      animateCSS(box, "flipInX");
      //shade box
      box.style.backgroundColor = letterColor[i];
      shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
    }, delay);
  }

  if (guessString === lopetussana) {
    toastr.success("You guessed right! Game over!");
    moneskoRivi = 4;
    return;
  } else {
    moneskoRivi += 1;
    currentGuess = [];
    moneskoRuutu = 0;

    if (moneskoRivi === 4) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right word was: "${lopetussana}"`);
    }
  }
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

const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });



document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key);

  if (pressedKey === "ArrowDown" && moneskoRivi != TASO) {
    moneskoRivi += 1;
  }
  if (pressedKey === "ArrowUp" && moneskoRivi != 0) {
    moneskoRivi -= 1;
  }
  if (pressedKey === "ArrowLeft" && moneskoRuutu != 0) {
      moneskoRuutu -= 1;
  }
    if (pressedKey === "ArrowRight" && moneskoRuutu != 5) {
      moneskoRuutu += 1;
  }

  if (moneskoRivi === 5) {
    return;
  }

  if (pressedKey === "Backspace" && moneskoRuutu !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[a-ä]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
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

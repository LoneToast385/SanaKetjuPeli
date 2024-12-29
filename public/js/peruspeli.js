const TASO = 5

const peliLaudanLuominen  = () => {
    let lauta = document.getElementById("peli-lauta");

    let rivi = document.createElement("div");
    rivi.className = "vihje-rivi";
    for (let j = 0; j < 5; j++) {
        let laatikko = document.createElement("div");
        laatikko.className = "muuttamaton-laatikko";
        rivi.appendChild(laatikko);
    }
    lauta.appendChild(rivi);

    for (let i = 0; i < TASO - 1; i++) {
      let rivi = document.createElement("div");
      rivi.className = "kirjain-rivi";

      for (let j = 0; j < 5; j++) {
        let laatikko = document.createElement("div");
        laatikko.className = "kirjain-laatikko";
        rivi.appendChild(laatikko);
      }
  
      lauta.appendChild(rivi);
    }
    rivi = document.createElement("div");

    rivi.className = "vihje-rivi";
    for (let j = 0; j < 5; j++) {
        let laatikko = document.createElement("div");
        laatikko.className = "muuttamaton-laatikko";
        rivi.appendChild(laatikko);
    }
    lauta.appendChild(rivi);
  }

document.addEventListener("keyup", (e) => {
  
    let painettuNäppäin = String(e.key);
    if (painettuNäppäin === "Backspace" && nextLetter !== 0) {
      deleteLetter();
      return;
    }
  
    if (painettuNäppäin === "Enter") {
      checkGuess();
      return;
    }
  
    let found = painettuNäppäin.match(/[a-ö]/gi);
    if (!found || found.length > 1) {
      return;
    } else {
      insertLetter(painettuNäppäin);
    }
  });
  
  document.getElementById("näppäimistö").addEventListener("click", (e) => {
    const target = e.target;
  
    if (!target.classList.contains("näppäin")) {
      return;
    }
    let key = target.textContent;
  
    if (key === "Del") {
      key = "Backspace";
    }
  
    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
  });
  
  peliLaudanLuominen();
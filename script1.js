let firstNumber = 0;
let secondNumber = 0;
let action = "+";
let answer = 0;

let input = document.getElementById("calc-input");
let calculationSpan = document.getElementById("calculation");
let history = [];

// ✅ [NEW 0] Istorijos rodymo būsena + istorijos limitas
let isHistoryVisible = true;
const HISTORY_LIMIT = 5;

// ✅ [NEW 0] Leidžiami veiksmai (tavo "X" paliekam)
const ACTIONS = ["+", "-", "X", "/"];

// ✅ [NEW 0] Mygtukų ir istorijos UI papildymas per JS (nekeičiant HTML)
//  - Toggle istorija
//  - Išvalyti istoriją
//  - Backspace mygtukas
(function addExtraControls() {
  // Backspace mygtukas į mygtukų grid'ą (paskutinė pozicija – kad nemažytų tavo layout)
  const buttonsWrap = document.querySelector(".calculator .buttons");
  if (buttonsWrap) {
    const backBtn = document.createElement("button");
    backBtn.textContent = "⌫";
    backBtn.title = "Ištrinti paskutinį simbolį";
    backBtn.onclick = () => onBackspaceClick(); // ✅ [NEW 6]
    buttonsWrap.appendChild(backBtn);
  }

  // Istorijos valdymo mygtukai istorijos bloke
  const historyWrap = document.querySelector(".calculator .history");
  const historyItems = document.querySelector(".calculator .history-items");

  if (historyWrap && historyItems) {
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "toggle-history";
    toggleBtn.textContent = "Slėpti istoriją";
    toggleBtn.onclick = () => toggleHistory(); // ✅ [NEW 4]
    historyWrap.insertBefore(toggleBtn, historyItems);

    const clearBtn = document.createElement("button");
    clearBtn.id = "clear-history";
    clearBtn.textContent = "Išvalyti istoriją";
    clearBtn.onclick = () => clearHistory(); // ✅ [NEW 5]
    historyWrap.insertBefore(clearBtn, historyItems);
  }
})();

function onNumberClick(number) {
  // ✅ [NEW 1] Skaičius negali prasidėti 0 (bet leidžiam 0 po operatoriaus)
  // Taip pat saugom logiką, kad input vis dar pildomas string'u.
  if (isInputAtStart() && number === 0) {
    return; // neleidžiam pradėt 0
  }

  // ✅ [NEW 3] Kablelio (.) palaikymas: čia tik skaičiai, kablelis atskirai (onCommaClick)
  input.value += number;
}

function onActionClick(clickedAction) {
  // ✅ [NEW 2] Neleisti dviejų veiksmų iš eilės.
  // Jei paskutinis simbolis yra veiksmas – pakeičiam jį nauju.
  // Taip išvengiam: "7 + - 3" ir pan.
  if (!ACTIONS.includes(clickedAction)) return;

  // Jei dar nieko neįvesta – neleisti pradėti veiksmu
  if (input.value.trim() === "") return;

  // Jei pabaigoje jau yra veiksmas -> pakeičiam
  if (endsWithAction()) {
    // pakeičiam paskutinį veiksmą (paliekant tarpus)
    input.value = input.value.trimEnd().slice(0, -1) + clickedAction + " ";
  } else {
    input.value += " " + clickedAction + " ";
  }

  action = clickedAction;
}

function onCountClick() {
  // ✅ [NEW 2] Jei baigiasi veiksmu – neskaičiuojam
  if (endsWithAction()) {
    calculationSpan.innerText = "Pabaikite įvedimą skaičiumi.";
    return;
  }

  const splitted = input.value.trim().split(" ");

  // apsauga nuo blogo formato
  if (splitted.length !== 3) {
    calculationSpan.innerText = "Blogas formatas. Pvz: 7 + 3";
    return;
  }

  // ✅ [NEW 3] Kablelio palaikymas:
  // Jei vartotojas įveda "1,5" -> paverčiam į "1.5" ir naudojam Number
  const leftRaw = normalizeDecimal(splitted[0]);
  const rightRaw = normalizeDecimal(splitted[2]);

  firstNumber = Number(leftRaw);
  action = splitted[1];
  secondNumber = Number(rightRaw);

  if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
    calculationSpan.innerText =
      "Įveskite teisingus skaičius (galite su kableliu).";
    return;
  }

  calculateAnswer();

  // ✅ [NEW 3] Rezultatą rodom su kableliu (jei yra trupmena)
  input.value = formatDecimal(answer);

  calculationSpan.innerText = `${formatDecimal(
    firstNumber
  )} ${action} ${formatDecimal(secondNumber)}`;

  addToHistory();
  renderHistory(); // ✅ [NEW 4/7] atnaujinti vaizdą iškart
}

function calculateAnswer() {
  switch (action) {
    case "+":
      answer = firstNumber + secondNumber;
      break;
    case "-":
      answer = firstNumber - secondNumber;
      break;
    case "X":
      answer = firstNumber * secondNumber;
      break;
    case "/":
      answer = firstNumber / secondNumber;
      break;
    default:
      console.log("Nežinomas veiksmas:", action);
      answer = NaN;
  }
}

function onCleanClick() {
  firstNumber = 0;
  secondNumber = 0;
  action = "+";
  answer = 0;
  input.value = "";
  calculationSpan.innerText = "";
}

// ✅ [NEW 5] Išvalyti visą istoriją
function clearHistory() {
  history = [];
  renderHistory();
}

// ✅ [NEW 4] Įjungti / išjungti istorijos rodymą
function toggleHistory() {
  const historyItems = document.querySelector(".calculator .history-items");
  const toggleBtn = document.getElementById("toggle-history");
  if (!historyItems || !toggleBtn) return;

  isHistoryVisible = !isHistoryVisible;
  historyItems.style.display = isHistoryVisible ? "" : "none";
  toggleBtn.textContent = isHistoryVisible
    ? "Slėpti istoriją"
    : "Rodyti istoriją";
}

// ✅ [NEW 6] Backspace – trinti paskutinį įvedimą (skaičių ar veiksmą)
function onBackspaceClick() {
  // Jei pabaigoje yra tarpai – pirmiausia nuimam tarpus
  let v = input.value;

  if (v.endsWith(" ")) {
    v = v.trimEnd(); // nuimam tarpus
    // jei po trimEnd baigiasi veiksmas – pašalinam ir jį
    if (v.length > 0 && ACTIONS.includes(v[v.length - 1])) {
      v = v.slice(0, -1);
    }
    input.value = v.trimEnd() ? v + " " : ""; // paliekam vieną tarpą logikai
    return;
  }

  // paprastas simbolio trynimas (skaičius ar kablelis)
  input.value = v.slice(0, -1);
}

// ✅ [NEW 3] Kablelio įvedimas – pridedam mygtuką per klaviatūrą (arba gali išsikviesti pats)
function onCommaClick() {
  // Neleidžiam kablelio jei tuščia arba ką tik buvo veiksmas (tada leidžiam "0,")
  if (input.value.trim() === "" || endsWithAction()) {
    input.value += "0,";
    return;
  }

  // Neleidžiam ant to paties skaičiaus įvesti antro kablelio
  const lastPart = input.value.trim().split(" ").pop(); // paskutinis tokenas (skaičius)
  if (lastPart.includes(",") || lastPart.includes(".")) return;

  input.value += ",";
}

// ✅ [NEW 3] Leisti įvesti kablelį ir per klaviatūrą
document.addEventListener("keydown", (e) => {
  if (e.key === "," || e.key === ".") {
    e.preventDefault();
    onCommaClick();
  }
  if (e.key === "Backspace") {
    // kadangi input readonly, backspace kitaip neveiks
    e.preventDefault();
    onBackspaceClick();
  }
  if (e.key === "Enter") {
    e.preventDefault();
    onCountClick();
  }
});

// ✅ [NEW 7] Istorijoje rodyti tik paskutinius 5
function addToHistory() {
  let historyItem = {
    firstNumber,
    action,
    secondNumber,
    answer,
  };
  history.push(historyItem);

  // laikom tik paskutinius 5
  if (history.length > HISTORY_LIMIT) {
    history = history.slice(history.length - HISTORY_LIMIT);
  }
}

// ✅ [NEW 4/7] Istorijos atvaizdavimas (naudojamas ir show-history, ir po skaičiavimo)
function renderHistory() {
  const historyBlock = document.querySelector(".calculator .history-items");
  if (!historyBlock) return;

  const formatted = history.map(
    (x) =>
      `<p>${formatDecimal(x.firstNumber)} ${x.action} ${formatDecimal(
        x.secondNumber
      )} = ${formatDecimal(x.answer)}</p>`
  );

  historyBlock.innerHTML = formatted.join("");
}

// Palieku tavo mygtuką "Rodyti istorija" – jis tiesiog perpiešia (kaip anksčiau, tik su pataisytu selektoriumi)
document.getElementById("show-history").onclick = function () {
  renderHistory();
};

// ======================
// ✅ [NEW helpers] Pagalbinės funkcijos
// ======================

// ✅ [NEW 1] Ar dabar įvedimo pradžia (tuščia) arba ką tik buvo veiksmas (t.y. prasideda naujas skaičius)
function isInputAtStart() {
  const v = input.value.trim();
  return v === "" || endsWithAction();
}

// ✅ [NEW 2] Ar įvestis baigiasi veiksmu
function endsWithAction() {
  const v = input.value.trimEnd();
  if (v === "") return false;
  const lastChar = v[v.length - 1];
  return ACTIONS.includes(lastChar);
}

// ✅ [NEW 3] Normalizuojam "1,5" -> "1.5"
function normalizeDecimal(str) {
  return str.replace(",", ".");
}

// ✅ [NEW 3] Gražiai formatuojam: 1.5 -> "1,5"
function formatDecimal(num) {
  if (!Number.isFinite(num)) return String(num);
  // jei sveikas - rodom be trupmenos
  if (Number.isInteger(num)) return String(num);
  return String(num).replace(".", ",");
}

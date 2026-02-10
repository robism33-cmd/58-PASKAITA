let firstNumber = 0;
let secondNumber = 0;
let action = "+";
let answer = 0;

let input = document.getElementById("calc-input");
let calculationSpan = document.getElementById("calculation");
let history = [];

// ✅ papildymai: istorijos būsena + limitas
let isHistoryVisible = true;
const HISTORY_LIMIT = 5;

// ✅ leidžiami veiksmai
const ACTIONS = ["+", "-", "X", "/"];

// ======================
// ✅ [NEW #4, #5] Istorijos mygtukai
// ======================
document
  .getElementById("toggle-history")
  .addEventListener("click", toggleHistory);
document
  .getElementById("clear-history")
  .addEventListener("click", clearHistory);
document
  .getElementById("show-history")
  .addEventListener("click", renderHistory);

// ======================
// ✅ [#1] Skaičius negali prasidėti 0 (leidžiama 0,5)
// ======================
function isInputAtStartOfNumber() {
  const v = input.value.trim();
  return v === "" || endsWithAction();
}

function endsWithAction() {
  const v = input.value.trimEnd();
  if (v === "") return false;
  return ACTIONS.includes(v[v.length - 1]);
}

function onNumberClick(number) {
  if (isInputAtStartOfNumber() && number === 0) {
    // leidžiam 0,5 atvejį tik jei iškart dedamas kablelis
    return;
  }
  input.value += number;
}

// ======================
// ✅ [#3] Kablelio palaikymas (mygtukas ,)
// ======================
function onCommaClick() {
  // jei pradžia arba ką tik operatorius -> pradėk "0,"
  if (input.value.trim() === "" || endsWithAction()) {
    input.value += "0,";
    return;
  }

  // neleisti 2 kablelių tame pačiame skaičiuje
  const lastPart = input.value.trim().split(" ").pop();
  if (lastPart.includes(",") || lastPart.includes(".")) return;

  input.value += ",";
}

// ✅ [#3 + #6] Klaviatūra: kablelis / backspace / enter
document.addEventListener("keydown", (e) => {
  if (e.key === "," || e.key === ".") {
    e.preventDefault();
    onCommaClick();
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    onBackspaceClick();
  }
  if (e.key === "Enter") {
    e.preventDefault();
    onCountClick();
  }
});

// ======================
// ✅ [#2] Veiksmai: neleidžiam dviejų veiksmų iš eilės
// ======================
function onActionClick(clickedAction) {
  if (!ACTIONS.includes(clickedAction)) return;

  if (input.value.trim() === "") return; // neleisti pradėti veiksmu

  if (endsWithAction()) {
    // pakeisti paskutinį veiksmą nauju
    input.value = input.value.trimEnd().slice(0, -1) + clickedAction + " ";
  } else {
    input.value += " " + clickedAction + " ";
  }

  action = clickedAction;
}

// ======================
// ✅ [#6] Backspace (⌫): trinti paskutinį skaičių ar veiksmą
// ======================
function onBackspaceClick() {
  let v = input.value;

  // jei baigiasi tarpu -> trinam tarpus ir, jei reikia, operatorių
  if (v.endsWith(" ")) {
    v = v.trimEnd();
    if (v.length > 0 && ACTIONS.includes(v[v.length - 1])) {
      v = v.slice(0, -1);
    }
    input.value = v.trimEnd() ? v + " " : "";
    return;
  }

  // trinam vieną simbolį
  input.value = v.slice(0, -1);
}

// ======================
// Skaičiavimas
// ======================
function onCountClick() {
  if (endsWithAction()) {
    calculationSpan.innerText = "Pabaikite įvedimą skaičiumi.";
    return;
  }

  const splitted = input.value.trim().split(" ");
  if (splitted.length !== 3) {
    calculationSpan.innerText = "Blogas formatas. Pvz: 7 + 3";
    return;
  }

  firstNumber = Number(normalizeDecimal(splitted[0]));
  action = splitted[1];
  secondNumber = Number(normalizeDecimal(splitted[2]));

  if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
    calculationSpan.innerText =
      "Įveskite teisingus skaičius (galite su kableliu).";
    return;
  }

  calculateAnswer();

  input.value = formatDecimal(answer);
  calculationSpan.innerText = `${formatDecimal(
    firstNumber
  )} ${action} ${formatDecimal(secondNumber)}`;

  addToHistory();
  renderHistory();
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

// ======================
// ✅ [#7] Istorija: tik paskutiniai 5
// ✅ [#4] toggle įjungti/išjungti
// ✅ [#5] clear išvalyti
// ======================
function addToHistory() {
  history.push({ firstNumber, action, secondNumber, answer });

  if (history.length > HISTORY_LIMIT) {
    history = history.slice(history.length - HISTORY_LIMIT);
  }
}

function renderHistory() {
  const historyBlock = document.querySelector(".calculator .history-items");
  if (!historyBlock) return;

  historyBlock.innerHTML = history
    .map(
      (x) =>
        `<p>${formatDecimal(x.firstNumber)} ${x.action} ${formatDecimal(
          x.secondNumber
        )} = ${formatDecimal(x.answer)}</p>`
    )
    .join("");

  historyBlock.style.display = isHistoryVisible ? "" : "none";
}

function toggleHistory() {
  const historyBlock = document.querySelector(".calculator .history-items");
  const toggleBtn = document.getElementById("toggle-history");
  if (!historyBlock || !toggleBtn) return;

  isHistoryVisible = !isHistoryVisible;
  historyBlock.style.display = isHistoryVisible ? "" : "none";
  toggleBtn.textContent = isHistoryVisible
    ? "Slėpti istoriją"
    : "Rodyti istoriją";
}

function clearHistory() {
  history = [];
  renderHistory();
}

// ======================
// ✅ Helper: kablelis -> taškas
// ======================
function normalizeDecimal(str) {
  return str.replace(",", ".");
}

function formatDecimal(num) {
  if (!Number.isFinite(num)) return String(num);
  if (Number.isInteger(num)) return String(num);
  return String(num).replace(".", ",");
}

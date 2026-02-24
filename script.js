const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const nameInput = document.getElementById("nameInput");
const historyList = document.getElementById("historyList");
const winnerNameDisplay = document.getElementById("winnerName");
const prizeLevelDisplay = document.getElementById("prizeLevel");

let names = [];
let currentRotation = 0;
let isSpinning = false;
let prizeCounter = 0;

const COLORS = ["#00bfa5", "#ef5350", "#ffeb3b", "#64b5f6", "#ba68c8"];

function updateWheel() {
  names = nameInput.value
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");
  drawWheel();
}

function drawWheel() {
  const totalSlices = names.length;
  if (totalSlices === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const arcSize = (2 * Math.PI) / totalSlices;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  names.forEach((name, i) => {
    const angle = i * arcSize + currentRotation;

    ctx.beginPath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, angle, angle + arcSize);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(name, 230, 8);
    ctx.restore();
  });
}

function spin() {
  if (isSpinning || names.length === 0) return;

  isSpinning = true;
  spinBtn.disabled = true;

  const duration = 5000;
  const startTime = performance.now();
  const spinAmount = Math.PI * 2 * 10 + Math.random() * Math.PI * 2;
  const startRotation = currentRotation;

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = 1 - Math.pow(1 - progress, 3);

    currentRotation = startRotation + spinAmount * easing;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      finalizeResult();
    }
  }
  requestAnimationFrame(animate);
}

function finalizeResult() {
  isSpinning = false;
  spinBtn.disabled = false;

  const totalSlices = names.length;
  const arcSize = (2 * Math.PI) / totalSlices;

  const normalizedRotation =
    (2 * Math.PI - (currentRotation % (2 * Math.PI))) % (2 * Math.PI);
  const winnerIndex = Math.floor(normalizedRotation / arcSize);
  const winner = names[winnerIndex];

  prizeCounter++;
  const prizeLabel = `${prizeCounter}${getOrdinal(prizeCounter)} Prize`;

  winnerNameDisplay.innerText = winner;
  prizeLevelDisplay.innerText = prizeLabel;

  const li = document.createElement("li");
  li.innerHTML = `<span>${prizeLabel}</span> <strong>${winner}</strong>`;
  historyList.prepend(li);

  // Automatic removal
  names.splice(winnerIndex, 1);
  nameInput.value = names.join(", ");

  setTimeout(drawWheel, 1000);
}

function getOrdinal(n) {
  let s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

document.getElementById("updateBtn").addEventListener("click", updateWheel);
spinBtn.addEventListener("click", spin);

updateWheel();

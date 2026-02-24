const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const nameInput = document.getElementById("nameInput");
const historyList = document.getElementById("historyList");
const applause = document.getElementById("applauseSound");
const overlay = document.getElementById("winnerOverlay");

let names = [];
let originalNames = "";
let currentRotation = 0;
let isSpinning = false;
let prizeCounter = 0;

const COLORS = ["#00bfa5", "#ef5350", "#ffeb3b", "#64b5f6", "#ba68c8"];

function updateWheel() {
  names = nameInput.value
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");
  if (originalNames === "") originalNames = nameInput.value;
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
    if (progress < 1) requestAnimationFrame(animate);
    else announceWinner();
  }
  requestAnimationFrame(animate);
}

function announceWinner() {
  isSpinning = false;
  spinBtn.disabled = false;

  const arcSize = (2 * Math.PI) / names.length;
  const normalizedRotation =
    (2 * Math.PI - (currentRotation % (2 * Math.PI))) % (2 * Math.PI);
  const winnerIndex = Math.floor(normalizedRotation / arcSize);
  const winner = names[winnerIndex];

  prizeCounter++;
  const label = `${prizeCounter}${getOrdinal(prizeCounter)} Prize`;

  // 1. Play Sound
  applause.currentTime = 0;
  applause.play();

  // 2. Show in Sidebar
  document.getElementById("winnerName").innerText = winner;
  document.getElementById("prizeLevel").innerText = label;

  // 3. Show Overlay (The "Another Tab" effect)
  document.getElementById("overlayPrize").innerText = label;
  document.getElementById("overlayName").innerText = winner;
  overlay.classList.remove("hidden");

  // 4. Update History
  const li = document.createElement("li");
  li.innerHTML = `<span>${label}</span> <strong>${winner}</strong>`;
  historyList.prepend(li);

  // 5. Remove from wheel
  names.splice(winnerIndex, 1);
  nameInput.value = names.join(", ");
  setTimeout(drawWheel, 1000);
}

function closeOverlay() {
  overlay.classList.add("hidden");
  applause.pause();
}

function getOrdinal(n) {
  let s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

document.getElementById("updateBtn").addEventListener("click", updateWheel);
document.getElementById("resetBtn").addEventListener("click", () => {
  nameInput.value = originalNames;
  prizeCounter = 0;
  historyList.innerHTML = "";
  updateWheel();
});
spinBtn.addEventListener("click", spin);

updateWheel();

const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const taskMicBtn = document.getElementById("taskMicBtn");
const timeMicBtn = document.getElementById("timeMicBtn");
const downloadBtn = document.getElementById("downloadBtn");

function updateScroll() {
  taskList.style.overflowY = taskList.children.length > 4 ? "auto" : "visible";
}

function parseSpokenTime(spoken) {
  spoken = spoken.toLowerCase().trim().replace("o'clock", "").replace("oh", "0").replace("zero", "0");
  const timeRegex = /(\d{1,2})(?::|\.| )?(\d{0,2})?\s*(a\.?m\.?|p\.?m\.?|am|pm)?/;
  const match = spoken.match(timeRegex);
  if (!match) return null;

  let hour = parseInt(match[1]);
  let minute = match[2] ? parseInt(match[2]) : 0;
  const meridian = match[3]?.replace(/\./g, "").toLowerCase();

  if (meridian === "pm" && hour < 12) hour += 12;
  if (meridian === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function startVoiceInput(inputElem) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Speech recognition not supported.");

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    if (inputElem === timeInput) {
      const parsedTime = parseSpokenTime(transcript);
      parsedTime ? (inputElem.value = parsedTime) : alert("Try saying '3 PM' or '15 30'.");
    } else {
      inputElem.value = transcript;
    }
  };

  recognition.onerror = (event) => alert("Speech error: " + event.error);
}

function addTask() {
  const taskText = taskInput.value.trim();
  const timeText = timeInput.value.trim();

  if (!taskText) return;

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${taskText}${timeText ? " - Due: " + timeText : ""}</span>
    <button>X</button>
  `;
  addDragAndRemoveListeners(li);
  taskList.appendChild(li);

  scheduleAlerts(taskText, timeText);

  taskInput.value = "";
  timeInput.value = "";
  updateScroll();
}

function scheduleAlerts(taskText, timeText) {
  if (!timeText) return;

  const now = new Date();
  const [hours, minutes] = timeText.split(":").map(Number);
  const dueTime = new Date(now);
  dueTime.setHours(hours, minutes, 0, 0);

  const msUntilDue = dueTime - now;
  const msBefore5Min = msUntilDue - 5 * 60 * 1000;

  if (msBefore5Min > 0) {
    setTimeout(() => alert(`⏰ 5 minutes left for: "${taskText}"`), msBefore5Min);
  }
  if (msUntilDue > 0) {
    setTimeout(() => alert(`🔔 Time's up for: "${taskText}"`), msUntilDue);
  }
}

function addDragAndRemoveListeners(item) {
  item.setAttribute("draggable", "true");

  item.addEventListener("dragstart", handleDragStart);
  item.addEventListener("dragenter", handleDragEnter);
  item.addEventListener("dragover", handleDragOver);
  item.addEventListener("dragleave", handleDragLeave);
  item.addEventListener("drop", handleDrop);
  item.addEventListener("dragend", handleDragEnd);

  item.querySelector("span").onclick = () => item.classList.toggle("completed");
  item.querySelector("button").onclick = () => {
    item.remove();
    updateScroll();
  };
}

let dragSrcEl = null;
function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
  this.classList.add("dragging");
}
function handleDragEnter(e) {
  if (this !== dragSrcEl) this.classList.add("drag-over");
}
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}
function handleDragLeave(e) {
  this.classList.remove("drag-over");
}
function handleDrop(e) {
  e.stopPropagation();
  if (dragSrcEl !== this) {
    const temp = dragSrcEl.innerHTML;
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = temp;
    addDragAndRemoveListeners(dragSrcEl);
    addDragAndRemoveListeners(this);
  }
}
function handleDragEnd(e) {
  this.classList.remove("dragging");
  taskList.querySelectorAll("li").forEach((item) => item.classList.remove("drag-over"));
}

function downloadTasksAsCSV() {
  const rows = [["Task", "Time", "Completed"]];
  taskList.querySelectorAll("li").forEach((item) => {
    const [textPart, timePart] = item.querySelector("span").textContent.split(" - Due: ");
    rows.push([textPart.trim(), timePart || "", item.classList.contains("completed")]);
  });

  const csvContent = rows.map(r => r.map(escapeCSV).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "tasks.csv";
  link.click();
}

function escapeCSV(val) {
  if (typeof val !== "string") return val;
  if (val.includes(",") || val.includes('"')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

// Event bindings
addBtn.onclick = addTask;
deleteAllBtn.onclick = () => {
  taskList.innerHTML = "";
  updateScroll();
};
downloadBtn.onclick = downloadTasksAsCSV;
taskMicBtn.onclick = () => startVoiceInput(taskInput);
timeMicBtn.onclick = () => startVoiceInput(timeInput);
[taskInput, timeInput].forEach((input) => input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
}));
updateScroll();

const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const taskMicBtn = document.getElementById("taskMicBtn");
const timeMicBtn = document.getElementById("timeMicBtn");

// Scroll bar only if tasks > 4
function updateScroll() {
  if (taskList.children.length > 4) {
    taskList.style.overflowY = "auto";
  } else {
    taskList.style.overflowY = "visible";
  }
}

function parseSpokenTime(spoken) {
  spoken = spoken.toLowerCase().trim();
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/;
  const match = spoken.match(timeRegex);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  let minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (ampm === "pm" && hours < 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;

  if (hours > 23 || minutes > 59) return null;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function startVoiceInput(inputElem) {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Sorry, your browser does not support speech recognition.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    if (inputElem.type === "time") {
      const parsedTime = parseSpokenTime(transcript);
      if (parsedTime) {
        inputElem.value = parsedTime;
      } else {
        alert("Could not understand time. Please try again (e.g., say '3 PM' or '15 30').");
      }
    } else {
      inputElem.value = transcript;
    }
  };

  recognition.onerror = (event) => {
    alert("Speech recognition error: " + event.error);
  };
}

function addDragAndRemoveListeners(item) {
  item.setAttribute("draggable", "true");

  item.addEventListener("dragstart", handleDragStart);
  item.addEventListener("dragenter", handleDragEnter);
  item.addEventListener("dragover", handleDragOver);
  item.addEventListener("dragleave", handleDragLeave);
  item.addEventListener("drop", handleDrop);
  item.addEventListener("dragend", handleDragEnd);

  const span = item.querySelector("span");
  const removeBtn = item.querySelector("button");

  if (span) {
    span.onclick = () => item.classList.toggle("completed");
  }
  if (removeBtn) {
    removeBtn.onclick = () => {
      item.remove();
      updateScroll();
    };
  }
}

let dragSrcEl = null;

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
  this.classList.add("dragging");
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault(); // Allow drop
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  if (this !== dragSrcEl) {
    this.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation(); // Stop default action

  if (dragSrcEl !== this) {
    // Swap the innerHTML of dragged and dropped elements
    const temp = dragSrcEl.innerHTML;
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = temp;

    // Reattach listeners after swapping innerHTML
    addDragAndRemoveListeners(dragSrcEl);
    addDragAndRemoveListeners(this);
  }

  return false;
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  // Remove drag-over class from all list items
  const items = taskList.querySelectorAll("li");
  items.forEach(item => item.classList.remove("drag-over"));
}

function addTask() {
  const taskText = taskInput.value.trim();
  const timeText = timeInput.value;

  if (taskText === "") return;

  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = `${taskText}${timeText ? ` - Due: ${timeText}` : ""}`;

  // Toggle completed on click
  span.onclick = () => li.classList.toggle("completed");

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    li.remove();
    updateScroll();
  };

  li.appendChild(span);
  li.appendChild(removeBtn);
  taskList.appendChild(li);

  // Add drag and remove button listeners
  addDragAndRemoveListeners(li);

  if (timeText) {
    const now = new Date();
    const [hours, minutes] = timeText.split(":").map(Number);
    const dueTime = new Date(now);
    dueTime.setHours(hours, minutes, 0, 0);

    const msUntilDue = dueTime - now;
    const msBefore5Min = msUntilDue - 5 * 60 * 1000;

    if (msBefore5Min > 0) {
      setTimeout(() => {
        alert(`⏰ 5 minutes left to finish: "${taskText}"`);
      }, msBefore5Min);
    }

    if (msUntilDue > 0) {
      setTimeout(() => {
        alert(`🔔 Time's up for: "${taskText}"`);
      }, msUntilDue);
    }
  }

  taskInput.value = "";
  timeInput.value = "";
  updateScroll();
}

deleteAllBtn.onclick = () => {
  taskList.innerHTML = "";
  updateScroll();
};

taskMicBtn.onclick = () => startVoiceInput(taskInput);
timeMicBtn.onclick = () => startVoiceInput(timeInput);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

timeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

updateScroll();

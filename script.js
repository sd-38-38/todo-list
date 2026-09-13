const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const categoryOptions = document.getElementById("todo-category-options");
const hourDisplay = document.getElementById("hour-display");
const minuteDisplay = document.getElementById("minute-display");
const hourDownBtn = document.getElementById("hour-down");
const hourUpBtn = document.getElementById("hour-up");
const minuteDownBtn = document.getElementById("minute-down");
const minuteUpBtn = document.getElementById("minute-up");
const clearTimeBtn = document.getElementById("clear-time");
const durationChips = document.getElementById("duration-chips");
const importanceChips = document.getElementById("importance-chips");
const list = document.getElementById("todo-list");
const clearAllBtn = document.getElementById("clear-all");
const formError = document.getElementById("form-error");
const countEl = document.getElementById("todo-count");
const categoryForm = document.getElementById("category-form");
const categoryNameInput = document.getElementById("category-name");
const categoryError = document.getElementById("category-error");
const categoryList = document.getElementById("category-list");
const colorOptions = document.getElementById("color-options");
const categoryFilters = document.getElementById("category-filters");
const taskModal = document.getElementById("task-modal");
const modalTitle = document.getElementById("modal-title");
const modalSubmit = document.getElementById("modal-submit");
const openTaskModalBtn = document.getElementById("open-task-modal");
const closeTaskModalBtn = document.getElementById("close-task-modal");
const appRoot = document.querySelector(".app");
const focusOverlay = document.getElementById("focus-overlay");
const focusTaskCard = document.getElementById("focus-task-card");
const focusTaskTitle = document.getElementById("focus-task-title");
const focusTaskMeta = document.getElementById("focus-task-meta");
const focusTimer = document.getElementById("focus-timer");
const focusTimerLabel = document.getElementById("focus-timer-label");
const closeFocusBtn = document.getElementById("close-focus");
const focusPlayBtn = document.getElementById("focus-play");
const focusPauseBtn = document.getElementById("focus-pause");

const STORAGE_KEY = "todo-list";
const CATEGORY_KEY = "todo-categories";
const CATEGORY_COLORS = [
  "#ef9a9a",
  "#ffcc80",
  "#fff59d",
  "#a5d6a7",
  "#90caf9",
  "#ce93d8",
  "#80deea",
  "#f48fb1",
];

const DURATION_LABELS = {
  15: "15 dakika",
  30: "30 dakika",
  45: "45 dakika",
  60: "1 saat",
  90: "1,5 saat",
  120: "2 saat",
  180: "3 saat",
  240: "4 saat",
  300: "5 saat",
  360: "6 saat",
  480: "8 saat",
};

const IMPORTANCE_OPTIONS = [
  { id: "high", label: "Yüksek önem" },
  { id: "medium", label: "Orta önem" },
  { id: "low", label: "Düşük önem" },
];

const editIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
`;

const startIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.14v13.72L19 12 8 5.14Z"/>
  </svg>
`;

const deleteIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M19 6l-1 14H6L5 6"/>
  </svg>
`;

let categories = [];
let selectedColor = CATEGORY_COLORS[0];
let activeFilter = "all";
let selectedTaskCategory = "";
let selectedHour = null;
let selectedMinute = 0;
let selectedDuration = 0;
let selectedImportance = "medium";
let editingItem = null;
let editingCategoryId = null;
let timerId = null;
let remainingSeconds = 0;
let originalSeconds = 0;
let countingDown = true;

function padTime(value) {
  return String(value).padStart(2, "0");
}

function getSelectedTime() {
  if (selectedHour === null) return "";
  return `${padTime(selectedHour)}:${padTime(selectedMinute)}`;
}

function renderClock() {
  hourDisplay.textContent = selectedHour === null ? "--" : padTime(selectedHour);
  minuteDisplay.textContent = selectedHour === null ? "--" : padTime(selectedMinute);
  clearTimeBtn.classList.toggle("active", selectedHour === null);
}

function ensureTime() {
  if (selectedHour === null) {
    selectedHour = 9;
    selectedMinute = 0;
  }
}

function changeHour(step) {
  ensureTime();
  selectedHour = (selectedHour + step + 24) % 24;
  renderClock();
}

function changeMinute(step) {
  ensureTime();
  selectedMinute = (selectedMinute + step + 60) % 60;
  renderClock();
}

function renderDurationChips() {
  durationChips.innerHTML = "";
  const noneBtn = document.createElement("button");
  noneBtn.type = "button";
  noneBtn.className = "choice-chip" + (selectedDuration === 0 ? " active" : "");
  noneBtn.textContent = "Yok";
  noneBtn.addEventListener("click", () => {
    selectedDuration = 0;
    renderDurationChips();
  });
  durationChips.appendChild(noneBtn);

  Object.entries(DURATION_LABELS).forEach(([minutes, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-chip" + (selectedDuration === Number(minutes) ? " active" : "");
    button.textContent = label;
    button.addEventListener("click", () => {
      selectedDuration = Number(minutes);
      renderDurationChips();
    });
    durationChips.appendChild(button);
  });
}

function renderImportanceChips() {
  importanceChips.innerHTML = "";
  IMPORTANCE_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "choice-chip importance-" + option.id + (selectedImportance === option.id ? " active" : "");
    button.textContent = option.label;
    button.addEventListener("click", () => {
      selectedImportance = option.id;
      renderImportanceChips();
    });
    importanceChips.appendChild(button);
  });
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
}

function stopFocusTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  updateTimerControls();
}

function updateTimerControls() {
  const running = Boolean(timerId);
  const finished = countingDown && remainingSeconds <= 0 && originalSeconds > 0;
  focusPlayBtn.disabled = running;
  focusPauseBtn.disabled = !running;
  if (finished) {
    focusPlayBtn.disabled = false;
    focusPauseBtn.disabled = true;
  }
}

function tickFocusTimer() {
  if (countingDown) {
    remainingSeconds -= 1;
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      focusTimer.textContent = formatClock(0);
      focusTimer.classList.add("done");
      focusTimerLabel.textContent = "Süre doldu";
      stopFocusTimer();
      return;
    }
  } else {
    remainingSeconds += 1;
  }
  focusTimer.textContent = formatClock(remainingSeconds);
}

function pauseFocusTimer() {
  stopFocusTimer();
}

function playFocusTimer() {
  if (timerId) return;
  if (countingDown && remainingSeconds <= 0) {
    remainingSeconds = originalSeconds;
    focusTimer.classList.remove("done");
    focusTimerLabel.textContent = "Kalan süre";
    focusTimer.textContent = formatClock(remainingSeconds);
  }
  timerId = setInterval(tickFocusTimer, 1000);
  updateTimerControls();
}

function closeFocusMode() {
  stopFocusTimer();
  focusOverlay.hidden = true;
  appRoot.classList.remove("is-blurred");
  focusTimer.classList.remove("done");
}

function prepareFocusTimer(durationMinutes) {
  stopFocusTimer();
  countingDown = durationMinutes > 0;
  originalSeconds = countingDown ? durationMinutes * 60 : 0;
  remainingSeconds = originalSeconds;
  focusTimerLabel.textContent = countingDown ? "Kalan süre" : "Geçen süre";
  focusTimer.textContent = formatClock(remainingSeconds);
  focusTimer.classList.remove("done");
  updateTimerControls();
}

function openFocusMode(todo) {
  focusTaskTitle.textContent = todo.text;
  focusTaskMeta.innerHTML = "";

  if (todo.categoryColor) {
    focusTaskCard.style.background = hexToRgba(todo.categoryColor, 0.28);
    focusTaskCard.style.borderColor = todo.categoryColor;
  } else {
    focusTaskCard.style.background = "";
    focusTaskCard.style.borderColor = "";
  }

  if (todo.categoryName) {
    const badge = document.createElement("span");
    badge.className = "todo-badge";
    badge.textContent = todo.categoryName;
    badge.style.background = todo.categoryColor || "#8fb8ce";
    badge.style.color = isLightColor(todo.categoryColor || "#8fb8ce") ? "#3a5568" : "#fff";
    focusTaskMeta.appendChild(badge);
  }

  const importance = document.createElement("span");
  importance.className = "todo-badge importance-" + (todo.importance || "medium");
  importance.textContent = importanceLabel(todo.importance || "medium");
  focusTaskMeta.appendChild(importance);

  const rangeText = formatTimeRange(todo.time || "", Number(todo.duration) || 0);
  if (rangeText) {
    const timeEl = document.createElement("span");
    timeEl.className = "todo-time";
    timeEl.textContent = rangeText;
    focusTaskMeta.appendChild(timeEl);
  }

  appRoot.classList.add("is-blurred");
  focusOverlay.hidden = false;
  prepareFocusTimer(Number(todo.duration) || 0);
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const number = parseInt(value, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isLightColor(hex) {
  const value = hex.replace("#", "");
  const number = parseInt(value, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function updateCount() {
  const total = [...list.querySelectorAll("li")].filter((item) => !item.classList.contains("hidden")).length;
  countEl.textContent = `Toplam görev: ${total}`;
}

function applyFilter() {
  [...list.querySelectorAll("li")].forEach((item) => {
    const match = activeFilter === "all" || item.dataset.categoryId === activeFilter;
    item.classList.toggle("hidden", !match);
  });
  updateCount();
}

function renderCategoryFilters() {
  if (activeFilter !== "all" && !categories.some((category) => category.id === activeFilter)) {
    activeFilter = "all";
  }

  categoryFilters.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "filter-chip" + (activeFilter === "all" ? " active" : "");
  allBtn.textContent = "Tümü";
  allBtn.addEventListener("click", () => {
    activeFilter = "all";
    renderCategoryFilters();
    applyFilter();
  });
  categoryFilters.appendChild(allBtn);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip" + (activeFilter === category.id ? " active" : "");
    button.textContent = category.name;
    button.style.background = category.color;
    button.style.borderColor = category.color;
    button.style.color = isLightColor(category.color) ? "#2f3d2f" : "#fff";
    button.addEventListener("click", () => {
      activeFilter = category.id;
      renderCategoryFilters();
      applyFilter();
    });
    categoryFilters.appendChild(button);
  });
}

function renderColorOptions() {
  colorOptions.innerHTML = "";
  CATEGORY_COLORS.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-option" + (color === selectedColor ? " selected" : "");
    button.style.background = color;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(color === selectedColor));
    button.setAttribute("aria-label", `Renk ${index + 1}`);
    button.addEventListener("click", () => {
      selectedColor = color;
      renderColorOptions();
    });
    colorOptions.appendChild(button);
  });
}

function fillTaskForm(todo) {
  input.value = todo.text || "";
  selectedTaskCategory = todo.categoryId || "";
  selectedDuration = Number(todo.duration) || 0;
  selectedImportance = todo.importance || "medium";

  if (todo.time && todo.time.includes(":")) {
    const [hours, minutes] = todo.time.split(":").map(Number);
    selectedHour = hours;
    selectedMinute = minutes;
  } else {
    selectedHour = null;
    selectedMinute = 0;
  }

  renderCategorySelect();
  renderClock();
  renderDurationChips();
  renderImportanceChips();
}

function resetTaskPickers() {
  selectedTaskCategory = "";
  selectedHour = null;
  selectedMinute = 0;
  selectedDuration = 0;
  selectedImportance = "medium";
  input.value = "";
  renderCategorySelect();
  renderClock();
  renderDurationChips();
  renderImportanceChips();
}

function openTaskModal(item = null) {
  editingItem = item;
  hideFormError();
  taskModal.hidden = false;

  if (item) {
    modalTitle.textContent = "Görevi Düzenle";
    modalSubmit.textContent = "Kaydet";
    fillTaskForm(todoFromItem(item));
  } else {
    modalTitle.textContent = "Görev Ekle";
    modalSubmit.textContent = "Ekle";
    resetTaskPickers();
  }

  input.focus();
}

function closeTaskModal() {
  taskModal.hidden = true;
  editingItem = null;
  hideFormError();
}

function saveCategories() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function loadCategories() {
  const raw = localStorage.getItem(CATEGORY_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) categories = parsed;
  } catch {
    localStorage.removeItem(CATEGORY_KEY);
  }
}

function renderCategorySelect() {
  if (selectedTaskCategory && !categories.some((category) => category.id === selectedTaskCategory)) {
    selectedTaskCategory = "";
  }

  categoryOptions.innerHTML = "";

  const noneBtn = document.createElement("button");
  noneBtn.type = "button";
  noneBtn.className = "choice-chip" + (selectedTaskCategory === "" ? " active" : "");
  noneBtn.textContent = "Yok";
  noneBtn.addEventListener("click", () => {
    selectedTaskCategory = "";
    renderCategorySelect();
  });
  categoryOptions.appendChild(noneBtn);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-chip" + (selectedTaskCategory === category.id ? " active" : "");
    button.textContent = category.name;
    button.style.background = selectedTaskCategory === category.id ? category.color : hexToRgba(category.color, 0.22);
    button.style.borderColor = category.color;
    button.style.color = selectedTaskCategory === category.id && !isLightColor(category.color) ? "#fff" : "#3a5568";
    button.addEventListener("click", () => {
      selectedTaskCategory = category.id;
      renderCategorySelect();
    });
    categoryOptions.appendChild(button);
  });
}

function startCategoryEdit(category) {
  editingCategoryId = category.id;
  categoryNameInput.value = category.name;
  selectedColor = category.color;
  colorOptions.hidden = false;
  renderColorOptions();
  renderCategoryList();
  categoryNameInput.focus();
}

function resetCategoryForm() {
  editingCategoryId = null;
  categoryNameInput.value = "";
  selectedColor = CATEGORY_COLORS[0];
  colorOptions.hidden = true;
  renderColorOptions();
}

function updateTodosForCategory(category) {
  [...list.querySelectorAll("li")].forEach((item) => {
    if (item.dataset.categoryId !== category.id) return;
    const data = todoFromItem(item);
    data.categoryName = category.name;
    data.categoryColor = category.color;
    item.replaceWith(createTodoItem(data));
  });
  saveTodos();
}

function renderCategoryList() {
  categoryList.innerHTML = "";

  categories.forEach((category) => {
    const item = document.createElement("li");
    if (editingCategoryId === category.id) item.classList.add("editing");

    const swatch = document.createElement("span");
    swatch.className = "category-swatch";
    swatch.style.background = category.color;

    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = category.name;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.setAttribute("aria-label", "Kategoriyi Düzenle");
    editBtn.title = "Düzenle";
    editBtn.innerHTML = editIcon;
    editBtn.addEventListener("click", () => startCategoryEdit(category));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Kategoriyi Sil");
    deleteBtn.title = "Sil";
    deleteBtn.innerHTML = deleteIcon;
    deleteBtn.addEventListener("click", () => {
      if (editingCategoryId === category.id) resetCategoryForm();
      categories = categories.filter((entry) => entry.id !== category.id);
      saveCategories();
      renderCategoryList();
      renderCategorySelect();
      renderCategoryFilters();
      applyFilter();
    });

    item.append(swatch, name, editBtn, deleteBtn);
    categoryList.appendChild(item);
  });
}

function formatDuration(minutes) {
  return DURATION_LABELS[minutes] || `${minutes} dakika`;
}

function formatTimeRange(time, duration) {
  if (!time && !duration) return "";
  if (time && !duration) return time;
  if (!time && duration) return formatDuration(duration);

  const [hours, minutes] = time.split(":").map(Number);
  const start = hours * 60 + minutes;
  const end = (start + duration) % (24 * 60);
  const endHours = String(Math.floor(end / 60)).padStart(2, "0");
  const endMinutes = String(end % 60).padStart(2, "0");
  return `${time} – ${endHours}:${endMinutes} · ${formatDuration(duration)}`;
}

function importanceLabel(id) {
  return IMPORTANCE_OPTIONS.find((option) => option.id === id)?.label || "Orta önem";
}

function todoFromItem(item) {
  return {
    text: item.querySelector(".todo-text").textContent,
    completed: item.querySelector(".todo-check").checked,
    categoryId: item.dataset.categoryId || "",
    categoryName: item.dataset.categoryName || "",
    categoryColor: item.dataset.categoryColor || "",
    time: item.dataset.time || "",
    duration: Number(item.dataset.duration) || 0,
    importance: item.dataset.importance || "medium",
  };
}

function saveTodos() {
  const todos = [...list.querySelectorAll("li")].map(todoFromItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  applyFilter();
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const todos = JSON.parse(raw);
    if (!Array.isArray(todos)) return;

    todos.forEach((todo) => {
      if (!todo || typeof todo.text !== "string") return;
      list.appendChild(createTodoItem(todo));
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function createTodoItem(todo) {
  const item = document.createElement("li");
  item.dataset.categoryId = todo.categoryId || "";
  item.dataset.categoryName = todo.categoryName || "";
  item.dataset.categoryColor = todo.categoryColor || "";
  item.dataset.time = todo.time || "";
  item.dataset.duration = String(todo.duration || 0);
  item.dataset.importance = todo.importance || "medium";

  if (todo.categoryColor) {
    item.style.background = hexToRgba(todo.categoryColor, 0.28);
    item.style.borderColor = todo.categoryColor;
    item.style.borderLeftColor = todo.categoryColor;
    item.style.borderLeftWidth = "7px";
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-check";
  checkbox.checked = Boolean(todo.completed);

  const body = document.createElement("div");
  body.className = "todo-body";

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = todo.text;
  if (todo.completed) textSpan.classList.add("completed");

  const meta = document.createElement("div");
  meta.className = "todo-meta";

  if (todo.categoryName) {
    const badge = document.createElement("span");
    badge.className = "todo-badge";
    badge.textContent = todo.categoryName;
    badge.style.background = todo.categoryColor || "#8fb8ce";
    badge.style.color = isLightColor(todo.categoryColor || "#8fb8ce") ? "#3a5568" : "#fff";
    meta.appendChild(badge);
  }

  const importance = document.createElement("span");
  importance.className = "todo-badge importance-" + (todo.importance || "medium");
  importance.textContent = importanceLabel(todo.importance || "medium");
  meta.appendChild(importance);

  const rangeText = formatTimeRange(todo.time || "", Number(todo.duration) || 0);
  if (rangeText) {
    const timeEl = document.createElement("span");
    timeEl.className = "todo-time";
    timeEl.textContent = rangeText;
    meta.appendChild(timeEl);
  }

  body.append(textSpan, meta);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.setAttribute("aria-label", "Düzenle");
  editBtn.title = "Düzenle";
  editBtn.innerHTML = editIcon;
  editBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openTaskModal(item);
  });

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.className = "start-btn";
  startBtn.setAttribute("aria-label", "Başlat");
  startBtn.title = "Başlat";
  startBtn.innerHTML = startIcon;
  startBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openFocusMode(todoFromItem(item));
  });

  checkbox.addEventListener("change", () => {
    textSpan.classList.toggle("completed", checkbox.checked);
    saveTodos();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.setAttribute("aria-label", "Sil");
  deleteBtn.title = "Sil";
  deleteBtn.innerHTML = deleteIcon;
  deleteBtn.addEventListener("click", () => {
    item.remove();
    saveTodos();
  });

  item.append(checkbox, body, editBtn, startBtn, deleteBtn);
  return item;
}

function showFormError() {
  formError.hidden = false;
  input.classList.add("invalid");
  input.focus();
}

function hideFormError() {
  formError.hidden = true;
  input.classList.remove("invalid");
}

function showCategoryError() {
  categoryError.hidden = false;
  categoryNameInput.classList.add("invalid");
  categoryNameInput.focus();
}

function hideCategoryError() {
  categoryError.hidden = true;
  categoryNameInput.classList.remove("invalid");
}

function buildTodoFromForm(completed = false) {
  const selected = categories.find((category) => category.id === selectedTaskCategory);
  return {
    text: input.value.trim(),
    completed,
    categoryId: selected ? selected.id : "",
    categoryName: selected ? selected.name : "",
    categoryColor: selected ? selected.color : "",
    time: getSelectedTime(),
    duration: selectedDuration,
    importance: selectedImportance,
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    showFormError();
    return;
  }

  hideFormError();

  if (editingItem) {
    const updated = buildTodoFromForm(editingItem.querySelector(".todo-check").checked);
    editingItem.replaceWith(createTodoItem(updated));
  } else {
    list.appendChild(createTodoItem(buildTodoFromForm(false)));
  }

  saveTodos();
  input.value = "";
  closeTaskModal();
});

input.addEventListener("input", hideFormError);

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = categoryNameInput.value.trim();
  if (!name) {
    showCategoryError();
    return;
  }

  hideCategoryError();

  if (editingCategoryId) {
    const category = categories.find((entry) => entry.id === editingCategoryId);
    if (category) {
      category.name = name;
      category.color = selectedColor;
      saveCategories();
      updateTodosForCategory(category);
    }
  } else {
    categories.push({
      id: String(Date.now()),
      name,
      color: selectedColor,
    });
    saveCategories();
  }

  resetCategoryForm();
  renderCategoryList();
  renderCategorySelect();
  renderCategoryFilters();
  categoryNameInput.focus();
});

categoryNameInput.addEventListener("input", () => {
  hideCategoryError();
  if (!editingCategoryId) {
    colorOptions.hidden = !categoryNameInput.value.trim();
  }
});

openTaskModalBtn.addEventListener("click", () => openTaskModal());
closeTaskModalBtn.addEventListener("click", closeTaskModal);
closeFocusBtn.addEventListener("click", closeFocusMode);
focusPlayBtn.addEventListener("click", playFocusTimer);
focusPauseBtn.addEventListener("click", pauseFocusTimer);
taskModal.addEventListener("click", (event) => {
  if (event.target === taskModal) closeTaskModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!focusOverlay.hidden) {
    closeFocusMode();
    return;
  }
  if (!taskModal.hidden) closeTaskModal();
});

clearAllBtn.addEventListener("click", () => {
  list.innerHTML = "";
  saveTodos();
});

loadCategories();
renderColorOptions();
renderCategoryList();
renderCategorySelect();
renderCategoryFilters();
loadTodos();
applyFilter();
renderClock();
renderDurationChips();
renderImportanceChips();

hourUpBtn.addEventListener("click", () => changeHour(1));
hourDownBtn.addEventListener("click", () => changeHour(-1));
minuteUpBtn.addEventListener("click", () => changeMinute(5));
minuteDownBtn.addEventListener("click", () => changeMinute(-5));
clearTimeBtn.addEventListener("click", () => {
  selectedHour = null;
  selectedMinute = 0;
  renderClock();
});

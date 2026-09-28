const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const clearDateBtn = document.getElementById("clear-date");
const categoryOptions = document.getElementById("todo-category-options");
const hourDisplay = document.getElementById("hour-display");
const minuteDisplay = document.getElementById("minute-display");
const hourDownBtn = document.getElementById("hour-down");
const hourUpBtn = document.getElementById("hour-up");
const minuteDownBtn = document.getElementById("minute-down");
const minuteUpBtn = document.getElementById("minute-up");
const clearTimeBtn = document.getElementById("clear-time");
const durationChips = document.getElementById("duration-chips");
const durationHoursInput = document.getElementById("duration-hours");
const durationMinutesInput = document.getElementById("duration-minutes");
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
const openTaskFromCalendarBtn = document.getElementById("open-task-from-calendar");
const appRoot = document.getElementById("app-root");
const shell = document.querySelector(".shell");
const focusOverlay = document.getElementById("focus-overlay");
const focusTaskCard = document.getElementById("focus-task-card");
const focusTaskTitle = document.getElementById("focus-task-title");
const focusTaskMeta = document.getElementById("focus-task-meta");
const focusTimer = document.getElementById("focus-timer");
const focusTimerLabel = document.getElementById("focus-timer-label");
const closeFocusBtn = document.getElementById("close-focus");
const focusPlayBtn = document.getElementById("focus-play");
const focusPauseBtn = document.getElementById("focus-pause");
const tasksView = document.getElementById("tasks-view");
const calendarView = document.getElementById("calendar-view");
const navTasks = document.getElementById("nav-tasks");
const navCalendar = document.getElementById("nav-calendar");
const calendarGrid = document.getElementById("calendar-grid");
const calMonthLabel = document.getElementById("cal-month-label");
const calPrevBtn = document.getElementById("cal-prev");
const calNextBtn = document.getElementById("cal-next");
const calTodayBtn = document.getElementById("cal-today");
const selectedDayLabel = document.getElementById("selected-day-label");
const dayTodoList = document.getElementById("day-todo-list");
const dayTodoCount = document.getElementById("day-todo-count");

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

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const WEEKDAY_NAMES = [
  "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi",
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
let selectedDate = "";
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
let currentView = "tasks";
let calendarCursor = startOfMonth(new Date());
let selectedDay = toDateKey(new Date());

function padTime(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateKey(key) {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(key) {
  const date = parseDateKey(key);
  if (!date) return "";
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(key) {
  const date = parseDateKey(key);
  if (!date) return "";
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function getAllTodos() {
  return [...list.querySelectorAll("li")].map(todoFromItem);
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

function renderDatePicker() {
  dateInput.value = selectedDate || "";
  clearDateBtn.classList.toggle("active", !selectedDate);
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

function syncDurationInputs() {
  const hours = Math.floor(selectedDuration / 60);
  const minutes = selectedDuration % 60;
  durationHoursInput.value = hours || "";
  durationMinutesInput.value = minutes || "";
}

function applyCustomDuration() {
  const hours = Math.max(0, Number(durationHoursInput.value) || 0);
  let minutes = Math.max(0, Number(durationMinutesInput.value) || 0);
  if (minutes > 59) minutes = 59;
  durationMinutesInput.value = durationMinutesInput.value === "" && minutes === 0 ? "" : String(minutes);
  selectedDuration = hours * 60 + minutes;
  renderDurationChips(false);
}

function renderDurationChips(syncInputs = true) {
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

  const isPreset = selectedDuration === 0 || Object.prototype.hasOwnProperty.call(DURATION_LABELS, selectedDuration);
  if (!isPreset) {
    const customBtn = document.createElement("button");
    customBtn.type = "button";
    customBtn.className = "choice-chip active";
    customBtn.textContent = "Özel";
    durationChips.appendChild(customBtn);
  }

  if (syncInputs) syncDurationInputs();
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
  shell.classList.remove("is-blurred");
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

function appendTodoMeta(container, todo) {
  if (todo.categoryName) {
    const badge = document.createElement("span");
    badge.className = "todo-badge";
    badge.textContent = todo.categoryName;
    badge.style.background = todo.categoryColor || "#8fb8ce";
    badge.style.color = isLightColor(todo.categoryColor || "#8fb8ce") ? "#3a5568" : "#fff";
    container.appendChild(badge);
  }

  if (todo.date) {
    const dateBadge = document.createElement("span");
    dateBadge.className = "todo-badge date-badge";
    dateBadge.textContent = formatShortDate(todo.date);
    container.appendChild(dateBadge);
  }

  const importance = document.createElement("span");
  importance.className = "todo-badge importance-" + (todo.importance || "medium");
  importance.textContent = importanceLabel(todo.importance || "medium");
  container.appendChild(importance);

  const rangeText = formatTimeRange(todo.time || "", Number(todo.duration) || 0);
  if (rangeText) {
    const timeEl = document.createElement("span");
    timeEl.className = "todo-time";
    timeEl.textContent = rangeText;
    container.appendChild(timeEl);
  }
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

  appendTodoMeta(focusTaskMeta, todo);

  appRoot.classList.add("is-blurred");
  shell.classList.add("is-blurred");
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

function setView(view) {
  currentView = view;
  tasksView.hidden = view !== "tasks";
  calendarView.hidden = view !== "calendar";
  navTasks.classList.toggle("active", view === "tasks");
  navCalendar.classList.toggle("active", view === "calendar");

  if (view === "calendar") {
    renderCalendar();
    renderDayDetail();
  }
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
  selectedDate = todo.date || "";
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
  renderDatePicker();
  renderClock();
  renderDurationChips();
  renderImportanceChips();
}

function resetTaskPickers(presetDate = "") {
  selectedTaskCategory = "";
  selectedDate = presetDate || "";
  selectedHour = null;
  selectedMinute = 0;
  selectedDuration = 0;
  selectedImportance = "medium";
  input.value = "";
  renderCategorySelect();
  renderDatePicker();
  renderClock();
  renderDurationChips();
  renderImportanceChips();
}

function openTaskModal(item = null, presetDate = "") {
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
    resetTaskPickers(presetDate);
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
  if (DURATION_LABELS[minutes]) return DURATION_LABELS[minutes];
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours && rest) return `${hours} saat ${rest} dakika`;
  if (hours) return `${hours} saat`;
  return `${minutes} dakika`;
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
    id: item.dataset.id || "",
    text: item.querySelector(".todo-text").textContent,
    completed: item.querySelector(".todo-check").checked,
    categoryId: item.dataset.categoryId || "",
    categoryName: item.dataset.categoryName || "",
    categoryColor: item.dataset.categoryColor || "",
    date: item.dataset.date || "",
    time: item.dataset.time || "",
    duration: Number(item.dataset.duration) || 0,
    importance: item.dataset.importance || "medium",
  };
}

function findTodoItemById(id) {
  if (!id) return null;
  return [...list.querySelectorAll("li")].find((item) => item.dataset.id === id) || null;
}

function createId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function saveTodos() {
  const todos = getAllTodos();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  applyFilter();
  if (currentView === "calendar") {
    renderCalendar();
    renderDayDetail();
  }
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const todos = JSON.parse(raw);
    if (!Array.isArray(todos)) return;

    todos.forEach((todo) => {
      if (!todo || typeof todo.text !== "string") return;
      if (!todo.id) todo.id = createId();
      list.appendChild(createTodoItem(todo));
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function createTodoItem(todo, options = {}) {
  const { mirrorOf = null } = options;
  const target = mirrorOf;
  const item = document.createElement("li");
  item.dataset.id = todo.id || createId();
  item.dataset.categoryId = todo.categoryId || "";
  item.dataset.categoryName = todo.categoryName || "";
  item.dataset.categoryColor = todo.categoryColor || "";
  item.dataset.date = todo.date || "";
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
  appendTodoMeta(meta, todo);

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
    openTaskModal(target || item);
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
    openFocusMode(todoFromItem(target || item));
  });

  checkbox.addEventListener("change", () => {
    textSpan.classList.toggle("completed", checkbox.checked);
    if (target) {
      const sourceCheck = target.querySelector(".todo-check");
      sourceCheck.checked = checkbox.checked;
      target.querySelector(".todo-text").classList.toggle("completed", checkbox.checked);
    }
    saveTodos();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.setAttribute("aria-label", "Sil");
  deleteBtn.title = "Sil";
  deleteBtn.innerHTML = deleteIcon;
  deleteBtn.addEventListener("click", () => {
    if (target) {
      target.remove();
    } else {
      item.remove();
    }
    saveTodos();
  });

  item.append(checkbox, body, editBtn, startBtn, deleteBtn);
  return item;
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  calMonthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const todayKey = toDateKey(new Date());
  const todosByDate = {};

  getAllTodos().forEach((todo) => {
    if (!todo.date) return;
    if (!todosByDate[todo.date]) todosByDate[todo.date] = [];
    todosByDate[todo.date].push(todo);
  });

  calendarGrid.innerHTML = "";
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    let cellDate;
    let outside = false;

    if (dayNum < 1) {
      cellDate = new Date(year, month - 1, daysInPrev + dayNum);
      outside = true;
    } else if (dayNum > daysInMonth) {
      cellDate = new Date(year, month + 1, dayNum - daysInMonth);
      outside = true;
    } else {
      cellDate = new Date(year, month, dayNum);
    }

    const key = toDateKey(cellDate);
    const dayTodos = todosByDate[key] || [];

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cal-day";
    if (outside) button.classList.add("outside");
    if (key === todayKey) button.classList.add("today");
    if (key === selectedDay) button.classList.add("selected");

    const num = document.createElement("span");
    num.className = "cal-day-num";
    num.textContent = String(cellDate.getDate());

    button.appendChild(num);

    if (dayTodos.length) {
      const sorted = [...dayTodos].sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });

      const events = document.createElement("div");
      events.className = "cal-events";

      const visible = sorted.slice(0, 3);
      visible.forEach((todo) => {
        const event = document.createElement("span");
        event.className = "cal-event";
        event.textContent = todo.time ? `${todo.time} ${todo.text}` : todo.text;
        if (todo.categoryColor) {
          event.style.borderLeftColor = todo.categoryColor;
          event.style.background = hexToRgba(todo.categoryColor, 0.18);
        }
        if (todo.completed) event.style.textDecoration = "line-through";
        events.appendChild(event);
      });

      if (sorted.length > 3) {
        const more = document.createElement("span");
        more.className = "cal-event more";
        more.textContent = `+${sorted.length - 3} daha`;
        events.appendChild(more);
      }

      button.appendChild(events);
    }

    button.addEventListener("click", () => {
      selectedDay = key;
      if (outside) {
        calendarCursor = startOfMonth(cellDate);
      }
      renderCalendar();
      renderDayDetail();
    });

    calendarGrid.appendChild(button);
  }
}

function renderDayDetail() {
  selectedDayLabel.textContent = formatDateLabel(selectedDay);
  dayTodoList.innerHTML = "";

  const dayTodos = getAllTodos()
    .filter((todo) => todo.date === selectedDay)
    .sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

  dayTodos.forEach((todo) => {
    const sourceItem = findTodoItemById(todo.id);
    if (!sourceItem) return;

    const item = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = Boolean(todo.completed);

    const body = document.createElement("div");
    body.className = "todo-body";

    const textSpan = document.createElement("span");
    textSpan.className = "todo-text" + (todo.completed ? " completed" : "");
    textSpan.textContent = todo.text;

    const meta = document.createElement("div");
    meta.className = "todo-meta";
    appendTodoMeta(meta, { ...todo, date: "" });

    body.append(textSpan, meta);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.setAttribute("aria-label", "Düzenle");
    editBtn.title = "Düzenle";
    editBtn.innerHTML = editIcon;

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "start-btn";
    startBtn.setAttribute("aria-label", "Başlat");
    startBtn.title = "Başlat";
    startBtn.innerHTML = startIcon;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Sil");
    deleteBtn.title = "Sil";
    deleteBtn.innerHTML = deleteIcon;

    checkbox.addEventListener("change", () => {
      const sourceCheck = sourceItem.querySelector(".todo-check");
      sourceCheck.checked = checkbox.checked;
      sourceItem.querySelector(".todo-text").classList.toggle("completed", checkbox.checked);
      textSpan.classList.toggle("completed", checkbox.checked);
      saveTodos();
    });

    editBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openTaskModal(sourceItem);
    });

    startBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openFocusMode(todoFromItem(sourceItem));
    });

    deleteBtn.addEventListener("click", () => {
      sourceItem.remove();
      saveTodos();
    });

    item.append(checkbox, body, editBtn, startBtn, deleteBtn);
    dayTodoList.appendChild(item);
  });

  dayTodoCount.textContent = dayTodos.length
    ? `Bu günde ${dayTodos.length} görev`
    : "Bu günde görev yok";
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

function buildTodoFromForm(completed = false, id = "") {
  const selected = categories.find((category) => category.id === selectedTaskCategory);
  return {
    id: id || createId(),
    text: input.value.trim(),
    completed,
    categoryId: selected ? selected.id : "",
    categoryName: selected ? selected.name : "",
    categoryColor: selected ? selected.color : "",
    date: selectedDate || "",
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
    const updated = buildTodoFromForm(
      editingItem.querySelector(".todo-check").checked,
      editingItem.dataset.id
    );
    editingItem.replaceWith(createTodoItem(updated));
  } else {
    list.appendChild(createTodoItem(buildTodoFromForm(false)));
  }

  saveTodos();
  input.value = "";
  closeTaskModal();
});

input.addEventListener("input", hideFormError);

dateInput.addEventListener("change", () => {
  selectedDate = dateInput.value || "";
  renderDatePicker();
});

clearDateBtn.addEventListener("click", () => {
  selectedDate = "";
  renderDatePicker();
});

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

navTasks.addEventListener("click", () => setView("tasks"));
navCalendar.addEventListener("click", () => setView("calendar"));

calPrevBtn.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  renderCalendar();
});

calNextBtn.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  renderCalendar();
});

calTodayBtn.addEventListener("click", () => {
  const today = new Date();
  calendarCursor = startOfMonth(today);
  selectedDay = toDateKey(today);
  renderCalendar();
  renderDayDetail();
});

openTaskModalBtn.addEventListener("click", () => openTaskModal());
openTaskFromCalendarBtn.addEventListener("click", () => openTaskModal(null, selectedDay));
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
renderDatePicker();
renderDurationChips();
renderImportanceChips();
setView("tasks");

durationHoursInput.addEventListener("input", applyCustomDuration);
durationMinutesInput.addEventListener("input", applyCustomDuration);

hourUpBtn.addEventListener("click", () => changeHour(1));
hourDownBtn.addEventListener("click", () => changeHour(-1));
minuteUpBtn.addEventListener("click", () => changeMinute(5));
minuteDownBtn.addEventListener("click", () => changeMinute(-5));
clearTimeBtn.addEventListener("click", () => {
  selectedHour = null;
  selectedMinute = 0;
  renderClock();
});

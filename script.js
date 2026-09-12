const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const clearAllBtn = document.getElementById("clear-all");
const formError = document.getElementById("form-error");
const STORAGE_KEY = "todo-list";

const editIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
`;

const deleteIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M19 6l-1 14H6L5 6"/>
  </svg>
`;

function saveTodos() {
  const todos = [...list.querySelectorAll("li")].map((item) => {
    const checkbox = item.querySelector(".todo-check");
    const textSpan = item.querySelector(".todo-text");
    return {
      text: textSpan.textContent,
      completed: checkbox.checked,
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const todos = JSON.parse(raw);
    if (!Array.isArray(todos)) return;

    todos.forEach((todo) => {
      if (!todo || typeof todo.text !== "string") return;
      list.appendChild(createTodoItem(todo.text, Boolean(todo.completed)));
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function createTodoItem(text, completed = false) {
  const item = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-check";
  checkbox.checked = completed;

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = text;
  if (completed) textSpan.classList.add("completed");

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.setAttribute("aria-label", "Düzenle");
  editBtn.title = "Düzenle";
  editBtn.innerHTML = editIcon;

  checkbox.addEventListener("change", () => {
    textSpan.classList.toggle("completed", checkbox.checked);
    saveTodos();
  });

  editBtn.addEventListener("click", () => {
    const current = textSpan.textContent;
    const next = prompt("Metni düzenle:", current);
    if (next === null) return;

    const trimmed = next.trim();
    if (!trimmed) return;

    textSpan.textContent = trimmed;
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

  item.append(checkbox, textSpan, editBtn, deleteBtn);
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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    showFormError();
    return;
  }

  hideFormError();
  list.appendChild(createTodoItem(text));
  saveTodos();

  input.value = "";
  input.focus();
});

input.addEventListener("input", hideFormError);

clearAllBtn.addEventListener("click", () => {
  list.innerHTML = "";
  saveTodos();
});

loadTodos();

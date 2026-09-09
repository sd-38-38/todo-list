const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const clearAllBtn = document.getElementById("clear-all");

const editIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
`;

function createTodoItem(text) {
  const item = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-check";

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = text;

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.setAttribute("aria-label", "Düzenle");
  editBtn.title = "Düzenle";
  editBtn.innerHTML = editIcon;

  checkbox.addEventListener("change", () => {
    textSpan.classList.toggle("completed", checkbox.checked);
  });

  editBtn.addEventListener("click", () => {
    const current = textSpan.textContent;
    const next = prompt("Metni düzenle:", current);
    if (next === null) return;

    const trimmed = next.trim();
    if (!trimmed) return;

    textSpan.textContent = trimmed;
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Sil";

  deleteBtn.addEventListener("click", () => {
    item.remove();
  });

  item.append(checkbox, textSpan, editBtn, deleteBtn);
  return item;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  list.appendChild(createTodoItem(text));

  input.value = "";
  input.focus();
});

clearAllBtn.addEventListener("click", () => {
  list.innerHTML = "";
});

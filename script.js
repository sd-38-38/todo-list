const form = document.getElementById("add-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const item = document.createElement("li");
  item.textContent = text;
  list.appendChild(item);

  input.value = "";
  input.focus();
});

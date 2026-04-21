const API = "https://taskswap-2dw6.onrender.com";

let user = localStorage.getItem("user");

/* ================= AUTH ================= */
async function register() {
  await fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  alert("Registered");
}

async function login() {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (data.error) return alert(data.error);

  localStorage.setItem("user", data.username);

  window.location.href = "dashboard.html";
}

/* ================= USER ================= */
async function loadUser() {
  if (!user) return;

  const res = await fetch(API + "/user/" + user);
  const data = await res.json();

  document.getElementById("credits").innerText = data.credits;
}

/* ================= TASKS ================= */
async function loadTasks() {
  const res = await fetch(API + "/tasks");
  const tasks = await res.json();

  const div = document.getElementById("tasks");
  if (!div) return;

  div.innerHTML = "";

  tasks.forEach(t => {
    div.innerHTML += `
      <p>${t.platform} - ${t.link}
      <button onclick="window.open('${t.link}')">Start</button></p>
    `;
  });
}

/* ================= CREATE TASK ================= */
async function createTask() {
  await fetch(API + "/tasks", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      link: link.value,
      platform: platform.value,
      username: user
    })
  });

  loadUser();
  loadTasks();
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/* ================= INIT ================= */
loadUser();
loadTasks();
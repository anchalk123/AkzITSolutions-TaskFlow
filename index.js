let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = 'all';
let isDark = localStorage.getItem("darkMode") === "true";
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let editingIndex = null;

if (isDark) {
    document.body.classList.add('dark');
    document.getElementById('theme-icon').classList.replace('fa-moon', 'fa-sun');
}

function toggleDarkMode() {
    isDark = !isDark;
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem("darkMode", isDark);

    const icon = document.getElementById('theme-icon');
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
}

function showLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

window.onclick = function (event) {
    if (event.target.id === "loginModal") {
        document.getElementById("loginModal").style.display = "none";
    }
};

function login() {
    const username = document.getElementById("loginUsername").value.trim();
    if (username) {
        currentUser = { name: username };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateProfile();
        document.getElementById("loginModal").style.display = "none";
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    updateProfile();
}

function updateProfile() {
    const nameEl = document.getElementById("usernameDisplay");
    const btn = document.getElementById("loginBtn");
    if (currentUser) {
        nameEl.textContent = currentUser.name;
        btn.textContent = "Logout";
        btn.onclick = logout;
    } else {
        nameEl.textContent = "Guest User";
        btn.textContent = "Login / Sign Up";
        btn.onclick = showLoginModal;
    }
}

function addTask() {
    const text = document.getElementById("taskinput").value.trim();
    if (!text) {
        alert("Please enter a task!");
        return;
    }

    const today = new Date().toLocaleDateString('en-GB');
    let due = "No Due Date";
    const dateVal = document.getElementById("taskDueDate").value;
    if (dateVal) {
        const d = dateVal.split('-');
        due = `${d[2]}/${d[1]}/${d[0]}`;
    }

    const newTask = {
        text: text,
        completed: false,
        category: document.getElementById("taskCategory").value,
        priority: document.getElementById("taskPriority").value,
        dueDate: due,
        createdDate: today
    };

    if (editingIndex !== null) {
        tasks[editingIndex] = { ...tasks[editingIndex], ...newTask };
        document.querySelector(".input-row button").textContent = "Add Task";
        editingIndex = null;
    } else {
        tasks.push(newTask);
    }

    document.getElementById("taskinput").value = "";
    document.getElementById("taskDueDate").value = "";

    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateDashboard();

    const msg = document.createElement("div");
    msg.textContent = editingIndex !== null ? "✅ Task Updated!" : "✅ Task Added!";
    msg.style.cssText = "position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:12px;z-index:9999;";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

function renderTasks() {
    const taskList = document.getElementById("tasklist");
    const searchTerm = document.getElementById("searchtask").value.toLowerCase().trim();
    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        const matches = task.text.toLowerCase().includes(searchTerm);
        if (currentFilter === 'complete') return task.completed && matches;
        if (currentFilter === 'pending') return !task.completed && matches;
        return matches;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<div style="text-align:center;padding:60px;color:#64748b;">
            <i class="fa-regular fa-folder-open" style="font-size:45px;margin-bottom:12px;"></i>
            <p>No tasks found</p>
        </div>`;
        updateDashboard();
        return;
    }

    filteredTasks.forEach(task => {
        const index = tasks.indexOf(task);
        let emoji = task.category === "Personal" ? "🏠" : task.category === "Shopping" ? "🛒" : "💼";

        taskList.innerHTML += `
        <div class="task ${task.completed ? 'completed' : ''}">
            <div class="task-content-area">
                <div class="task-title">${task.text}</div>
                <div class="task-meta">
                    <span class="meta-item">${emoji} ${task.category}</span>
                    <span class="meta-item">⚡ ${task.priority}</span>
                    <span class="meta-item"><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>
                </div>
            </div>
            <div class="action-container">
                <button class="done-btn" onclick="toggleTask(${index})" title="${task.completed ? 'Mark as Pending' : 'Mark as Completed'}">
                    <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                </button>
                <button onclick="editTask(${index})" style="background:#3b82f6;color:white;" title="Edit Task">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="trash-btn" onclick="deleteTask(${index})" title="Delete Task">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    });

    updateDashboard();
}

function editTask(index) {
    const task = tasks[index];
    editingIndex = index;

    document.getElementById("taskinput").value = task.text;
    document.getElementById("taskCategory").value = task.category;
    document.getElementById("taskPriority").value = task.priority;

    if (task.dueDate !== "No Due Date") {
        const parts = task.dueDate.split('/');
        document.getElementById("taskDueDate").value = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    document.getElementById("title").textContent = "Edit Task";
    document.querySelector(".input-row button").textContent = "Update Task";

    document.querySelector(".taskenter").scrollIntoView({ behavior: "smooth" });
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(index) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks.splice(index, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }
}

function updateDashboard() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    document.getElementById("fulltask").textContent = total;
    document.getElementById("completetask").textContent = done;
    document.getElementById("pendingtask").textContent = total - done;
}

function showDashboard() {
    currentFilter = 'all';
    document.getElementById("title").textContent = "Dashboard";
    document.getElementById("statsContainer").style.display = "grid";
    document.getElementById("creationFormPanel").style.display = "block";
    setActiveLink(1);
    renderTasks();
    resetForm();
}

function showAllTasks() {
    currentFilter = 'all';
    document.getElementById("title").textContent = "All Tasks";
    document.getElementById("statsContainer").style.display = "none";
    document.getElementById("creationFormPanel").style.display = "none";
    setActiveLink(2);
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    document.getElementById("statsContainer").style.display = "none";
    document.getElementById("creationFormPanel").style.display = "none";

    if (filter === 'complete') {
        document.getElementById("title").textContent = "Completed Tasks";
        setActiveLink(3);
    } else if (filter === 'pending') {
        document.getElementById("title").textContent = "Pending Tasks";
        setActiveLink(4);
    }
    renderTasks();
}

function setActiveLink(n) {
    document.querySelectorAll('.slide li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.slide li:nth-child(${n})`);
    if (activeLi) activeLi.classList.add('active');
}

function resetForm() {
    editingIndex = null;
    document.querySelector(".input-row button").textContent = "Add Task";
    document.getElementById("title").textContent = "Dashboard";
}
updateProfile();
showDashboard();
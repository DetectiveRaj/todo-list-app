// Get DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const remainingTasksSpan = document.getElementById('remainingTasks');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const closeModal = document.querySelector('.close-modal');

// Local Storage key
const STORAGE_KEY = 'todoListData';
let currentFilter = 'all';
let todos = [];
let editingId = null;

// Initialize app
function init() {
    loadFromLocalStorage();
    renderTodos();
    attachEventListeners();
}

// Load data from Local Storage
function loadFromLocalStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    todos = storedData ? JSON.parse(storedData) : [];
}

// Save data to Local Storage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Add todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.unshift(todo);
    saveToLocalStorage();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}

// Delete todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
    }
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
    }
}

// Open edit modal
function openEditModal(id) {
    editingId = id;
    const todo = todos.find(t => t.id === id);
    if (todo) {
        editInput.value = todo.text;
        editModal.style.display = 'block';
        editInput.focus();
        editInput.select();
    }
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    editingId = null;
    editInput.value = '';
}

// Save edited todo
function saveEditedTodo() {
    const newText = editInput.value.trim();
    
    if (newText === '') {
        alert('Task cannot be empty!');
        return;
    }

    const todo = todos.find(t => t.id === editingId);
    if (todo) {
        todo.text = newText;
        saveToLocalStorage();
        renderTodos();
        closeEditModal();
    }
}

// Clear completed todos
function clearCompleted() {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
        todos = todos.filter(todo => !todo.completed);
        saveToLocalStorage();
        renderTodos();
    }
}

// Clear all todos
function clearAll() {
    if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
        todos = [];
        saveToLocalStorage();
        renderTodos();
    }
}

// Set filter
function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.filter-btn').classList.add('active');
    renderTodos();
}

// Filter todos based on current filter
function getFilteredTodos() {
    switch (currentFilter) {
        case 'completed':
            return todos.filter(todo => todo.completed);
        case 'active':
            return todos.filter(todo => !todo.completed);
        default:
            return todos;
    }
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const remaining = total - completed;

    totalTasksSpan.textContent = total;
    completedTasksSpan.textContent = completed;
    remainingTasksSpan.textContent = remaining;
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                />
                <div class="todo-content">
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <div class="todo-date">Added: ${todo.createdAt}</div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" onclick="openEditModal(${todo.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    updateStats();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Attach event listeners
function attachEventListeners() {
    // Add button
    addBtn.addEventListener('click', addTodo);

    // Enter key on input
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', setFilter);
    });

    // Clear buttons
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);

    // Modal controls
    cancelBtn.addEventListener('click', closeEditModal);
    saveBtn.addEventListener('click', saveEditedTodo);
    closeModal.addEventListener('click', closeEditModal);

    // Edit input - save on Enter, cancel on Escape
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEditedTodo();
        }
    });

    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
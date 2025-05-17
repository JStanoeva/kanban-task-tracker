let taskIdCounter = 4; // Start counter after initial tasks
const storageKey = 'kanbanTasks';

// --- Task Adding ---
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const newTaskInput = document.getElementById('newTaskInput');
const errorMsg = document.getElementById('errorMsg');
const liveRegion = document.getElementById('liveRegion');
const todoColumn = document.getElementById('todo').querySelector('.space-y-3'); // Task list container

taskForm.addEventListener('submit', addTask);

function addTask(e) {
    e.preventDefault();
    const taskText = newTaskInput.value.trim();
    if (taskText === '') {
        errorMsg.classList.remove('hidden');
        return;
    }
    errorMsg.classList.add('hidden');

    const newTask = createTaskElement(`task-${taskIdCounter++}`, taskText);
    todoColumn.appendChild(newTask); // Add to the 'To Do' column's task container
    newTask.classList.add('task-moving');
    setTimeout(() => newTask.classList.remove('task-moving'), 300);

    liveRegion.textContent = `Added task: ${taskText}`;
    newTaskInput.value = '';
    saveTasks();
}

function createTaskElement(id, text) {
    const li = document.createElement('li');
    li.id = id;
    li.className = 'task-card p-3 shadow flex justify-between items-center';
    li.draggable = true;
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-grabbed', 'false');

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = text;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn text-red-600 ml-2';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
}


// --- Drag and Drop Functionality ---
function allowDrop(ev) {
    ev.preventDefault(); // Necessary to allow dropping
    ev.currentTarget.classList.add('drag-over'); // Add visual feedback
}

function dragLeave(ev) {
     ev.currentTarget.classList.remove('drag-over'); // Remove visual feedback
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id); // Store the id of the dragged element
    ev.target.classList.add('dragging'); // Add class for visual feedback during drag
    ev.target.setAttribute('aria-grabbed', 'true');
    // Use setTimeout to allow the browser to render the 'dragging' state before hiding
    setTimeout(() => {
         // Optional: hide the original element smoothly if desired, but opacity handles it well
         // ev.target.style.visibility = 'hidden';
    }, 0);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(data);
    const dropTargetColumn = ev.currentTarget; // The column div
    const dropTargetTasksContainer = dropTargetColumn.querySelector('.space-y-3');

    // Ensure we are dropping onto a valid column and not onto a task card itself directly
    if (dropTargetColumn.classList.contains('kanban-column') && draggedElement) {
        // Remove drag-over styling
        dropTargetColumn.classList.remove('drag-over');

        // Check if the task is being moved *to* the 'Done' column
        const isMovingToDone = dropTargetColumn.id === 'done' && draggedElement.closest('section').id !== 'done';

        // Append the dragged element to the tasks container within the target column
        dropTargetTasksContainer.appendChild(draggedElement);
        draggedElement.classList.add('task-moving');
        setTimeout(() => draggedElement.classList.remove('task-moving'), 300);

        // Trigger confetti if moved to 'Done'
        if (isMovingToDone) {
            triggerConfetti();
        }
        liveRegion.textContent = `Moved task to ${dropTargetColumn.id}`;
        saveTasks();
    }

     // Clean up dragging class regardless of where it was dropped
     if(draggedElement) {
        draggedElement.classList.remove('dragging');
        // Make sure the element is visible again if it was hidden
        // draggedElement.style.visibility = 'visible';
     }
}

 // Add event listener to the document to clean up if drag ends outside a valid drop zone
document.addEventListener('dragend', (ev) => {
    const draggedElement = document.querySelector('.dragging');
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement.setAttribute('aria-grabbed', 'false');
        // draggedElement.style.visibility = 'visible'; // Ensure visibility
    }
    // Remove any lingering drag-over styles
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
 });


// --- Confetti ---
function triggerConfetti() {
    console.log("Confetti time!"); // Debug log
    confetti({
        particleCount: 150, // More confetti!
        spread: 90,         // Wider spread
        origin: { y: 0.6 }, // Start slightly lower
        colors: ['#a855f7', '#ec4899', '#fde047', '#ffffff', '#B76E79'] // Purple, Pink, Yellow, White, Rose Gold!
    });
}

// --- Initial Setup ---
function attachColumnEvents() {
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.addEventListener('dragover', allowDrop);
        column.addEventListener('drop', drop);
        column.addEventListener('dragleave', dragLeave);
        column.querySelector('.space-y-3').addEventListener('dragstart', e => {
            if (e.target.classList.contains('task-card')) {
                drag(e);
            }
        });
    });
}

function loadTasks() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return false;
    const board = JSON.parse(saved);
    Object.keys(board).forEach(columnId => {
        const container = document.querySelector(`#${columnId} .space-y-3`);
        container.innerHTML = '';
        board[columnId].forEach(task => {
            const li = createTaskElement(task.id, task.text);
            container.appendChild(li);
            const num = parseInt(task.id.split('-')[1]);
            if (num >= taskIdCounter) taskIdCounter = num + 1;
        });
    });
}

function saveTasks() {
    const board = { todo: [], inprogress: [], done: [] };
    document.querySelectorAll('.kanban-column').forEach(section => {
        const columnId = section.id;
        section.querySelectorAll('.task-card').forEach(li => {
            const text = li.querySelector('.task-text').textContent;
            board[columnId].push({ id: li.id, text });
        });
    });
    localStorage.setItem(storageKey, JSON.stringify(board));
}

attachColumnEvents();
if (!loadTasks()) {
    saveTasks();
}


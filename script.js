let taskIdCounter = 4; // Start counter after initial tasks

// --- Task Adding ---
const addTaskBtn = document.getElementById('addTaskBtn');
const newTaskInput = document.getElementById('newTaskInput');
const todoColumn = document.getElementById('todo').querySelector('.space-y-3'); // Target the task container div

addTaskBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') {
        alert('Please enter a task description!'); // Simple validation
        return;
    }

    const newTask = document.createElement('div');
    newTask.id = `task-${taskIdCounter++}`;
    newTask.className = 'task-card p-3 shadow';
    newTask.draggable = true;
    newTask.textContent = taskText;
    newTask.addEventListener('dragstart', drag);

    todoColumn.appendChild(newTask); // Add to the 'To Do' column's task container
    newTaskInput.value = ''; // Clear input field
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
    const dropTargetTasksContainer = dropTargetColumn.querySelector('.space-y-3'); // The div holding tasks

    // Ensure we are dropping onto a valid column and not onto a task card itself directly
    if (dropTargetColumn.classList.contains('kanban-column') && draggedElement) {
        // Remove drag-over styling
        dropTargetColumn.classList.remove('drag-over');

        // Check if the task is being moved *to* the 'Done' column
        const isMovingToDone = dropTargetColumn.id === 'done' && draggedElement.parentElement.parentElement.id !== 'done';

        // Append the dragged element to the tasks container within the target column
        dropTargetTasksContainer.appendChild(draggedElement);

        // Trigger confetti if moved to 'Done'
        if (isMovingToDone) {
            triggerConfetti();
        }
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
// Add dragstart listeners to initially loaded tasks
document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', drag);
});


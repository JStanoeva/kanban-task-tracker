(function() {
    let taskIdCounter = 4; // Start counter after initial tasks
    let tasks = [];

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const newTaskInput = document.getElementById('newTaskInput');
        const errorDisplay = document.getElementById('validationError');
        const todoColumn = document.getElementById('todo').querySelector('.space-y-3');

        addTaskBtn.addEventListener('click', addTask);
        newTaskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        document.querySelectorAll('.kanban-column').forEach(col => {
            col.addEventListener('dragover', allowDrop);
            col.addEventListener('drop', drop);
            col.addEventListener('dragleave', dragLeave);
        });

        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', drag);
        });

        loadTasks();

        function addTask() {
            const taskText = newTaskInput.value.trim();
            if (taskText === '') {
                errorDisplay.textContent = 'Please enter a task description!';
                errorDisplay.classList.remove('hidden');
                return;
            }
            errorDisplay.classList.add('hidden');

            const id = `task-${taskIdCounter++}`;
            createTaskElement(id, taskText, 'todo');
            tasks.push({ id, text: taskText, column: 'todo' });
            saveTasks();
            newTaskInput.value = '';
        }

        function allowDrop(ev) {
            ev.preventDefault();
            ev.currentTarget.classList.add('drag-over');
        }

        function dragLeave(ev) {
            ev.currentTarget.classList.remove('drag-over');
        }

        function drag(ev) {
            ev.dataTransfer.setData('text/plain', ev.target.id);
            ev.target.classList.add('dragging');
            setTimeout(() => {}, 0);
        }

        function drop(ev) {
            ev.preventDefault();
            const data = ev.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(data);
            const dropTargetColumn = ev.currentTarget;
            const dropTargetTasksContainer = dropTargetColumn.querySelector('.space-y-3');

            if (dropTargetColumn.classList.contains('kanban-column') && draggedElement) {
                dropTargetColumn.classList.remove('drag-over');
                dropTargetTasksContainer.appendChild(draggedElement);

                const taskObj = tasks.find(t => t.id === draggedElement.id);
                const wasDone = taskObj && taskObj.column === 'done';
                if (taskObj) {
                    taskObj.column = dropTargetColumn.id;
                    saveTasks();
                }
                if (!wasDone && dropTargetColumn.id === 'done') {
                    triggerConfetti();
                }
            }

            if (draggedElement) {
                draggedElement.classList.remove('dragging');
            }
        }

        document.addEventListener('dragend', () => {
            const draggedElement = document.querySelector('.dragging');
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
            }
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        function triggerConfetti() {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#fde047', '#ffffff', '#B76E79']
            });
        }

        function createTaskElement(id, text, columnId) {
            const newTask = document.createElement('div');
            newTask.id = id;
            newTask.className = 'task-card p-3 shadow';
            newTask.draggable = true;
            newTask.textContent = text;
            newTask.addEventListener('dragstart', drag);
            document.getElementById(columnId).querySelector('.space-y-3').appendChild(newTask);
        }

        function loadTasks() {
            const stored = localStorage.getItem('tasks');
            if (stored) {
                tasks = JSON.parse(stored);
                document.querySelectorAll('.kanban-column .space-y-3').forEach(col => col.innerHTML = '');
                tasks.forEach(t => createTaskElement(t.id, t.text, t.column));
                const maxId = tasks.reduce((m, t) => {
                    const n = parseInt(t.id.split('-')[1], 10);
                    return n > m ? n : m;
                }, 3);
                taskIdCounter = maxId + 1;
            } else {
                document.querySelectorAll('.task-card').forEach(card => {
                    const col = card.closest('.kanban-column').id;
                    tasks.push({ id: card.id, text: card.textContent.trim(), column: col });
                });
            }
        }

        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }
})();

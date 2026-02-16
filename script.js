document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State & Elements
    let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
    const tasksContainer = document.getElementById('tasksContainer');
    const percentageText = document.querySelector('.percentage');
    const progressCircle = document.querySelector('.progress-circle .fg');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const searchInput = document.getElementById('searchInput');

    // 2. Setup Background Gradient
    const setupSVGGradient = () => {
        const svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgLayer.setAttribute('style', 'width:0;height:0;position:absolute;');
        svgLayer.innerHTML = `
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                </linearGradient>
            </defs>
        `;
        document.body.appendChild(svgLayer);
    };
    setupSVGGradient();

    // 3. Render Function
    const renderTasks = (filteredTasks = tasks) => {
        tasksContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>هنوز کاری ثبت نشده است.</p>
                </div>
            `;
            updateProgress();
            return;
        }

        filteredTasks.forEach((task, index) => {
            const card = document.createElement('div');
            card.className = `task-card ${task.checked ? 'checked' : ''}`;

            // Replicating stylized cards from the image logic
            if (task.checked) card.classList.add('blue-border');
            if (task.category === 'کار' && !task.checked) card.classList.add('blue-theme');

            card.innerHTML = `
                <div class="task-info">
                    <h3>${task.title}</h3>
                    <p>${task.date}</p>
                </div>
                <div class="task-actions">
                    <i class="fas fa-trash-alt btn-delete" data-index="${index}"></i>
                    <div class="custom-checkbox">
                        <input type="checkbox" ${task.checked ? 'checked' : ''} data-index="${index}">
                        <span class="checkmark"></span>
                    </div>
                </div>
            `;
            tasksContainer.appendChild(card);
        });

        updateProgress();
        attachEventListeners();
    };

    const updateProgress = () => {
        const total = tasks.length;
        const checked = tasks.filter(t => t.checked).length;
        const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

        const persianPercent = percent.toLocaleString('fa-IR');
        percentageText.textContent = `${persianPercent}٪`;

        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    };

    const attachEventListeners = () => {
        // Toggle Checked
        document.querySelectorAll('.custom-checkbox input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = e.target.dataset.index;
                tasks[idx].checked = e.target.checked;
                saveAndRender();
            });
        });

        // Delete Task
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                tasks.splice(idx, 1);
                saveAndRender();
            });
        });
    };

    const saveAndRender = () => {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
        renderTasks();
    };

    // 4. Modal Interactions
    addTaskBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
    closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));

    saveTaskBtn.addEventListener('click', () => {
        const title = document.getElementById('newTaskTitle').value;
        const date = document.getElementById('newTaskDate').value;
        const category = document.getElementById('newTaskCategory').value;

        if (!title) return alert('لطفاً عنوان کار را وارد کنید');

        tasks.push({
            title,
            date: date || 'بدون تاریخ',
            category,
            checked: false
        });

        document.getElementById('newTaskTitle').value = '';
        document.getElementById('newTaskDate').value = '';
        modalOverlay.classList.remove('active');
        saveAndRender();
    });

    // 5. Search Logic
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = tasks.filter(t => t.title.toLowerCase().includes(term));
        renderTasks(filtered);
    });

    // 6. Navigation (Category Filtering)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const category = item.querySelector('span').textContent.trim();
            if (category === 'کار' || category === 'شخصی' || category === 'خرید') {
                const filtered = tasks.filter(t => t.category === category);
                renderTasks(filtered);
            } else {
                renderTasks(); // Dashboard or General
            }
        });
    });

    // Initial Load
    renderTasks();
});

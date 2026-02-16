document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State & Elements
    let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
    let currentCategory = 'all';
    let editingIndex = -1;

    const tasksContainer = document.getElementById('tasksContainer');
    const percentageText = document.querySelector('.percentage');
    const progressCircle = document.querySelector('.progress-circle .fg');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const searchInput = document.getElementById('searchInput');

    // Mobile sidebar elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    const openSidebar = () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    };
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

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
    const renderTasks = () => {
        const searchTerm = searchInput.value.toLowerCase();

        let filteredTasks = tasks.map((task, index) => ({ ...task, originalIndex: index }));

        if (currentCategory !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.category === currentCategory);
        }

        if (searchTerm) {
            filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(searchTerm));
        }

        tasksContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            const emptyMessage = currentCategory === 'all'
                ? 'هنوز کاری ثبت نشده است.'
                : `هیچ کاری در دسته «${currentCategory}» وجود ندارد.`;

            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>${searchTerm ? 'نتیجه‌ای یافت نشد.' : emptyMessage}</p>
                </div>
            `;
            updateProgress();
            return;
        }

        filteredTasks.forEach((task) => {
            const card = document.createElement('div');
            card.className = `task-card ${task.checked ? 'checked' : ''}`;

            if (task.checked) card.classList.add('blue-border');
            if (task.category === 'کار' && !task.checked) card.classList.add('blue-theme');

            card.innerHTML = `
                <div class="task-info">
                    <h3>${task.title}</h3>
                    <p>${task.date} <span class="tag gray" style="font-size: 10px; margin-right: 5px;">${task.category}</span></p>
                </div>
                <div class="task-actions">
                    <i class="fas fa-pen btn-edit" data-index="${task.originalIndex}" title="ویرایش"></i>
                    <i class="fas fa-trash-alt btn-delete" data-index="${task.originalIndex}" title="حذف"></i>
                    <div class="custom-checkbox">
                        <input type="checkbox" ${task.checked ? 'checked' : ''} data-index="${task.originalIndex}">
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
        document.querySelectorAll('.custom-checkbox input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = e.target.dataset.index;
                tasks[idx].checked = e.target.checked;
                saveAndRender();
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                if (confirm('آیا از حذف این کار مطمئن هستید؟')) {
                    tasks.splice(idx, 1);
                    saveAndRender();
                }
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                const task = tasks[idx];

                document.getElementById('newTaskTitle').value = task.title;
                document.getElementById('newTaskDate').value = task.date;
                document.getElementById('newTaskCategory').value = task.category;

                editingIndex = idx;
                document.querySelector('.task-modal h3').textContent = 'ویرایش کار';
                saveTaskBtn.textContent = 'بروزرسانی';

                modalOverlay.classList.add('active');
            });
        });
    };

    const saveAndRender = () => {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
        renderTasks();
    };

    // 4. Modal Interactions
    addTaskBtn.addEventListener('click', () => {
        // Set default category to current filter
        if (currentCategory !== 'all') {
            document.getElementById('newTaskCategory').value = currentCategory;
        }
        modalOverlay.classList.add('active');
    });
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        // Reset modal state
        editingIndex = -1;
        document.querySelector('.task-modal h3').textContent = 'افزودن کار جدید';
        saveTaskBtn.textContent = 'ذخیره';
        document.getElementById('newTaskTitle').value = '';
        document.getElementById('newTaskDate').value = '';
        document.getElementById('newTaskCategory').value = 'کار'; // Reset to default
    });

    saveTaskBtn.addEventListener('click', () => {
        const title = document.getElementById('newTaskTitle').value;
        const date = document.getElementById('newTaskDate').value;
        const category = document.getElementById('newTaskCategory').value;

        if (!title) return alert('لطفاً عنوان کار را وارد کنید');

        if (editingIndex > -1) {
            // Update existing task
            tasks[editingIndex] = { ...tasks[editingIndex], title, date, category };
        } else {
            // Create new task
            tasks.push({
                title,
                date: date || 'بدون تاریخ',
                category,
                checked: false
            });
        }

        document.getElementById('newTaskTitle').value = '';
        document.getElementById('newTaskDate').value = '';
        document.getElementById('newTaskCategory').value = 'کار'; // Reset to default
        modalOverlay.classList.remove('active');

        // Reset modal state
        editingIndex = -1;
        document.querySelector('.task-modal h3').textContent = 'افزودن کار جدید';
        saveTaskBtn.textContent = 'ذخیره';

        saveAndRender();
    });

    // 5. Search Logic (Unified)
    const handleSearch = (e) => {
        const term = e.target.value;
        if (typeof sidebarSearchInput !== 'undefined' && sidebarSearchInput) sidebarSearchInput.value = term;
        if (searchInput.value !== term) searchInput.value = term;
        renderTasks();
    };

    searchInput.addEventListener('input', handleSearch);

    // 6. Navigation (Category Filtering)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const categoryName = item.querySelector('span').textContent.trim();

            if (categoryName === 'کار') currentCategory = 'کار';
            else if (categoryName === 'شخصی') currentCategory = 'شخصی';
            else if (categoryName === 'خرید') currentCategory = 'خرید';
            else if (categoryName === 'عمومی') currentCategory = 'عمومی';
            else currentCategory = 'all';

            renderTasks();

            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    // 7. Sidebar Search Logic
    const sidebarSearchInput = document.getElementById('sidebarSearchInput');
    if (sidebarSearchInput) {
        sidebarSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = tasks.filter(t => t.title.toLowerCase().includes(term));
            renderTasks(filtered);
            // Sync with main search input
            searchInput.value = term;
        });

        // Sync main search with sidebar search
        searchInput.addEventListener('input', (e) => {
            sidebarSearchInput.value = e.target.value;
        });
    }

    // 8. Reset Filters Button ("List" icon)
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            renderTasks(); // Show all tasks
            searchInput.value = '';
            if (sidebarSearchInput) sidebarSearchInput.value = '';

            // Allow user responsiveness feedback
            resetFiltersBtn.classList.add('active');
            setTimeout(() => resetFiltersBtn.classList.remove('active'), 200);

            // Reset active category
            navItems.forEach(i => i.classList.remove('active'));
        });
    }

    // 9. Dynamic Persian Date
    const updateDateDisplay = () => {
        const dateDisplay = document.querySelector('.date-display span');
        if (dateDisplay) {
            const now = new Date();
            const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            const persianDate = now.toLocaleDateString('fa-IR', options);
            dateDisplay.textContent = persianDate;
        }
    };
    updateDateDisplay();

    // Final Progress Call to ensure correct initial state
    updateProgress();

    // Initial Load
    renderTasks();
});

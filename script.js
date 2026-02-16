document.addEventListener('DOMContentLoaded', () => {
    // Add SVG gradient to the DOM for the progress circle
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

    // Sidebar navigation simulation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Checkbox interaction
    const checkBoxes = document.querySelectorAll('.custom-checkbox input');
    checkBoxes.forEach(box => {
        box.addEventListener('change', () => {
            const card = box.closest('.task-card');
            if (box.checked) {
                card.classList.add('checked');
            } else {
                card.classList.remove('checked');
            }
            updateProgress();
        });
    });

    function updateProgress() {
        const total = document.querySelectorAll('.custom-checkbox input').length;
        const checked = document.querySelectorAll('.custom-checkbox input:checked').length;
        const percent = Math.round((checked / total) * 100);
        
        const percentageText = document.querySelector('.percentage');
        const progressCircle = document.querySelector('.progress-circle .fg');
        
        // Convert numbers to Persian
        const persianPercent = percent.toLocaleString('fa-IR');
        percentageText.textContent = `${persianPercent}٪`;
        
        // Update circle dash offset
        const circumference = 2 * Math.PI * 45; // r=45
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }
});

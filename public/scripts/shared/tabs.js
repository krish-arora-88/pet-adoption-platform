// shared/tabs.js — reusable tab component logic
export function initTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const buttons = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.tab;
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetId) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

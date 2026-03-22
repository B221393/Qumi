const STORAGE_KEY = 'qumi-companies';

const DEFAULT_COMPANIES = [
    { id: 1,  name: '日本郵船',         industry: '海運・物流',     status: '未応募', memo: '' },
    { id: 2,  name: 'JR東海',           industry: '鉄道・インフラ', status: '未応募', memo: '' },
    { id: 3,  name: 'NTT西日本',        industry: 'IT・通信',       status: '未応募', memo: '' },
    { id: 4,  name: '三菱重工業',       industry: '重工業・製造',   status: '未応募', memo: '' },
    { id: 5,  name: '川崎重工業',       industry: '重工業・製造',   status: '未応募', memo: '' },
    { id: 6,  name: '商船三井',         industry: '海運・物流',     status: '未応募', memo: '' },
    { id: 7,  name: 'KDDI',             industry: 'IT・通信',       status: '未応募', memo: '' },
    { id: 8,  name: '東京電力',         industry: 'エネルギー',     status: '未応募', memo: '' },
    { id: 9,  name: '中部電力',         industry: 'エネルギー',     status: '未応募', memo: '' },
    { id: 10, name: 'SUBARU',           industry: '自動車・製造',   status: '未応募', memo: '' },
    { id: 11, name: '日本航空 (JAL)',   industry: '航空・物流',     status: '未応募', memo: '' },
    { id: 12, name: '全日本空輸 (ANA)', industry: '航空・物流',     status: '未応募', memo: '' },
];

let companies = [];
let activeCardIndex = null;

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            companies = JSON.parse(stored);
        } catch {
            companies = DEFAULT_COMPANIES.map(c => ({ ...c }));
        }
    } else {
        companies = DEFAULT_COMPANIES.map(c => ({ ...c }));
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

function updateSummary() {
    const counts = { applied: 0, screening: 0, interview: 0, offer: 0 };
    companies.forEach(c => {
        if (c.status === '応募済み')          counts.applied++;
        if (c.status === '書類選考')          counts.screening++;
        if (c.status === '面接' || c.status === '最終面接') counts.interview++;
        if (c.status === '内定')              counts.offer++;
    });
    document.getElementById('count-applied').textContent   = counts.applied;
    document.getElementById('count-screening').textContent = counts.screening;
    document.getElementById('count-interview').textContent = counts.interview;
    document.getElementById('count-offer').textContent     = counts.offer;
}

function renderCompanies() {
    const grid = document.getElementById('companies');
    grid.innerHTML = '';
    companies.forEach((company, index) => {
        const card = document.createElement('div');
        card.className = `company-card status-${company.status}`;
        card.innerHTML = `
            <div class="company-name">${escapeHtml(company.name)}</div>
            <div class="company-industry">${escapeHtml(company.industry)}</div>
            <span class="status-badge ${company.status}">${escapeHtml(company.status)}</span>
            <div class="company-memo">${escapeHtml(company.memo) || '—'}</div>
        `;
        card.addEventListener('click', () => openModal(index));
        grid.appendChild(card);
    });
    updateSummary();
}

const HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch]);
}

function openModal(index) {
    activeCardIndex = index;
    const company = companies[index];
    document.getElementById('modal-company-name').textContent = company.name;
    document.getElementById('modal-status').value = company.status;
    document.getElementById('modal-memo').value = company.memo;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    activeCardIndex = null;
}

function saveModal() {
    if (activeCardIndex === null) return;
    companies[activeCardIndex].status = document.getElementById('modal-status').value;
    companies[activeCardIndex].memo   = document.getElementById('modal-memo').value;
    saveData();
    renderCompanies();
    closeModal();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCompanies();

    document.getElementById('modal-save').addEventListener('click', saveModal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) closeModal();
    });

    console.log('Qumi initialized. Tracking', companies.length, 'companies.');
});

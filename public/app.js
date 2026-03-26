const state = {
  logs: [],
  selectedId: null
};

const healthStatus = document.getElementById('healthStatus');
const logsMeta = document.getElementById('logsMeta');
const logsList = document.getElementById('logsList');
const formStatus = document.getElementById('formStatus');
const problemForm = document.getElementById('problemForm');
const submitButton = document.getElementById('submitButton');
const resetButton = document.getElementById('resetButton');
const refreshButton = document.getElementById('refreshButton');
const detailEmpty = document.getElementById('detailEmpty');
const detailCard = document.getElementById('detailCard');

function setFormStatus(message, type = '') {
  formStatus.textContent = message;
  formStatus.className = `status${type ? ` ${type}` : ''}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text, limit = 120) {
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trim()}...`;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || 'Request failed');
  }

  return data;
}

async function loadHealth() {
  try {
    const response = await fetch('/health');
    const data = await readJson(response);
    healthStatus.textContent = data.status === 'ok' ? 'Connected' : 'Unknown';
  } catch (error) {
    healthStatus.textContent = 'Unavailable';
  }
}

function renderDetail(log) {
  if (!log) {
    detailCard.classList.add('hidden');
    detailEmpty.classList.remove('hidden');
    return;
  }

  detailEmpty.classList.add('hidden');
  detailCard.classList.remove('hidden');
  document.getElementById('detailQuestion').textContent = `${log.questionNumber}. ${log.questionName}`;
  document.getElementById('detailSource').textContent = log.source;
  document.getElementById('detailSlug').textContent = log.titleSlug;
  document.getElementById('detailSubmittedFrom').textContent = log.submittedFrom || 'api';
  document.getElementById('detailCreatedAt').textContent = formatDate(log.createdAt);
  document.getElementById('detailId').textContent = log._id;
  document.getElementById('detailApproach').textContent = log.approach;
}

function renderLogs() {
  logsMeta.textContent = `${state.logs.length} log${state.logs.length === 1 ? '' : 's'} loaded`;

  if (!state.logs.length) {
    logsList.innerHTML = '<div class="empty-state">No logs yet. Create your first problem entry from the form.</div>';
    renderDetail(null);
    return;
  }

  if (!state.selectedId) {
    state.selectedId = state.logs[0]._id;
  }

  logsList.innerHTML = state.logs.map((log) => `
    <button class="log-card${log._id === state.selectedId ? ' active' : ''}" data-id="${log._id}" type="button">
      <div class="log-top">
        <p class="log-title">${escapeHtml(log.questionNumber)}. ${escapeHtml(log.questionName)}</p>
        <span class="pill">${escapeHtml(log.source)}</span>
      </div>
      <p class="log-approach">${escapeHtml(truncate(log.approach, 110))}</p>
      <div class="log-meta">
        <span class="eyebrow">${escapeHtml(log.titleSlug)}</span>
        <span class="eyebrow">${escapeHtml(formatDate(log.createdAt))}</span>
      </div>
    </button>
  `).join('');

  const selected = state.logs.find((log) => log._id === state.selectedId) || state.logs[0];
  state.selectedId = selected._id;
  renderDetail(selected);
}

async function fetchLogs(preserveSelection = true) {
  const previousSelection = preserveSelection ? state.selectedId : null;
  const response = await fetch('/api/problems');
  const logs = await readJson(response);
  state.logs = logs;
  state.selectedId = previousSelection && logs.some((log) => log._id === previousSelection)
    ? previousSelection
    : logs[0]?._id || null;
  renderLogs();
}

async function fetchLogDetail(id) {
  const response = await fetch(`/api/problems/${id}`);
  const log = await readJson(response);
  state.selectedId = log._id;
  renderLogs();
  renderDetail(log);
}

async function createProblemLog(event) {
  event.preventDefault();

  const formData = new FormData(problemForm);
  const payload = {
    questionNumber: Number(formData.get('questionNumber')),
    questionName: String(formData.get('questionName')).trim(),
    approach: String(formData.get('approach')).trim()
  };

  submitButton.disabled = true;
  setFormStatus('Saving to MongoDB...');

  try {
    const response = await fetch('/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const created = await readJson(response);
    problemForm.reset();
    setFormStatus(`Saved ${created.questionNumber}. ${created.questionName}`, 'success');
    await fetchLogs(false);
    await fetchLogDetail(created._id);
  } catch (error) {
    setFormStatus(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

logsList.addEventListener('click', async (event) => {
  const card = event.target.closest('[data-id]');
  if (!card) {
    return;
  }

  try {
    await fetchLogDetail(card.dataset.id);
  } catch (error) {
    setFormStatus(error.message, 'error');
  }
});

problemForm.addEventListener('submit', createProblemLog);
resetButton.addEventListener('click', () => {
  problemForm.reset();
  setFormStatus('');
});
refreshButton.addEventListener('click', async () => {
  try {
    await fetchLogs();
    setFormStatus('Logs refreshed', 'success');
  } catch (error) {
    setFormStatus(error.message, 'error');
  }
});

async function boot() {
  await loadHealth();

  try {
    await fetchLogs();
  } catch (error) {
    logsMeta.textContent = 'Failed to load logs';
    logsList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

boot();

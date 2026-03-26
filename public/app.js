const state = {
  logs: [],
  selectedId: null
};

const healthStatus = document.getElementById('healthStatus');
const logsMeta = document.getElementById('logsMeta');
const logsList = document.getElementById('logsList');
const historyList = document.getElementById('historyList');
const formStatus = document.getElementById('formStatus');
const problemForm = document.getElementById('problemForm');
const editingId = document.getElementById('editingId');
const submitButton = document.getElementById('submitButton');
const resetButton = document.getElementById('resetButton');
const deleteButton = document.getElementById('deleteButton');
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
  document.getElementById('detailId').textContent = log.id;
  document.getElementById('detailCreatedAt').textContent = formatDate(log.createdAt);
  document.getElementById('detailUpdatedAt').textContent = formatDate(log.updatedAt);
  document.getElementById('detailApproach').textContent = log.approach;
}

function renderLogs() {
  logsMeta.textContent = `${state.logs.length} log${state.logs.length === 1 ? '' : 's'} loaded`;

  if (!state.logs.length) {
    logsList.innerHTML = '<div class="empty-state">No logs yet. Create your first problem entry from the form.</div>';
    historyList.innerHTML = '<div class="empty-state">No history yet. Save an entry to see the full running log.</div>';
    renderDetail(null);
    return;
  }

  if (!state.selectedId) {
    state.selectedId = state.logs[0].id;
  }

  logsList.innerHTML = state.logs.map((log) => `
    <button class="log-card${log.id === state.selectedId ? ' active' : ''}" data-id="${log.id}" type="button">
      <div class="log-top">
        <p class="log-title">${escapeHtml(log.questionNumber)}. ${escapeHtml(log.questionName)}</p>
        <span class="pill">saved</span>
      </div>
      <p class="log-approach">${escapeHtml(truncate(log.approach, 110))}</p>
      <div class="log-meta">
        <span class="eyebrow">updated ${escapeHtml(formatDate(log.updatedAt))}</span>
        <span class="eyebrow">${escapeHtml(formatDate(log.createdAt))}</span>
      </div>
    </button>
  `).join('');

  const selected = state.logs.find((log) => log.id === state.selectedId) || state.logs[0];
  state.selectedId = selected.id;
  renderDetail(selected);

  historyList.innerHTML = state.logs.map((log) => `
    <article class="history-item">
      <div class="history-head">
        <h3 class="history-title">${escapeHtml(log.questionNumber)}. ${escapeHtml(log.questionName)}</h3>
        <span class="pill">logged</span>
      </div>
      <div class="history-time">
        <span>Created: ${escapeHtml(formatDate(log.createdAt))}</span>
        <span>Updated: ${escapeHtml(formatDate(log.updatedAt))}</span>
      </div>
      <pre class="history-approach">${escapeHtml(log.approach)}</pre>
    </article>
  `).join('');
}

async function fetchLogs(preserveSelection = true) {
  const previousSelection = preserveSelection ? state.selectedId : null;
  const response = await fetch('/api/problems');
  const logs = await readJson(response);
  state.logs = logs;
  state.selectedId = previousSelection && logs.some((log) => log.id === previousSelection)
    ? previousSelection
    : logs[0]?.id || null;
  renderLogs();
}

async function fetchLogDetail(id) {
  const response = await fetch(`/api/problems/${id}`);
  const log = await readJson(response);
  state.selectedId = log.id;
  renderLogs();
  renderDetail(log);
  editingId.value = log.id;
  problemForm.questionNumber.value = log.questionNumber;
  problemForm.questionName.value = log.questionName;
  problemForm.approach.value = log.approach;
  submitButton.textContent = 'Update entry';
  deleteButton.classList.remove('hidden');
}

function resetForm() {
  problemForm.reset();
  editingId.value = '';
  submitButton.textContent = 'Save entry';
  deleteButton.classList.add('hidden');
}

async function saveProblem(event) {
  event.preventDefault();

  const formData = new FormData(problemForm);
  const payload = {
    questionNumber: Number(formData.get('questionNumber')),
    questionName: String(formData.get('questionName')).trim(),
    approach: String(formData.get('approach')).trim()
  };

  const currentId = editingId.value;
  const url = currentId ? `/api/problems/${currentId}` : '/api/problems';
  const method = currentId ? 'PUT' : 'POST';

  submitButton.disabled = true;
  setFormStatus(currentId ? 'Updating entry...' : 'Saving entry...');

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const saved = await readJson(response);
    resetForm();
    setFormStatus(`${currentId ? 'Updated' : 'Saved'} ${saved.questionNumber}. ${saved.questionName}`, 'success');
    await fetchLogs(false);
    await fetchLogDetail(saved.id);
  } catch (error) {
    setFormStatus(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteProblem() {
  if (!editingId.value) {
    return;
  }

  deleteButton.disabled = true;
  setFormStatus('Deleting entry...');

  try {
    const response = await fetch(`/api/problems/${editingId.value}`, {
      method: 'DELETE'
    });
    await readJson(response);
    resetForm();
    state.selectedId = null;
    await fetchLogs(false);
    setFormStatus('Entry deleted', 'success');
  } catch (error) {
    setFormStatus(error.message, 'error');
  } finally {
    deleteButton.disabled = false;
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

problemForm.addEventListener('submit', saveProblem);
resetButton.addEventListener('click', () => {
  resetForm();
  setFormStatus('');
});
deleteButton.addEventListener('click', deleteProblem);
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
  healthStatus.textContent = 'db.json ready';

  try {
    await fetchLogs();
  } catch (error) {
    logsMeta.textContent = 'Failed to load logs';
    logsList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

boot();

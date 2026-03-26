const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'db.json');

async function readStore() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.problems)) {
      return { problems: [] };
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { problems: [] };
    }
    throw error;
  }
}

async function writeStore(store) {
  await fs.writeFile(DB_FILE, JSON.stringify(store, null, 2));
}

function normalizeInput(data) {
  return {
    questionNumber: Number(data.questionNumber),
    questionName: String(data.questionName || '').trim(),
    approach: String(data.approach || '').trim()
  };
}

exports.getStorageMode = () => 'db.json';

exports.listProblems = async () => {
  const store = await readStore();
  return [...store.problems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

exports.getProblemById = async (id) => {
  const store = await readStore();
  return store.problems.find((problem) => problem.id === id) || null;
};

exports.createProblem = async (data) => {
  const store = await readStore();
  const now = new Date().toISOString();
  const newProblem = {
    id: crypto.randomUUID(),
    ...normalizeInput(data),
    createdAt: now,
    updatedAt: now
  };

  store.problems.push(newProblem);
  await writeStore(store);
  return newProblem;
};

exports.updateProblem = async (id, data) => {
  const store = await readStore();
  const index = store.problems.findIndex((problem) => problem.id === id);

  if (index === -1) {
    return null;
  }

  const updatedProblem = {
    ...store.problems[index],
    ...normalizeInput(data),
    updatedAt: new Date().toISOString()
  };

  store.problems[index] = updatedProblem;
  await writeStore(store);
  return updatedProblem;
};

exports.deleteProblem = async (id) => {
  const store = await readStore();
  const index = store.problems.findIndex((problem) => problem.id === id);

  if (index === -1) {
    return false;
  }

  store.problems.splice(index, 1);
  await writeStore(store);
  return true;
};

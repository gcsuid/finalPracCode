const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const ProblemLog = require('../models/ProblemLog');

const DB_FILE = path.join(__dirname, '..', 'db.json');

function normalizeDoc(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    _id: String(plain._id || plain.id),
    questionNumber: plain.questionNumber,
    questionName: plain.questionName,
    titleSlug: plain.titleSlug,
    approach: plain.approach,
    source: plain.source,
    submittedFrom: plain.submittedFrom,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
}

async function readJsonStore() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.logs)) {
      return { logs: [] };
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { logs: [] };
    }
    throw error;
  }
}

async function writeJsonStore(payload) {
  await fs.writeFile(DB_FILE, JSON.stringify(payload, null, 2));
}

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

exports.getStorageMode = () => (isMongoReady() ? 'mongo' : 'json');

exports.createProblemLog = async (data) => {
  if (isMongoReady()) {
    const saved = await ProblemLog.create(data);
    return normalizeDoc(saved);
  }

  const store = await readJsonStore();
  const now = new Date().toISOString();
  const newLog = {
    _id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now
  };
  store.logs.push(newLog);
  await writeJsonStore(store);
  return newLog;
};

exports.listProblemLogs = async () => {
  if (isMongoReady()) {
    const logs = await ProblemLog.find().sort({ createdAt: -1 });
    return logs.map(normalizeDoc);
  }

  const store = await readJsonStore();
  return [...store.logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

exports.getProblemLogById = async (id) => {
  if (isMongoReady()) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const log = await ProblemLog.findById(id);
    return normalizeDoc(log);
  }

  const store = await readJsonStore();
  return store.logs.find((log) => log._id === id) || null;
};

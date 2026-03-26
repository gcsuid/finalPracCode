const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const problemStore = require('./services/problemStore');
const problemMetadataService = require('./services/problemMetadataService');

dotenv.config();

async function promptForProblem() {
  if (!input.isTTY) {
    const piped = fs.readFileSync(0, 'utf8')
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (piped.length < 3) {
      throw new Error('Provide questionNumber, questionName, and approach on separate lines when piping input');
    }

    const questionNumber = Number(piped[0]);
    if (!Number.isInteger(questionNumber) || questionNumber <= 0) {
      throw new Error('questionNumber must be a positive integer');
    }

    return {
      questionNumber,
      questionName: piped[1],
      approach: piped.slice(2).join(' ')
    };
  }

  const rl = readline.createInterface({ input, output });

  try {
    console.log('LeetCode Problem Logger');
    console.log('Type the problem info and it will be inserted into MongoDB.');
    console.log('');

    const questionNumberRaw = await rl.question('Question number: ');
    const questionName = await rl.question('Question name: ');
    const approach = await rl.question('Your approach: ');

    const questionNumber = Number(questionNumberRaw.trim());
    if (!Number.isInteger(questionNumber) || questionNumber <= 0) {
      throw new Error('questionNumber must be a positive integer');
    }

    if (!questionName.trim() || !approach.trim()) {
      throw new Error('questionName and approach are required');
    }

    return {
      questionNumber,
      questionName: questionName.trim(),
      approach: approach.trim()
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('MONGO_URI is missing. Using db.json storage.');
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB Connected');
    } catch (error) {
      console.log('MongoDB unavailable. Using db.json storage.');
    }
  }

  try {
    const inputData = await promptForProblem();
    const validated = await problemMetadataService.validateProblem({
      questionNumber: inputData.questionNumber,
      questionName: inputData.questionName
    });

    const savedLog = await problemStore.createProblemLog({
      questionNumber: validated.questionNumber,
      questionName: validated.questionName,
      titleSlug: validated.titleSlug,
      approach: inputData.approach,
      source: validated.source,
      submittedFrom: 'cli'
    });

    console.log('');
    console.log(`Saved problem log to ${problemStore.getStorageMode() === 'mongo' ? 'MongoDB' : 'db.json'}`);
    console.log(JSON.stringify({
      id: savedLog.id,
      questionNumber: savedLog.questionNumber,
      questionName: savedLog.questionName,
      titleSlug: savedLog.titleSlug,
      approach: savedLog.approach,
      source: savedLog.source,
      submittedFrom: savedLog.submittedFrom,
      createdAt: savedLog.createdAt
    }, null, 2));
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('MongoDB Disconnected');
    }
  }
}

main().catch((error) => {
  console.error('CLI error:', error.message);
  process.exit(1);
});

const mongoose = require('mongoose');
const Problem = require('../models/Problem');

function buildProblemPayload(input) {
  return {
    questionNumber: Number(input.questionNumber),
    questionName: String(input.questionName || '').trim(),
    approach: String(input.approach || '').trim()
  };
}

function buildProblemResponse(problemDocument) {
  return problemDocument.toJSON();
}

async function createProblem(input) {
  const createdProblem = await Problem.create(buildProblemPayload(input));
  return buildProblemResponse(createdProblem);
}

async function listProblems() {
  const problems = await Problem.find().sort({ updatedAt: -1, createdAt: -1 });
  return problems.map(buildProblemResponse);
}

async function getProblemById(problemId) {
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return null;
  }

  const problem = await Problem.findById(problemId);
  return problem ? buildProblemResponse(problem) : null;
}

async function updateProblem(problemId, input) {
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return null;
  }

  const updatedProblem = await Problem.findOneAndUpdate(
    { _id: problemId },
    buildProblemPayload(input),
    { new: true, runValidators: true }
  );

  return updatedProblem ? buildProblemResponse(updatedProblem) : null;
}

async function deleteProblem(problemId) {
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return false;
  }

  const deletedProblem = await Problem.findByIdAndDelete(problemId);
  return Boolean(deletedProblem);
}

module.exports = {
  createProblem,
  listProblems,
  getProblemById,
  updateProblem,
  deleteProblem
};

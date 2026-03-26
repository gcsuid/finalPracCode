const leetcodeService = require('./leetcodeService');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeTitle(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function validateProblem({ questionNumber, questionName }) {
  const index = await leetcodeService.getProblemIndex();
  const entry = index.byNumber[String(questionNumber)];

  if (!entry) {
    throw createError('Problem number not found on LeetCode', 404);
  }

  if (normalizeTitle(entry.title) !== normalizeTitle(questionName)) {
    throw createError('questionName does not match the provided questionNumber on LeetCode', 400);
  }

  return {
    questionNumber: entry.questionNumber,
    questionName: entry.title,
    titleSlug: entry.titleSlug,
    source: 'leetcode'
  };
}

module.exports = {
  validateProblem
};

const problemMetadataService = require('../services/problemMetadataService');
const problemStore = require('../services/problemStore');

exports.logProblem = async (req, res) => {
  const { questionNumber, questionName, approach } = req.body;

  if (!questionNumber || !questionName || !approach) {
    return res.status(400).json({
      msg: 'Please provide questionNumber, questionName, and approach'
    });
  }

  try {
    const problemDetails = await problemMetadataService.validateProblem({
      questionNumber,
      questionName
    });

    const payload = {
      questionNumber: Number(problemDetails.questionNumber),
      questionName: problemDetails.questionName,
      titleSlug: problemDetails.titleSlug,
      approach,
      source: problemDetails.source || 'leetcode',
      submittedFrom: 'api'
    };

    const savedLog = await problemStore.createProblemLog(payload);

    res.status(201).json(savedLog);
  } catch (error) {
    console.error('Error in logProblem controller:', error.message);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ msg: error.message || 'Server Error while logging problem' });
  }
};

exports.listProblems = async (req, res) => {
  try {
    const logs = await problemStore.listProblemLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error in listProblems controller:', error.message);
    res.status(500).json({ msg: 'Server error while fetching problem logs' });
  }
};

exports.getProblemLog = async (req, res) => {
  try {
    const log = await problemStore.getProblemLogById(req.params.id);

    if (!log) {
      return res.status(404).json({ msg: 'Problem log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error in getProblemLog controller:', error.message);
    res.status(500).json({ msg: 'Server error while fetching problem log' });
  }
};

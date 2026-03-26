const problemStore = require('../services/problemStore');

function validatePayload(body) {
  const questionNumber = Number(body.questionNumber);
  const questionName = String(body.questionName || '').trim();
  const approach = String(body.approach || '').trim();

  if (!Number.isInteger(questionNumber) || questionNumber <= 0) {
    return 'questionNumber must be a positive integer';
  }

  if (!questionName) {
    return 'questionName is required';
  }

  if (!approach) {
    return 'approach is required';
  }

  return null;
}

exports.createProblem = async (req, res) => {
  const validationError = validatePayload(req.body);

  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  try {
    const savedProblem = await problemStore.createProblem(req.body);
    res.status(201).json(savedProblem);
  } catch (error) {
    console.error('Error in createProblem controller:', error.message);
    res.status(500).json({ msg: 'Server error while creating problem log' });
  }
};

exports.listProblems = async (req, res) => {
  try {
    const problems = await problemStore.listProblems();
    res.json(problems);
  } catch (error) {
    console.error('Error in listProblems controller:', error.message);
    res.status(500).json({ msg: 'Server error while fetching problem logs' });
  }
};

exports.getProblem = async (req, res) => {
  try {
    const problem = await problemStore.getProblemById(req.params.id);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem log not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Error in getProblem controller:', error.message);
    res.status(500).json({ msg: 'Server error while fetching problem log' });
  }
};

exports.updateProblem = async (req, res) => {
  const validationError = validatePayload(req.body);

  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  try {
    const updatedProblem = await problemStore.updateProblem(req.params.id, req.body);
    if (!updatedProblem) {
      return res.status(404).json({ msg: 'Problem log not found' });
    }

    res.json(updatedProblem);
  } catch (error) {
    console.error('Error in updateProblem controller:', error.message);
    res.status(500).json({ msg: 'Server error while updating problem log' });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const deleted = await problemStore.deleteProblem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Problem log not found' });
    }

    res.json({ msg: 'Problem log deleted' });
  } catch (error) {
    console.error('Error in deleteProblem controller:', error.message);
    res.status(500).json({ msg: 'Server error while deleting problem log' });
  }
};

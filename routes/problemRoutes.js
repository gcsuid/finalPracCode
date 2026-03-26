const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// @route   POST api/problems
// @desc    Log a problem
// @access  Public
router.post('/', problemController.logProblem);

// @route   GET api/problems
// @desc    Get logged problems
// @access  Public
router.get('/', problemController.listProblems);

// @route   GET api/problems/:id
// @desc    Get a single problem log
// @access  Public
router.get('/:id', problemController.getProblemLog);

module.exports = router;

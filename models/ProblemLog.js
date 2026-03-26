const mongoose = require('mongoose');

const ProblemLogSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true
  },
  questionName: {
    type: String,
    required: true
  },
  titleSlug: {
    type: String,
    required: true
  },
  approach: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    default: 'leetcode'
  },
  submittedFrom: {
    type: String,
    required: true,
    default: 'cli'
  }
}, { timestamps: true });

module.exports = mongoose.model('ProblemLog', ProblemLogSchema);

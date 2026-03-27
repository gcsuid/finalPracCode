const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
      min: 1
    },
    questionName: {
      type: String,
      required: true,
      trim: true
    },
    approach: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(document, returnedObject) {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
      }
    }
  }
);

module.exports = mongoose.model('Problem', problemSchema);

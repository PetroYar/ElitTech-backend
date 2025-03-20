import mongoose from "mongoose";

const Answer = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userAnswers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      answer: mongoose.Schema.Types.Mixed,
    },
  ],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
  },
});


Answer.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    this.duration = (this.endTime - this.startTime) / 1000; 
  }
  next();
});

export default mongoose.model("Answer", Answer);

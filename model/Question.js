import mongoose from "mongoose";

const Question = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "radio", "checkbox"],
      required: true,
    },
    options: [String],

    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Question", Question);

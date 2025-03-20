import mongoose from "mongoose";

const Survey = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: { type: String, required: true, unique: true },
    passCount: {
      type: Number,
      default: 0,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Survey", Survey);

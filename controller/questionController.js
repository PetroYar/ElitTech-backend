import Question from "../model/Question.js";

const questionController = {
  create: async (req, res) => {
    try {
      const { question, type, options, surveyId } = req.body;

      if (!question) {
        return res.status(400).json({ message: "question required" });
      }

      const newQuestion = new Question({
        question,
        type,
        options,
        surveyId,
      });

      await newQuestion.save();

      return res.stats(200).json({
        newQuestion,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },
};

export default questionController;

import Answer from "../model/Answer.js";

const answerController = {
  create: async (req, res) => {
    try {
      const { surveyId, userId, userAnswers, startTime, endTime } = req.body;

      if (!surveyId || !userId) {
        return res.status(400).json({ message: "All fields are required!" });
      }

      const newAnswer = new Answer({
        surveyId,
        userId,
        userAnswers,
        startTime,
        endTime,
      });

      await newAnswer.save();

      res.status(201).json(newAnswer);
    } catch (error) {
      console.error("Error saving answer:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getOne: async (req, res) => {
    try {
      const { id } = req.params;

      const answer = await Answer.findById(id).populate("userAnswers.question");

      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      const questionsWithAnswers = answer.userAnswers.map((userAnswer) => ({
        _id: userAnswer.question._id,
        question: userAnswer.question.question,
        answer: userAnswer.answer,
      }));

      return res.status(200).json({
        duration: answer.duration,
        questionsWithAnswers,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error retrieving answer", error });
    }
  },
};

export default answerController;

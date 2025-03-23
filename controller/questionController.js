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

      return res.status(200).json({
        newQuestion,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params; 
      const { question, type, options, surveyId } = req.body; 

      const existingQuestion = await Question.findById(id);

      if (!existingQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }

      existingQuestion.question = question || existingQuestion.question;
      existingQuestion.type = type || existingQuestion.type;
      existingQuestion.options = options || existingQuestion.options;
      existingQuestion.surveyId = surveyId || existingQuestion.surveyId;

      await existingQuestion.save();

     
      return res.status(200).json({
        message: "Question updated successfully",
        updatedQuestion: existingQuestion,
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

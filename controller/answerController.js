import Answer from "../model/Answer.js";
import Question from "../model/Question.js";
import Survey from "../model/Survey.js";

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
  getStats: async (req, res) => {
    try {
      const { surveyId } = req.params;

      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ error: "Опитування не знайдено" });
      }

      const questions = await Question.find({ surveyId });

      const questionMap = {};
      questions.forEach((question) => {
        questionMap[question._id.toString()] = question.question; 
      });

      const answers = await Answer.find({ surveyId });

      if (answers.length) {
        survey.passCount = answers.length;
        await survey.save();
      }

      const answersStats = {};
      answers.forEach(({ userAnswers }) => {
        userAnswers.forEach(({ question, answer }) => {
          const questionText = questionMap[question.toString()]; 
          if (!answersStats[questionText]) {
            answersStats[questionText] = {};
          }

          if (Array.isArray(answer)) {
            answer.forEach((opt) => {
              answersStats[questionText][opt] =
                (answersStats[questionText][opt] || 0) + 1;
            });
          } else {
            answersStats[questionText][answer] =
              (answersStats[questionText][answer] || 0) + 1;
          }
        });
      });

      const activityStats = {};
      answers.forEach(({ startTime }) => {
        const date = new Date(startTime).toISOString().split("T")[0];
        activityStats[date] = (activityStats[date] || 0) + 1;
      });

      const totalDuration = answers.reduce(
        (sum, { duration }) => sum + duration,
        0
      );
      const averageDuration = totalDuration / answers.length;

      res.json({
        passCount: survey.passCount,
        answersStats,
        activityStats,
        averageDuration,
        title: survey.title,
      });
    } catch (error) {
      res.status(500).json({ error: "Помилка отримання статистики" });
    }
  },
};

export default answerController;

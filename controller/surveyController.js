import slugify from "slugify";
import Survey from "../model/Survey.js";
import Question from "../model/Question.js";

const surveyController = {
  create: async (req, res) => {
    try {
      const { title, description, userId, questionCount } = req.body;

      if (!title || !userId) {
        return res
          .status(400)
          .json({ message: "Title and userId and description are required" });
      }

      const slugi = slugify(title, {
        replacement: "-",
        remove: /[*+~.()'"!:@]/g,
        lower: true,
      });

      const newSurvey = new Survey({
        title,
        description,
        questionCount,
        userId,
        slug: slugi,
      });

      await newSurvey.save();

      return res.status(200).json(newSurvey);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },
  getAllPagination: async (req, res) => {
    try {
      const { _limit = 15, _start = 0, _order = "desc" } = req.query;
      const limit = parseInt(_limit, 10);
      const start = parseInt(_start, 10);
      const sortOrder = _order === "desc" ? -1 : 1;
      const currentPage = Math.floor(start / limit) + 1;

      const result = await Survey.aggregate([
        {
          $facet: {
            totalCount: [{ $count: "count" }],
            surveys: [
              { $sort: { createdAt: sortOrder } },
              { $skip: start },
              { $limit: limit },
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $lookup: {
                  from: "answers",
                  localField: "_id",
                  foreignField: "surveyId",
                  as: "answers",
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  slug: 1,
                  questionCount: 1,
                  passCount: { $size: "$answers" },
                  createdAt: 1,
                  userId: 1,
                  user: { $arrayElemAt: ["$user", 0] },
                },
              },
              {
                $addFields: {
                  userName: { $ifNull: ["$user.username", "Unknown"] },
                },
              },
            ],
          },
        },
      ]);

      const totalSurveys = result[0].totalCount[0]?.count || 0;
      const surveys = result[0].surveys;
      const totalPages = Math.ceil(totalSurveys / limit);

      res.status(200).json({
        firstPage: 1,
        lastPage: totalPages,
        currentPage,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        surveys,
        _limit: limit,
        _start: start,
        _order: _order,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error retrieving surveys", error });
    }
  },

  delete: async (req, res) => {
    // const userId = req.user.id;

    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const survey = await Survey.findById(id);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }

      // if (survey.userId.toString() !== userId.toString()) {
      //   return res.status(403).json({ message: "Not authorized" });
      // }

      const deletedSurvey = await Survey.findByIdAndDelete(id);
      if (!deletedSurvey) {
        return res.status(404).json({ message: "Survey not found" });
      }

      await Question.deleteMany({ surveyId: id });

      res.status(200).json({ message: "Survey deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting survey", error });
    }
  },
  getSurveyBySlug: async (req, res) => {
    try {
      const { slug } = req.params;

      const result = await Survey.aggregate([
        {
          $match: { slug: slug },
        },
        {
          $lookup: {
            from: "questions",
            localField: "_id",
            foreignField: "surveyId",
            as: "questions",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            slug: 1,
            createdAt: 1,
            questions: 1, // Включаємо питання
          },
        },
      ]);

      if (!result || result.length === 0) {
        return res.status(404).json({ message: "Survey not found" });
      }

      const survey = result[0];

      res.status(200).json({
        _id: survey._id,
        title: survey.title,
        description: survey.description,
        createdAt: survey.createdAt,
        questions: survey.questions,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error retrieving survey", error });
    }
  },
 getSurveysByUser: async (req, res) => {
  try {
    const { id } = req.params; 

    const surveys = await Survey.find({ userId: id }, { _id: 1, title: 1 });

    res.status(200).json(surveys);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error retrieving surveys", error });
  }
},


  update: async (req, res) => {
    try {
      const { slug } = req.params;
      const { title, description, questionCount } = req.body;

      if (!slug) {
        return res.status(400).json({ message: "Survey slug is required" });
      }

      const survey = await Survey.findOne({ slug });
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }

      if (title) survey.title = title;
      if (description) survey.description = description;
      if (questionCount !== undefined) survey.questionCount = questionCount;

      await survey.save();

      return res.status(200).json({ message: "Survey updated successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },
};

export default surveyController;

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import surveyRouter from "./routes/survayRoute.js";
import questionRouter from "./routes/questionRoute.js";
import answerRouter from "./routes/answerRoute.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());



app.use("/api", authRouter);
app.use("/api/survey", surveyRouter);
app.use("/api/question", questionRouter);
app.use("/api/answer", answerRouter);

const startApp = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@elit.jt7wa.mongodb.net/`
    );
    app.listen(5000, () => {
      console.log("server ok");
    });
  } catch (error) {
    console.log(error);
  }
};

startApp();

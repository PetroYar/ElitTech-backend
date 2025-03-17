import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("<h1>Сервер працює! 🚀</h1>");
});

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

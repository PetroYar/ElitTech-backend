import { Router } from "express";
import surveyController from "../controller/surveyController.js";

const surveyRouter = Router();

surveyRouter.post("/", surveyController.create);
surveyRouter.get("/", surveyController.getAll);
surveyRouter.get("/questions/:slug", surveyController.getSurveyBySlug);

surveyRouter.delete("/:id", surveyController.delete);


export default surveyRouter;

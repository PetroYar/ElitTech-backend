import { Router } from "express";
import surveyController from "../controller/surveyController.js";

const surveyRouter = Router();

surveyRouter.post("/", surveyController.create);
surveyRouter.get("/", surveyController.getAllPagination);
surveyRouter.get("/:id", surveyController.getSurveysByUser);

surveyRouter.get("/questions/:slug", surveyController.getSurveyBySlug);
surveyRouter.put("/:slug", surveyController.update);
surveyRouter.delete("/:id", surveyController.delete);

export default surveyRouter;

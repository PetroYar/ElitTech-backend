import { Router } from "express";
import questionController from "../controller/questionController.js";

const questionRouter = Router();

questionRouter.post("/", questionController.create);
// questionRouter.get("/", questionController.getAllBySurveyId);
questionRouter.put('/:id',questionController.update)
export default questionRouter;

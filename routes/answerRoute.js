import { Router } from "express";
import answerController from "../controller/answerController.js";

const answerRouter = Router();

answerRouter.post("/", answerController.create);
answerRouter.get("/stats/:surveyId", answerController.getStats);
answerRouter.get("/:id", answerController.getOne);

export default answerRouter;

import { Router } from "express";
import questionController from "../controller/questionController.js";

const questionRouter = Router();

questionRouter.post("/", questionController.create);

questionRouter.put('/:id',questionController.update)
export default questionRouter;

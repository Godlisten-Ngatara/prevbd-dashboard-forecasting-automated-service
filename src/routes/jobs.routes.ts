import express from "express";
import { createForecastJob } from "../controllers/forecast.controllers.js";
const jobsRouter = express.Router();

jobsRouter.post("/jobs", createForecastJob);

export default jobsRouter;
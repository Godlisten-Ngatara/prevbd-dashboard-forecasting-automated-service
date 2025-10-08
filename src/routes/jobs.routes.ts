import express from "express";
import { createForecastJob, getJobs, getPredictions } from "../controllers/jobs.controllers.js";
const jobsRouter = express.Router();

jobsRouter.post("/jobs", createForecastJob);
jobsRouter.get("/jobs/all", getJobs)
jobsRouter.get("/predictions", getPredictions)

export default jobsRouter;
import express from "express";
import { json } from "express";
import cors from 'cors';
import jobsRouter from "./routes/jobs.routes.js";
import { startForecastWorker } from "./utils/worker.js";
import { startForecastQueueEvents } from "./utils/tracker.js";
import eventsRouter from "#routes/events.routes.js";
const app = express();

const port = process.env.PORT ?? "9001";
app.use(json());
app.use(cors())
app.use("/api/v1", jobsRouter);
app.use("/api/v1", eventsRouter)
startForecastWorker();
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
import express from "express";
import { json } from "express";
import jobsRouter from "./routes/jobs.routes.js";
import { startForecastWorker } from "./utils/worker.js";
import { startForecastQueueEvents } from "./utils/tracker.js";
const app = express();

const port = process.env.PORT ?? "9001";
app.use(json());

app.use("/api/v1", jobsRouter);

startForecastWorker();
startForecastQueueEvents();
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
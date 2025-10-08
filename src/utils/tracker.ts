import { QueueEvents } from "bullmq";
import redisConn from "../config/redisConn.js";

export const startForecastQueueEvents = () => {
  const queueEvents = new QueueEvents("forecastQueue", {
    connection: redisConn,
  });

  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`[Event] Job ${jobId} completed with:`, returnvalue);

  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.log(`[Event] Job ${jobId} failed:`, failedReason);
  });
  queueEvents.on("active", ({ jobId }) => {
    console.log(`[Event] Job ${jobId} inprogress`);
  });
};

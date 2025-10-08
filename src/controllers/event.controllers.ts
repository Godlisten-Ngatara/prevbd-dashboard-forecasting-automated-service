import redisConn from "#config/redisConn.js";
import { QueueEvents } from "bullmq";

export const getJobEvents = async (req: any, res: any) => {
  console.log("hello");
  
  const { jobId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvents = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const queueEvents = new QueueEvents("forecastQueue", {
    connection: redisConn,
  });

  queueEvents.on("waiting", ({ jobId: id }) => {
    if (id === jobId) sendEvents("waiting", { status: "waiting" });
  });

  queueEvents.on("active", ({ jobId: id }) => {
    if (id === jobId) sendEvents("active", { status: "in_progress" });
  });

  queueEvents.on("completed", ({ jobId: id, returnvalue }) => {
    if (id === jobId)
      sendEvents("completed", { status: "completed", result: returnvalue });
  });

  queueEvents.on("failed", ({ jobId: id, failedReason }) => {
    if (id === jobId) sendEvents("failed", { status: "failed", error: failedReason });
  });
};

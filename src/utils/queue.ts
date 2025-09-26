import { Job, Queue } from "bullmq";
import { Step } from "#types/index.js";
import redisConn from "../config/redisConn.js";

const forecastQueue = new Queue("forecastQueue", {
  connection: redisConn,
});

async function addJob(job: {name: string, jobData: any, step: Step}) {
  const res = await forecastQueue.add(job.name, job);
  return res
}

export default addJob;
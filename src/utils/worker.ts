import { Worker } from "bullmq";
import redisConn from "../config/redisConn.js";
import { getClimateData } from "./dhis2Client.js";

export const startForecastWorker = () => {
  const forecastWorker = new Worker(
    "forecastQueue",
    async (job) => {
      console.log(`Processing job ${job.id} with data:`, job.data);
      if (!job.data.startDate || !job.data.endDate) {
        throw new Error("Missing startDate or endDate in job data");
      }
      try {
        const climateData = await getClimateData(
          job.data.startDate,
          job.data.endDate
        );
        console.log({
          message: `Job ${job.id} completed.`,
          data: JSON.stringify(climateData, null, 2),
        });
        return { result: "success" };
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        throw new Error(`Failed to process job ${job.id}`);
      }
    },
    {
      connection: redisConn,
    }
  );
};

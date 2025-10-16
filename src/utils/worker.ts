import { Job, Worker } from "bullmq";
import redisConn from "../config/redisConn.js";
import { getClimateData } from "#jobs/fetchClimateData.js";
import { formatDhis2Data } from "#jobs/formatDhis2Data.js";
import { getForecastedAbundance } from "#jobs/fetchForecastedData.js";
import { Step } from "#types/index.js";
import { formatModelRes } from "#jobs/formatModelResults.js";
const processJob = async (job: Job) => {
  let step = job.data.step;
  console.log(step);
  
  while (step != Step.FINAL) {
    console.log(`Processing step ${step}`);

    switch (step) {
      case Step.INITIAL:
        {
          const cliData = await getClimateData(
            job.data.jobData.from,
            job.data.jobData.to
          );
          await job.updateData({
            jobData: cliData,
            step: Step.SECOND,
          });
          step = Step.SECOND;
        }
        break;
      case Step.SECOND:
        {
          const formattedData = await formatDhis2Data(job.data.jobData);
          await job.updateData({
            jobData: formattedData,
            step: Step.THIRD,
          });
          step = Step.THIRD;
        }
        break;
      case Step.THIRD:
        {
          const modelRes = await getForecastedAbundance(
            job.data.jobData.csvOutput_cliData,
            job.data.jobData.csvOutput_entData
          );
          await job.updateData({
            jobData: modelRes,
            step: Step.FOURTH,
          });
          step = Step.FOURTH;
        }
        break;
      case Step.FOURTH:
        {
          const formattedModelRes = await formatModelRes(
            job.data.jobData.forecasted_results
          );
          await job.updateData({
            jobData: formattedModelRes,
            step: Step.FIFTH,
          });
          step = Step.FIFTH;
        }
        break;
      default:
        break;
    }
  }
};
export const startForecastWorker = () => {
  const forecastWorker = new Worker("forecastQueue", processJob, {
    connection: redisConn,
  });
  forecastWorker.on("progress", (job, err) => {
    console.log("In progress");
  });
  forecastWorker.on("completed", () => {
    console.log("completed");
  });
  forecastWorker.on("failed", () => {
    console.log("Failed");
  });
};

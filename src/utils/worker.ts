import { Job, Worker } from "bullmq";
import redisConn from "../config/redisConn.js";
import { getClimateData } from "#jobs/fetchClimateData.js";
import { formatDhis2Data } from "#jobs/formatDhis2Data.js";
import { getForecastedAbundance } from "#jobs/fetchForecastedData.js";
import { Step } from "#types/index.js";
import { formatModelRes } from "#jobs/formatModelResults.js";
import { importForecastedResults } from "#jobs/importForecastedData.js";
import { runAnalytics } from "#jobs/runAnalytics.js";
import { getOrgUnits } from "#jobs/getOrgUnits.js";
const processJob = async (job: Job) => {
  let step = job.data.step;
  console.log(step);

  while (step != Step.FINAL) {
    switch (step) {
      case Step.INITIAL:
        {
          const orgUnits = await getOrgUnits(
            job.data.jobData.orgUnit
          );
          await job.updateData({
            jobData: {
              orgUnits: orgUnits,
              from: job.data.jobData.from,
              to: job.data.jobData.to
            },
            step: Step.THIRD,
          });
          step = Step.THIRD;
        }
        break;
      case Step.SECOND:
        {
          const cliData = await getClimateData(
            job.data.jobData.from,
            job.data.jobData.to,
            job.data.jobData.orgUnits
          );
          await job.updateData({
            jobData: cliData,
            step: Step.THIRD,
          });
          step = Step.THIRD;
        }
        break;
      case Step.THIRD:
        {
          const formattedData = await formatDhis2Data(job.data.jobData);
          await job.updateData({
            jobData: formattedData,
            step: Step.FOURTH,
          });
          step = Step.FOURTH;
        }
        break;
      case Step.FOURTH:
        {
          const modelRes = await getForecastedAbundance(
            job.data.jobData.csvOutput_cliData,
            job.data.jobData.csvOutput_entData
          );
          await job.updateData({
            jobData: modelRes,
            step: Step.FIFTH,
          });
          step = Step.FIFTH;
        }
        break;
      case Step.FIFTH:
        {
          const formattedModelRes = formatModelRes(
            job.data.jobData.forecasted_results
          );
          console.log(formattedModelRes);

          await job.updateData({
            jobData: formattedModelRes,
            step: Step.SIXTH,
          });
          step = Step.SIXTH;
        }
        break;
      case Step.SIXTH: {
        console.log("job.data.jobData before import:", job.data.jobData);

        await importForecastedResults(job.data.jobData);

        await job.updateData({ step: Step.FINAL });
        step = Step.FINAL;
      }

      case Step.FINAL:
        {
          console.log("hello 2");

          await runAnalytics();
        }
        break;
      default:
        break;
    }
  }
  return "Done";
};
export const startForecastWorker = () => {
  const forecastWorker = new Worker("forecastQueue", processJob, {
    connection: redisConn,
  });
  forecastWorker.on("progress", (job, err) => {
    console.log("In progress");
  });
  forecastWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
    console.error("Stack:", err.stack);
    console.error("Job data:", job?.data);
  });

  // forecastWorker.on("completed", () => {
  //   console.log("completed");
  // });
};

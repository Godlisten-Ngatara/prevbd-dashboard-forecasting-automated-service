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
import getLogger from "../../logger.js";
const processJob = async (job: Job) => {
  let step = job.data.step;
  const jobLogger = getLogger(job.id || "");
  jobLogger.info(`Job with id ${job.id} has started`);

  while (step != Step.FINAL) {
    switch (step) {
      case Step.INITIAL:
        {
          const orgUnits = await getOrgUnits(job.data.jobData.orgUnit, jobLogger);
          await job.updateData({
            jobData: {
              orgUnits: orgUnits,
              from: job.data.jobData.from,
              to: job.data.jobData.to,
            },
            step: Step.SECOND,
          });
          step = Step.SECOND;
        }
        break;
      case Step.SECOND:
        {
          const cliData = await getClimateData(
            job.data.jobData.from,
            job.data.jobData.to,
            job.data.jobData.orgUnits,
            jobLogger
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
          const formattedData = await formatDhis2Data(job.data.jobData, jobLogger);
          await job.updateData({
            jobData: formattedData,
            step: Step.FOURTH,
          });
          step = Step.FOURTH;
        }
        break;
      case Step.FOURTH:
        {
          const modelRes = await getForecastedAbundance(job.data.jobData, jobLogger);
          await job.updateData({
            jobData: modelRes,
            step: Step.FIFTH,
          });
          step = Step.FIFTH;
        }
        break;
      case Step.FIFTH:
        {
          const formattedModelRes = formatModelRes(job.data.jobData, jobLogger);

          await job.updateData({
            jobData: formattedModelRes,
            step: Step.SIXTH,
          });
          step = Step.SIXTH;
        }
        break;
      case Step.SIXTH:
        {
          console.log("job.data.jobData before import:", job.data.jobData);

          const res = await importForecastedResults(job.data.jobData, jobLogger);
          if (!res.successful) {
            throw new Error(`Import failed: ${res.message}`);
          }
          await job.updateData({ step: Step.FINAL });
          step = Step.FINAL;
        }
        break;
      default:
        break;
    }
  }
  if (step === Step.FINAL) {
    await runAnalytics(jobLogger);
    return {
      successful: true,
      status: "Completed",
      message: `Job with id ${job.id} completed successfully`,
    };
  }
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
};

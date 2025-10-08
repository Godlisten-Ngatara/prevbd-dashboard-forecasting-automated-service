import addJob, { forecastQueue } from "#utils/queue.js";
import { Step } from "#types/index.js";
import { Request, Response } from "express";
export const createForecastJob = async (req: any, res: any) => {
  try {
    const { startDate, endDate, orgUnit, name } = req.body || {};

    const job = await addJob({
      name: name,
      jobData: {
        from: startDate,
        to: endDate,
        orgUnit: orgUnit,
      },
      step: Step.INITIAL,
    });

    res.status(200).json({
      message: "Job queued successfully",
      data: {
        id: job.id,
        name: job.name,
        created: job.timestamp,
        status: await forecastQueue.getJobState(job?.id || "pending"),
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      message: "Failed to queue job",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await forecastQueue.getJobs(["active", "completed", "delayed", "failed", "paused", "waiting", ]);

    // 3️⃣ Map each job to a clean JSON structure with metadata + status
    const formattedJobs = await Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState(); // fetch status from Redis
        const json = job.toJSON();

        return {
          id: job.id,
          name: job.name,
          status: state,
          createdAt: json.timestamp,
          startedAt: json.processedOn
            ? new Date(json.processedOn).toISOString()
            : null,
          endedAt: json.finishedOn
            ? new Date(json.finishedOn).toISOString()
            : null,
          attemptsMade: job.attemptsMade,
          progress: job.progress,
          data: job.data, // input payload
          returnvalue: json.returnvalue || null, // result from worker
          failedReason: json.failedReason || null,
        };
      })
    );

    // 4️⃣ Return structured response
    res.status(200).json({
      count: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (err) {
    console.error("Error retrieving all jobs:", err);
    res.status(500).json({ error: "Failed to retrieve jobs" });
  }
};

export const getPredictions = async (req: any, res: any) => {
  try {
    // 1. Get completed jobs from BullMQ
    const completedJobs = await forecastQueue.getJobs(["completed"]);

    // 2. Map into clean JSON structure
    const formattedJobs = await Promise.all(
      completedJobs.map(async (job) => {
        const state = await job.getState(); // "completed"
        const json = job.toJSON();

        return {
          id: job.id,
          name: job.name,
          status: state,
          startedAt: json.processedOn
            ? new Date(json.processedOn).toISOString()
            : null,
          endedAt: json.finishedOn
            ? new Date(json.finishedOn).toISOString()
            : null,
          attemptsMade: job.attemptsMade,
          progress: job.progress,
          data: job.data, // original job data (input)
          returnvalue: json.returnvalue, // result from the worker
          failedReason: json.failedReason || null,
        };
      })
    );

    // 3. Return structured response
    res.status(200).json({
      count: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (err) {
    console.error("Error retrieving completed jobs:", err);
    res.status(500).json({ error: "Failed to retrieve completed jobs" });
  }
};

import addJob from "#utils/queue.js";
import { Step } from "#types/index.js";
import { Request, Response } from "express";
export const createForecastJob = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body || {};

    const job = await addJob({
      name: "forecast",
      jobData: {
        from: startDate,
        to: endDate
      },
      step: Step.INITIAL
    });

    res.status(200).json({
      message: "Job queued successfully",
      jobId: job.id,
    });
  } catch (err: unknown) {
    res.status(500).json({
      message: "Failed to queue job",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

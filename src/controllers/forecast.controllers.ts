import forecastQueue from "../utils/queue.js";
import { Request, Response } from "express";
import { getClimateData  } from "../utils/dhis2Client.js";
export const createForecastJob = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body || {};

    const job = await forecastQueue.add("forecastJob", { startDate, endDate });

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
}

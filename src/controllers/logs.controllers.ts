import fs from "fs";
import path from "path";

export const getLogsById = (req: any, res: any) => {
  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ error: "Missing jobId parameter" });
  }

  // Dynamically build the log file path
  const logPath = path.join(process.cwd(), "logs", `job-${jobId}.log`);

  try {
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: `No logs found for jobId: ${jobId}` });
    }

    const logData = fs.readFileSync(logPath, "utf-8");

    // Return the raw log content
    return res.type("text/plain").send(logData);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to read logs",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

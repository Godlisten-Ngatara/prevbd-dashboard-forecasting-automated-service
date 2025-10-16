// logger.js
import pino from "pino";
import path from "path";
import fs from "fs";

function getLogger(jobId: string) {
  if (!jobId) throw new Error("jobId is required for logger");

  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const logPath = path.join(logDir, `job-${jobId}.log`);

  return pino({
    level: process.env.LOG_LEVEL || "info",
    transport: {
      target: "pino-pretty",
      options: {
        destination: logPath,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        colorize: false,
      },
    },
    base: null,
  });
}

export default getLogger;

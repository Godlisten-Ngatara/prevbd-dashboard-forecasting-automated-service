import { Dhis2ImportData } from "#types/index.js";

const baseUrl = process.env.PREVBD_BASE_API_URI ?? "";
const endpoint = "/resourceTables/analytics";

const targetUrl = `${baseUrl}${endpoint}`;
export const runAnalytics = async (jobLogger: any) => {
  jobLogger.info(`Running Analytics Tables...`);
  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.PREVBD_API_USER}:${process.env.PREVBD_API_PASSWORD}`
        ).toString("base64")}`,
      },
    });
    const result: any = await res.json();
    const statusCode = result.httpStatusCode;
    const failReason = result.message
    if (statusCode !== 200) {
      throw new Error("Analytics failed", {
        cause: failReason,
      });
    }
    return {
      successful: true,
      status: "Successful",
      message: "Analytics Tables run successfully",
      result,
    };
  } catch (error: any) {
    jobLogger.info(error, "Error running Analytics Tables");
    return {
      successful: false,
      status: "Failed",
      message: error instanceof Error ? error.message : "unknown error",
      reason: error?.cause,
    };
  }
};

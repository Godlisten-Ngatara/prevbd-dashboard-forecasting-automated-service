import { Dhis2ImportData } from "#types/index.js";

const baseUrl = process.env.PREVBD_BASE_API_URI ?? "";
const endpoint = "/dataValueSets";

const targetUrl = `${baseUrl}${endpoint}`;
export const importForecastedResults = async (
  forecastedResults: Dhis2ImportData, jobLogger: any
) => {
  try {
    jobLogger.info(`Importing forecasted results to DHIS2...`);
    const res = await fetch(targetUrl, {
      method: "POST",
       headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.PREVBD_API_USER}:${process.env.PREVBD_API_PASSWORD}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forecastedResults),
    });
    if (!res.ok) {
      throw new Error("API request failed");
    }
    const result: any = await res.json()
    const statusCode = result.httpStatusCode
    const successMes = result.response?.description
    const failReason = result.response.conflicts?.[0]?.value || "Unknown reason"
    if (statusCode !== 200) {
      throw new Error("Importing forecasted data failed", {cause: failReason});
    }
    return {
      successful: true,
      status: "successful",
      message: successMes,
      result
    };
  } catch (error: any) {
    jobLogger.error(error, "Error importing forecasted results to DHIS2");
    return {
      successful: false,
      status: "Failed",
      message: error instanceof Error ? error.message : "unknown error",
      reason: error?.cause
    };
  }
};

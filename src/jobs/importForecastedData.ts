import { Dhis2ImportData } from "#types/index.js";

const baseUrl = process.env.PREVBD_BASE_API_URI ?? "";
const endpoint = "/dataValueSets";

const targetUrl = `${baseUrl}${endpoint}`;
export const importForecastedResults = async (
  forecastedResults: Dhis2ImportData
) => {
  try {
    console.log(targetUrl);
    console.log(JSON.stringify(forecastedResults))
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
    const result = res.json()
    const status = res.status
    console.log("import result: ", result);
    console.log("import status: ", status);
    return {
      status: "succesfull",
      message: "message"
    };
  } catch (error: any) {
    console.error((error as Error).stack);
    
    return {
      status: "Failed",
      message: error.message,
    };
  }
};

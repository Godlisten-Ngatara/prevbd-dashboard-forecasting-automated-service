import { Dhis2ImportData } from "#types/index.js";

const baseUrl = process.env.PREVBD_BASE_API_URI ?? "";
const endpoint = "/resourceTables/analytics";

const targetUrl = `${baseUrl}${endpoint}`;
export const runAnalytics = async () => {
  console.log("hey");

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.PREVBD_API_USER}:${process.env.PREVBD_API_PASSWORD}`
        ).toString("base64")}`,
      },
    });
    const result = res.text()
    const status = res.status
    console.log("analytics result: ", result);
    console.log("status: ", status);
    if (!res.ok) {
      throw new Error("Run Analytics failed");
    }
    console.log("excellent");

    return {
      status: "succesfull",
    };
  } catch (error: any) {
    return {
      status: "Failed",
      message: error.message,
    };
  }
};

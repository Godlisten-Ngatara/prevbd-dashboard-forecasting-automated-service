import {
  organizationUnitsMetaData,
  dataElementsMetaData,
} from "../utils/dhis2MetaData.js";
import { getPeriods } from "#utils/helpers.js";
const baseUrl =
  process.env.PREVBD_BASE_API_URI || "https://prevbd.org/prevbd/api";

export const getClimateData = async (startDate: string, endDate: string) => {
  const endpoint = "/analytics.json";
  const periods = getPeriods(startDate, endDate);
  const periodString = periods.join(";");
  const dataElements = dataElementsMetaData.map((el) => el.id);
  const dataElementsString = dataElements.join(";");
  const orgUnits = organizationUnitsMetaData.map((unit) => unit.ouId);
  const orgUnitsString = orgUnits.join(";");
  console.log(`Fetching data for periods: ${periodString}`);

  const queryParams = {
    dimension: [
      `pe:${periodString}`,
      `dx:${dataElementsString}`,
      `ou:${orgUnitsString}`,
    ],
    aggregationType: "SUM",
  };
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");

  const targetUrl = `${baseUrl}/${endpoint}?${queryString}`;
  try {
    // Specify basic authentication headers if required by the API
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.PREVBD_API_USER}:${process.env.PREVBD_API_PASSWORD}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching data: ${response.status} ${response.statusText} \nURL: ${targetUrl}`
      );
    }
    const data: any = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

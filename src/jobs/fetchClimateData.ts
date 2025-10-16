import {
  organizationUnitsMetaData,
  dataElementsMetaData,
} from "../utils/dhis2MetaData.js";
import { getPeriods } from "#utils/helpers.js";
import { OrgUnitResponse } from "#types/index.js";
import { response } from "express";
import logger from "../../logger.js";
const baseUrl =
  process.env.PREVBD_BASE_API_URI || "https://prevbd.org/prevbd/api";

export const getClimateData = async (
  startDate: string,
  endDate: string,
  orgUnits: OrgUnitResponse,
  jobLogger: any
) => {
  const { organisationUnits } = orgUnits;
  // console.log(organisationUnits);

  const endpoint = "/analytics.json";
  const periods = getPeriods(startDate, endDate);
  const periodString = periods.join(";");
  const dataElements = dataElementsMetaData.map((el) => el.id);
  const dataElementsString = dataElements.join(";");
  const orgUnitsString =
    organisationUnits.length > 1
      ? organisationUnits?.map((ou) => ou.id).join(";")
      : organisationUnits?.map((ou) => ou.id).toString();

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
    jobLogger.info(`Getting climate data from DHIS2 API...`);
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
    // console.log(data);
    if (data?.rows.length === 0) {
      throw new Error(`No climate data found for the specified period`);
      
    }
    return {
      successful: true,
      data: {
        orgUnits: organisationUnits,
        climate: data,
      },
    };
  } catch (error) {
    jobLogger.info(error,`No climate data found for the specified period`);
    throw error
  }
};

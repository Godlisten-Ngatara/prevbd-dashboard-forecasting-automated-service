import Papa from "papaparse";
import fs from "fs";
import path from "path";
import {
  organizationUnitsMetaData,
  dataElementsMetaData,
} from "./dhis2MetaData.js";
import { ClimateDataRecord, EntomologyDataRecord } from "#types/index.js";

export const getPeriods = (startDate: string, endDate: string): string[] => {
  const startDt = parseInt(startDate, 10);
  const endDt = parseInt(endDate, 10);
  const periods: string[] = [];
  for (let period = startDt; period <= endDt; period++) {
    const year_id = period.toString().slice(0, 4);
    const month_id = period.toString().slice(4, 6);
    if (parseInt(month_id) > 12) {
      // add 1 to the year id and reset month to 01 and reset the period to the new value
      const new_year_id = (parseInt(year_id) + 1).toString();
      periods.push(new_year_id.toString() + "01");
      period = parseInt(new_year_id + "01"); // -1 because of the for loop increment
    } else {
      periods.push(period.toString());
    }
  }
  return periods;
};
